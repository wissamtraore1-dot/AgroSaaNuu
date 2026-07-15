from datetime import timedelta
from decimal import Decimal

from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.authentication.models import User
from apps.products.models import Produit
from apps.wallet.services import obtenir_ou_creer_wallet, deposer, bloquer_sequestre
from .models import Commande, LitigeCommande


class LitigeResolutionTestCase(APITestCase):
    """
    Vérifie le déplacement d'argent en séquestre lors de la résolution d'un
    litige par un admin : remboursement acheteur, libération vendeur, partage,
    fermeture sans action — et que ces actions sont bien réservées aux admins.
    """

    def setUp(self):
        self.client = APIClient()
        self.acheteur = User.objects.create_user(
            email='acheteur@agrosaanuu.com', password='testpass123',
            telephone='0197000010', prenom='Acheteur', nom='Test',
            cip='20000001', role='BUYER',
        )
        self.vendeur = User.objects.create_user(
            email='vendeur@agrosaanuu.com', password='testpass123',
            telephone='0197000011', prenom='Vendeur', nom='Test',
            cip='20000002', role='SELLER',
        )
        self.admin = User.objects.create_user(
            email='admin@agrosaanuu.com', password='testpass123',
            telephone='0197000012', prenom='Admin', nom='Test',
            cip='20000003', role='BUYER', is_staff=True,
        )
        self.produit = Produit.objects.create(
            vendeur=self.vendeur, nom='Maïs', prix=1000,
            quantite=100, localisation='Cotonou', ville='Cotonou',
        )

        # Fonds de l'acheteur déjà bloqués en séquestre (paiement reçu avant le litige)
        deposer(self.acheteur, Decimal('20000'), mode='MTN')

        self.litige_url_tmpl = '/api/v1/orders/problemes/{}/resoudre/'
        self.liste_url       = '/api/v1/orders/problemes/'

    def _creer_commande_et_litige(self):
        commande = Commande.objects.create(
            acheteur=self.acheteur, vendeur=self.vendeur, produit=self.produit,
            quantite=10, prix_unitaire=1000, montant_produit=10000,
            frais_livraison=0, commission=200, montant_total=10200,
            montant_vendeur=10000, mode_paiement=Commande.ModePaiement.MTN,
            statut=Commande.Statut.LITIGE,
            adresse_livraison='Cotonou', telephone_livraison='0197000010',
        )
        bloquer_sequestre(commande)
        litige = LitigeCommande.objects.create(
            commande=commande, plaignant=self.acheteur,
            description='Produit non conforme.',
        )
        return commande, litige

    def test_liste_litiges_reservee_admin(self):
        self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.acheteur)
        response = self.client.get(self.liste_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_date_limite_traitement_est_72h_apres_creation(self):
        _, litige = self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.acheteur)
        response = self.client.get('/api/v1/orders/mes-problemes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item = response.data['results'][0] if 'results' in response.data else response.data[0]
        attendu = litige.created_at + timedelta(hours=72)
        self.assertEqual(
            parse_datetime(item['date_limite_traitement']),
            attendu,
        )

    def test_liste_litiges_visible_par_admin(self):
        _, litige = self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.liste_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [str(l['id']) for l in response.data]
        self.assertIn(str(litige.id), ids)

    def test_rembourser_acheteur_debloque_les_fonds(self):
        commande, litige = self._creer_commande_et_litige()
        wallet_acheteur_avant = obtenir_ou_creer_wallet(self.acheteur)
        solde_avant = wallet_acheteur_avant.solde

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'REMBOURSER_ACHETEUR',
            'commentaire': 'Produit non conforme confirmé.',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        wallet_acheteur_avant.refresh_from_db()
        self.assertEqual(wallet_acheteur_avant.solde_bloque, Decimal('0.00'))
        self.assertEqual(wallet_acheteur_avant.solde, solde_avant)  # argent jamais sorti du wallet

        commande.refresh_from_db()
        litige.refresh_from_db()
        self.assertEqual(commande.statut, Commande.Statut.ANNULEE)
        self.assertEqual(litige.statut, LitigeCommande.Statut.RESOLU)

    def test_liberer_vendeur_paie_le_vendeur(self):
        commande, litige = self._creer_commande_et_litige()
        wallet_vendeur = obtenir_ou_creer_wallet(self.vendeur)
        solde_vendeur_avant = wallet_vendeur.solde

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'LIBERER_VENDEUR',
            'commentaire': 'Réclamation acheteur non fondée.',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        wallet_vendeur.refresh_from_db()
        self.assertEqual(wallet_vendeur.solde, solde_vendeur_avant + commande.montant_vendeur)

        wallet_acheteur = obtenir_ou_creer_wallet(self.acheteur)
        wallet_acheteur.refresh_from_db()
        self.assertEqual(wallet_acheteur.solde_bloque, Decimal('0.00'))

        commande.refresh_from_db()
        self.assertEqual(commande.statut, Commande.Statut.PAIEMENT_LIBERE)

    def test_partager_repartit_selon_montant_saisi(self):
        commande, litige = self._creer_commande_et_litige()
        wallet_vendeur  = obtenir_ou_creer_wallet(self.vendeur)
        wallet_acheteur = obtenir_ou_creer_wallet(self.acheteur)
        solde_vendeur_avant  = wallet_vendeur.solde
        solde_acheteur_avant = wallet_acheteur.solde

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'PARTAGER',
            'commentaire': 'Litige partiellement fondé.',
            'montant_acheteur': '4200',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        wallet_vendeur.refresh_from_db()
        wallet_acheteur.refresh_from_db()

        # 10200 total, 4200 remboursé à l'acheteur (reste dans son solde, débloqué),
        # 6000 quitte définitivement son solde pour être versés au vendeur.
        self.assertEqual(wallet_acheteur.solde, solde_acheteur_avant - Decimal('6000'))
        self.assertEqual(wallet_acheteur.solde_bloque, Decimal('0.00'))
        self.assertEqual(wallet_vendeur.solde, solde_vendeur_avant + Decimal('6000'))

    def test_partager_sans_montant_est_rejete(self):
        _, litige = self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'PARTAGER',
            'commentaire': 'Litige partiellement fondé.',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fermer_laisse_les_fonds_bloques(self):
        commande, litige = self._creer_commande_et_litige()
        wallet_acheteur = obtenir_ou_creer_wallet(self.acheteur)
        solde_bloque_avant = wallet_acheteur.solde_bloque

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'FERMER',
            'commentaire': 'Litige classé sans suite, en attente de vérification manuelle.',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        wallet_acheteur.refresh_from_db()
        self.assertEqual(wallet_acheteur.solde_bloque, solde_bloque_avant)

        litige.refresh_from_db()
        self.assertEqual(litige.statut, LitigeCommande.Statut.FERME)

    def test_resolution_par_non_admin_refusee(self):
        _, litige = self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.vendeur)
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'LIBERER_VENDEUR',
            'commentaire': 'Je veux mon argent.',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resolution_deja_traitee_refusee(self):
        commande, litige = self._creer_commande_et_litige()
        self.client.force_authenticate(user=self.admin)
        self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'FERMER',
            'commentaire': 'Première décision.',
        }, format='json')
        response = self.client.post(self.litige_url_tmpl.format(litige.id), {
            'decision': 'LIBERER_VENDEUR',
            'commentaire': 'Deuxième décision, ne devrait pas passer.',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
