from decimal import Decimal, InvalidOperation
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Commande, LitigeCommande, Paiement, RetaitVendeur
from .serializers import (
    CommandeSerializer,
    PasserCommandeSerializer,
    ConfirmerReceptionSerializer,
    LitigeSerializer,
    LitigeDetailSerializer,
    PaiementSerializer,
)
from apps.authentication.permissions import IsBuyer, IsSeller
from django.db import transaction as db_transaction


def _decrementer_stock(commande):
    """Soustrait la quantité commandée du stock produit. Passe en indisponible si stock = 0."""
    try:
        from apps.products.models import Produit
        with db_transaction.atomic():
            produit = Produit.objects.select_for_update().get(pk=commande.produit_id)
            produit.quantite = max(0, produit.quantite - commande.quantite)
            champs = ['quantite']
            if produit.quantite == 0:
                produit.est_disponible = False
                champs.append('est_disponible')
            produit.save(update_fields=champs)
    except Exception:
        pass


def _restaurer_stock(commande):
    """Remet la quantité commandée dans le stock produit lors d'une annulation."""
    try:
        from apps.products.models import Produit
        with db_transaction.atomic():
            produit = Produit.objects.select_for_update().get(pk=commande.produit_id)
            produit.quantite += commande.quantite
            champs = ['quantite']
            if not produit.est_disponible and produit.quantite > 0:
                produit.est_disponible = True
                champs.append('est_disponible')
            produit.save(update_fields=champs)
    except Exception:
        pass


class PasserCommandeView(APIView):
    """POST /api/v1/orders/passer/"""
    permission_classes = [IsBuyer]

    def post(self, request):
        serializer = PasserCommandeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            commande = serializer.save()
            return Response({
                'success':  True,
                'message':  'Commande passée. Paiement en séquestre.',
                'commande': CommandeSerializer(commande).data,
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class MesCommandesAcheteurView(APIView):
    """GET /api/v1/orders/mes-commandes/ — une carte par groupe-vendeur (groupe_vendeur_id)"""
    permission_classes = [IsBuyer]

    _PRIO = {
        'LITIGE': 0, 'ANNULEE': 1, 'PAIEMENT_EN_ATTENTE': 2,
        'PAIEMENT_RECU': 3, 'EN_PREPARATION': 4, 'EN_LIVRAISON': 5,
        'LIVREE': 6, 'CONFIRMEE_RECEPTION': 7, 'PAIEMENT_LIBERE': 8,
    }

    def get(self, request):
        commandes = list(
            Commande.objects.filter(acheteur=request.user)
            .select_related('produit', 'vendeur')
            .order_by('-created_at')
        )

        # Priorité : groupe_vendeur_id > panier_id > individuel
        groupes = {}
        for c in commandes:
            if c.groupe_vendeur_id:
                key = f'gv_{c.groupe_vendeur_id}'
            elif c.panier_id:
                key = f'p_{c.panier_id}'
            else:
                key = f'i_{c.id}'
            groupes.setdefault(key, []).append(c)

        result = []
        for key, cmds in groupes.items():
            cmds_sorted = sorted(cmds, key=lambda c: c.created_at)
            first = cmds_sorted[0]
            statut_agrege = min(cmds_sorted, key=lambda c: self._PRIO.get(c.statut, 99)).statut
            result.append({
                'groupe_vendeur_id': str(first.groupe_vendeur_id) if first.groupe_vendeur_id else None,
                'panier_id':         str(first.panier_id)         if first.panier_id         else None,
                'id':                str(first.id),
                'reference':         first.reference,
                'statut':            statut_agrege,
                'created_at':        first.created_at.isoformat(),
                'montant_total':     sum(float(c.montant_total) for c in cmds_sorted),
                'nb_articles':       len(cmds_sorted),
                'commande_ids':      [str(c.id) for c in cmds_sorted],
                'nom_commande':      first.nom_commande or '',
                'vendeur_nom':       (first.vendeur.nom_complet or first.vendeur.email) if first.vendeur else '?',
                'lignes': [
                    {
                        'id':          str(c.id),
                        'produit_nom': c.produit.nom if c.produit else '?',
                        'quantite':    float(c.quantite),
                        'montant':     float(c.montant_total),
                        'vendeur_nom': (c.vendeur.nom_complet or c.vendeur.email) if c.vendeur else '?',
                        'statut':      c.statut,
                    }
                    for c in cmds_sorted
                ],
            })

        result.sort(key=lambda x: x.get('created_at', ''), reverse=True)

        statut_filtre = request.query_params.get('status', '').strip().upper()
        if statut_filtre:
            STATUS_GROUPS = {
                'PAIEMENT_EN_ATTENTE': ['PAIEMENT_EN_ATTENTE'],
                'EN_PREPARATION':      ['EN_PREPARATION', 'PAIEMENT_RECU'],
                'LIVREE':              ['LIVREE', 'CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'],
                'ANNULEE':             ['ANNULEE'],
            }
            filter_statuts = STATUS_GROUPS.get(statut_filtre, [statut_filtre])
            result = [r for r in result if r.get('statut') in filter_statuts]

        return Response({'success': True, 'commandes': result, 'results': result})


class MesCommandesVendeurView(generics.ListAPIView):
    """GET /api/v1/orders/commandes-recues/"""
    serializer_class   = CommandeSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        qs = Commande.objects.filter(vendeur=self.request.user).select_related('produit', 'acheteur')
        statut = self.request.query_params.get('status', '').strip().upper()
        if statut:
            STATUS_GROUPS = {
                'PAIEMENT_RECU':  ['PAIEMENT_RECU'],
                'EN_PREPARATION': ['EN_PREPARATION'],
                'EN_LIVRAISON':   ['EN_LIVRAISON'],
                'LIVREE':         ['LIVREE', 'CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'],
            }
            qs = qs.filter(statut__in=STATUS_GROUPS.get(statut, [statut]))
        return qs


class DetailCommandeView(APIView):
    """GET /api/v1/orders/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk)
        if commande.acheteur != request.user and commande.vendeur != request.user:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

        # Priorité : groupe_vendeur_id (1 vendeur) > panier_id (old data) > individuel
        if commande.groupe_vendeur_id and commande.acheteur == request.user:
            toutes = list(
                Commande.objects.filter(groupe_vendeur_id=commande.groupe_vendeur_id, acheteur=request.user)
                .select_related('produit', 'vendeur')
                .prefetch_related('produit__images')
                .order_by('created_at')
            )
        elif commande.panier_id and commande.acheteur == request.user:
            toutes = list(
                Commande.objects.filter(panier_id=commande.panier_id, acheteur=request.user)
                .select_related('produit', 'vendeur')
                .prefetch_related('produit__images')
                .order_by('created_at')
            )
        else:
            toutes = [commande]

        def get_image(c):
            if not c.produit:
                return None
            img = c.produit.images.filter(est_principale=True).first() or c.produit.images.first()
            if img and img.image:
                try:
                    return request.build_absolute_uri(img.image.url)
                except Exception:
                    return img.image.url
            return None

        lignes = [
            {
                'id':            str(c.id),
                'produit_nom':   c.produit.nom if c.produit else '?',
                'produit_image': get_image(c),
                'quantite':      float(c.quantite),
                'prix_unitaire': float(c.prix_unitaire),
                'montant':       float(c.montant_produit),
                'vendeur_nom':   (c.vendeur.nom_complet or c.vendeur.email) if c.vendeur else '?',
                'statut':        c.statut,
                'frais_livraison': float(c.frais_livraison),
            }
            for c in toutes
        ]

        principale      = toutes[0] if toutes else commande
        montant_total   = sum(float(c.montant_total)   for c in toutes)
        montant_produits = sum(float(c.montant_produit) for c in toutes)
        frais_paiement  = sum(float(c.frais_paiement)  for c in toutes)

        data = CommandeSerializer(commande, context={'request': request}).data
        data['lignes']           = lignes
        data['nb_articles']      = len(lignes)
        data['montant_total']    = montant_total
        data['montant_produits'] = montant_produits
        data['frais_livraison']  = float(principale.frais_livraison)
        data['frais_paiement']   = frais_paiement
        data['groupe_vendeur_id'] = str(commande.groupe_vendeur_id) if commande.groupe_vendeur_id else None
        data['panier_id']        = str(commande.panier_id) if commande.panier_id else None
        data['nom_commande']     = commande.nom_commande or ''

        return Response({'success': True, 'commande': data})


class RenommerCommandeView(APIView):
    """PATCH /api/v1/orders/<id>/renommer/ — acheteur nomme sa commande (tout le groupe panier)"""
    permission_classes = [IsBuyer]

    def patch(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)
        nom = request.data.get('nom_commande', '').strip()[:100]

        if commande.groupe_vendeur_id:
            Commande.objects.filter(groupe_vendeur_id=commande.groupe_vendeur_id, acheteur=request.user).update(nom_commande=nom)
        elif commande.panier_id:
            Commande.objects.filter(panier_id=commande.panier_id, acheteur=request.user).update(nom_commande=nom)
        else:
            commande.nom_commande = nom
            commande.save(update_fields=['nom_commande'])

        return Response({'success': True, 'nom_commande': nom})


class ConfirmerCommandeView(APIView):
    """POST /api/v1/orders/<id>/confirmer/ — vendeur ① confirme réception de la commande"""
    permission_classes = [IsSeller]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, vendeur=request.user)
        if commande.statut != Commande.Statut.PAIEMENT_RECU:
            return Response({'success': False, 'message': 'Action non autorisée pour ce statut.'}, status=400)
        if commande.confirme_reception_vendeur:
            return Response({'success': False, 'message': 'Vous avez déjà confirmé la réception.'}, status=400)
        commande.confirme_reception_vendeur = True
        commande.date_confirmation          = timezone.now()
        commande.save(update_fields=['confirme_reception_vendeur', 'date_confirmation'])
        return Response({'success': True, 'message': 'Réception de la commande confirmée.', 'commande': {'confirme_reception_vendeur': True}})


class ConfirmerPreparationVendeurView(APIView):
    """POST /api/v1/orders/<id>/confirmer-preparation/ — vendeur ② confirme que le produit est prêt"""
    permission_classes = [IsSeller]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, vendeur=request.user)
        if commande.statut != Commande.Statut.PAIEMENT_RECU or not commande.confirme_reception_vendeur:
            return Response({'success': False, 'message': 'Confirmez d\'abord la réception de la commande.'}, status=400)
        if commande.confirme_preparation_vendeur:
            return Response({'success': False, 'message': 'Préparation déjà confirmée.'}, status=400)
        commande.confirme_preparation_vendeur = True
        commande.statut                       = Commande.Statut.EN_PREPARATION
        commande.save(update_fields=['confirme_preparation_vendeur', 'statut'])
        return Response({'success': True, 'message': 'Préparation confirmée — colis prêt.', 'commande': {'statut': 'EN_PREPARATION', 'confirme_preparation_vendeur': True}})


class MarquerEnLivraisonView(APIView):
    """POST /api/v1/orders/<id>/en-livraison/ — vendeur ③ remet le colis au transporteur"""
    permission_classes = [IsSeller]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, vendeur=request.user)
        if commande.statut != Commande.Statut.EN_PREPARATION or not commande.confirme_preparation_vendeur:
            return Response({'success': False, 'message': 'Confirmez d\'abord la préparation du colis.'}, status=400)
        if commande.confirme_vendeur:
            return Response({'success': False, 'message': 'Vous avez déjà remis le colis au transporteur.'}, status=400)
        commande.confirme_vendeur = True
        commande.save(update_fields=['confirme_vendeur'])
        return Response({'success': True, 'message': 'Colis remis au transporteur. En attente de prise en charge.', 'commande': {'confirme_vendeur': True}})


class ConfirmerReceptionView(APIView):
    """POST /api/v1/orders/<id>/confirmer-reception/ — acheteur"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)
        if commande.statut != Commande.Statut.EN_LIVRAISON:
            return Response({
                'success': False,
                'message': 'La commande n\'est pas encore en livraison.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ConfirmerReceptionSerializer(data=request.data)
        if serializer.is_valid():
            commande.statut                 = Commande.Statut.CONFIRMEE_RECEPTION
            commande.date_reception         = timezone.now()
            commande.note_livraison         = serializer.validated_data['note']
            commande.commentaire_livraison  = serializer.validated_data.get('commentaire', '')
            commande.save()

            # Libérer le paiement au vendeur (via wallet)
            try:
                from apps.wallet.services import liberer_paiement_vendeur
                liberer_paiement_vendeur(commande)
            except Exception:
                pass

            return Response({'success': True, 'message': 'Réception confirmée. Vendeur payé.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class AnnulerCommandeView(APIView):
    """POST /api/v1/orders/<id>/annuler/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk)
        if commande.acheteur != request.user and commande.vendeur != request.user:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=403)
        if commande.statut not in [Commande.Statut.PAIEMENT_EN_ATTENTE, Commande.Statut.PAIEMENT_RECU]:
            return Response({'success': False, 'message': 'Commande non annulable.'}, status=400)
        etait_payee = commande.statut == Commande.Statut.PAIEMENT_RECU
        commande.statut = Commande.Statut.ANNULEE
        commande.save(update_fields=['statut'])
        if etait_payee:
            _restaurer_stock(commande)
        return Response({'success': True, 'message': 'Commande annulée.'})


class SignalerLitigeView(APIView):
    """POST /api/v1/orders/<id>/litige/"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)
        if LitigeCommande.objects.filter(commande=commande).exists():
            return Response({'success': False, 'message': 'Un problème a déjà été signalé pour cette commande.'}, status=400)
        serializer = LitigeSerializer(data=request.data)
        if serializer.is_valid():
            litige = LitigeCommande.objects.create(
                commande=commande,
                plaignant=request.user,
                description=serializer.validated_data['description']
            )
            commande.statut = Commande.Statut.LITIGE
            commande.save(update_fields=['statut'])
            try:
                from apps.notifications.services import notifier_litige_signale
                notifier_litige_signale(litige)
            except Exception:
                pass
            return Response({'success': True, 'message': 'Problème signalé. Notre équipe va examiner votre demande.'}, status=201)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class MesLitigesView(generics.ListAPIView):
    """GET /api/v1/orders/mes-litiges/ — acheteur"""
    serializer_class   = LitigeDetailSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return LitigeCommande.objects.filter(
            plaignant=self.request.user
        ).select_related('commande', 'commande__produit', 'commande__vendeur', 'plaignant')


class ListeLitigesView(APIView):
    """GET /api/v1/orders/problemes/ — admin uniquement, liste tous les litiges signalés"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        litiges = LitigeCommande.objects.select_related(
            'commande', 'commande__produit', 'commande__vendeur', 'plaignant'
        ).all()
        statut = request.query_params.get('statut', '')
        if statut:
            litiges = litiges.filter(statut=statut.upper())
        return Response(LitigeDetailSerializer(litiges, many=True).data)


class DetailLitigeView(APIView):
    """GET /api/v1/orders/litiges/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        litige = get_object_or_404(LitigeCommande, pk=pk)
        commande = litige.commande
        if request.user not in [commande.acheteur, commande.vendeur] and not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=403)
        return Response({'success': True, 'litige': LitigeDetailSerializer(litige).data})


class ResoudreLitigeView(APIView):
    """POST /api/v1/orders/litiges/<id>/resoudre/ — admin uniquement"""
    permission_classes = [IsAuthenticated]

    DECISIONS_VALIDES = ['REMBOURSER_ACHETEUR', 'LIBERER_VENDEUR', 'PARTAGER', 'FERMER']

    @staticmethod
    def _maj_paiement(commande, statut):
        Paiement.objects.filter(commande=commande).update(statut=statut)

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Réservé aux administrateurs.'}, status=403)

        litige      = get_object_or_404(LitigeCommande, pk=pk)
        commande    = litige.commande
        decision    = request.data.get('decision', '')
        commentaire = request.data.get('commentaire', '').strip()

        if decision not in self.DECISIONS_VALIDES:
            return Response({'success': False, 'message': 'Décision invalide.'}, status=400)
        if not commentaire:
            return Response({'success': False, 'message': 'Un commentaire justificatif est requis.'}, status=400)
        if litige.statut in [LitigeCommande.Statut.RESOLU, LitigeCommande.Statut.FERME]:
            return Response({'success': False, 'message': 'Ce litige a déjà été traité.'}, status=400)

        try:
            with db_transaction.atomic():
                if decision == 'REMBOURSER_ACHETEUR':
                    from apps.wallet.services import rembourser_acheteur
                    rembourser_acheteur(commande)
                    commande.statut = Commande.Statut.ANNULEE
                    commande.save(update_fields=['statut'])
                    _restaurer_stock(commande)
                    self._maj_paiement(commande, Paiement.Statut.REMBOURSÉ)

                elif decision == 'LIBERER_VENDEUR':
                    from apps.wallet.services import liberer_paiement_vendeur
                    liberer_paiement_vendeur(commande)
                    commande.statut             = Commande.Statut.PAIEMENT_LIBERE
                    commande.paiement_en_escrow = False
                    commande.paiement_libere_le = timezone.now()
                    commande.save(update_fields=['statut', 'paiement_en_escrow', 'paiement_libere_le'])
                    self._maj_paiement(commande, Paiement.Statut.PRET_VENDEUR)

                elif decision == 'PARTAGER':
                    from apps.wallet.services import partager_paiement
                    montant_acheteur = request.data.get('montant_acheteur')
                    if montant_acheteur in (None, ''):
                        return Response({'success': False, 'message': 'Montant à rembourser à l\'acheteur requis.'}, status=400)
                    try:
                        montant_acheteur = Decimal(str(montant_acheteur))
                    except InvalidOperation:
                        return Response({'success': False, 'message': 'Montant invalide.'}, status=400)
                    partager_paiement(commande, montant_acheteur)
                    commande.statut             = Commande.Statut.PAIEMENT_LIBERE
                    commande.paiement_en_escrow = False
                    commande.paiement_libere_le = timezone.now()
                    commande.save(update_fields=['statut', 'paiement_en_escrow', 'paiement_libere_le'])
                    self._maj_paiement(commande, Paiement.Statut.PRET_VENDEUR)

                # FERMER : aucune action sur les fonds — le séquestre reste bloqué,
                # une action manuelle séparée sera nécessaire plus tard.

                litige.resolution      = commentaire
                litige.statut          = LitigeCommande.Statut.FERME if decision == 'FERMER' else LitigeCommande.Statut.RESOLU
                litige.date_resolution = timezone.now()
                litige.save(update_fields=['resolution', 'statut', 'date_resolution'])
        except ValueError as e:
            return Response({'success': False, 'message': str(e)}, status=400)

        try:
            from apps.notifications.services import notifier_litige_resolu
            notifier_litige_resolu(litige)
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Problème résolu.',
            'litige':  LitigeDetailSerializer(litige).data,
        })


# ===== ESCROW & PAYMENT ENDPOINTS =====

class InitiatePaiementView(APIView):
    """
    POST /api/v1/orders/payment/initiate/ — Crée la transaction FedaPay.
    Le paiement est ensuite finalisé côté frontend par le widget Checkout.js
    (transaction_id + public_key retournés ici).
    """
    permission_classes = [IsBuyer]

    def post(self, request):
        commande_id = request.data.get('commande_id')

        try:
            commande = Commande.objects.get(id=commande_id, acheteur=request.user)
        except Commande.DoesNotExist:
            return Response({'success': False, 'message': 'Commande non trouvée.'}, status=404)

        if commande.statut != Commande.Statut.PAIEMENT_EN_ATTENTE:
            return Response({'success': False, 'message': 'Commande non en attente de paiement.'}, status=400)

        paiement, _ = Paiement.objects.get_or_create(
            commande=commande,
            defaults={
                'montant':       commande.montant_total,
                'mode_paiement': commande.mode_paiement,
                'statut':        Paiement.Statut.EN_ATTENTE,
            }
        )

        from .fedapay_service import creer_transaction
        result = creer_transaction(commande)
        if not result.get('success'):
            return Response({'success': False, 'message': result.get('message', 'Erreur FedaPay.')}, status=400)

        transaction_id = result['transaction_id']
        paiement.reference_transaction = str(transaction_id)
        paiement.save(update_fields=['reference_transaction'])

        return Response({
            'success':        True,
            'message':        'Transaction créée.',
            'paiement_id':    str(paiement.id),
            'montant':        str(paiement.montant),
            'transaction_id': transaction_id,
            'public_key':     settings.FEDAPAY_PUBLIC_KEY,
        }, status=status.HTTP_201_CREATED)


class ConfirmPaiementView(APIView):
    """POST /api/v1/payment/confirm/ — Confirmer paiement reçu (via webhook)"""
    permission_classes = [IsAuthenticated]  # Peut être appelé par système

    def post(self, request):
        paiement_id = request.data.get('paiement_id')
        transaction_id = request.data.get('transaction_id')
        
        try:
            paiement = Paiement.objects.get(id=paiement_id)
        except Paiement.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paiement non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Marquer paiement comme effectué et en escrow
        paiement.statut = Paiement.Statut.EN_ESCROW
        paiement.reference_transaction = transaction_id
        paiement.date_recu = timezone.now()
        paiement.date_en_escrow = timezone.now()
        paiement.save()
        
        # Mettre à jour statut commande
        commande = paiement.commande
        commande.statut = Commande.Statut.PAIEMENT_RECU
        commande.date_confirmation = timezone.now()
        commande.save()
        _decrementer_stock(commande)

        return Response({
            'success': True,
            'message': 'Paiement confirmé et en escrow.',
            'paiement': {
                'id': paiement.id,
                'statut': paiement.statut,
                'montant': str(paiement.montant),
            }
        })


class ReleasePaiementView(APIView):
    """POST /api/v1/payment/release/ — Libérer paiement au vendeur"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        commande_id = request.data.get('commande_id')
        
        try:
            commande = Commande.objects.get(id=commande_id)
            paiement = Paiement.objects.get(commande=commande)
        except (Commande.DoesNotExist, Paiement.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Commande ou paiement non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier que acheteur a confirmé réception
        if commande.statut != Commande.Statut.CONFIRMEE_RECEPTION:
            return Response({
                'success': False,
                'message': 'Livraison non confirmée.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Libérer paiement
        paiement.statut = Paiement.Statut.PRET_VENDEUR
        paiement.save()
        
        commande.paiement_en_escrow = False
        commande.paiement_libere_le = timezone.now()
        commande.statut = Commande.Statut.PAIEMENT_LIBERE
        commande.save()
        
        return Response({
            'success': True,
            'message': 'Paiement libéré. Vendeur peut retirer.',
            'paiement': {
                'statut': paiement.statut,
                'montant': str(paiement.montant),
            }
        })


# ===== SELLER WITHDRAWAL ENDPOINTS =====

class DemandedRetaitVendeurView(APIView):
    """POST /api/v1/withdrawal/request/ — Vendeur demande retrait"""
    permission_classes = [IsSeller]

    def post(self, request):
        montant = request.data.get('montant')
        compte_bancaire = request.data.get('compte_bancaire')
        nom_titulaire = request.data.get('nom_titulaire')
        
        if not montant or not compte_bancaire or not nom_titulaire:
            return Response({
                'success': False,
                'message': 'Données manquantes.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier solde disponible
        from django.db.models import Sum
        paiements_liberes = Paiement.objects.filter(
            commande__vendeur=request.user,
            statut=Paiement.Statut.PRET_VENDEUR
        ).aggregate(total=Sum('montant'))['total'] or 0
        
        if float(montant) > float(paiements_liberes):
            return Response({
                'success': False,
                'message': f'Solde insuffisant. Disponible: {paiements_liberes}',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        retrait = RetaitVendeur.objects.create(
            vendeur=request.user,
            montant=montant,
            compte_bancaire=compte_bancaire,
            nom_titulaire=nom_titulaire,
            statut=RetaitVendeur.Statut.DEMANDÉ,
        )
        
        return Response({
            'success': True,
            'message': 'Retrait demandé. Attente d\'approbation admin.',
            'retrait': {
                'id': retrait.id,
                'montant': str(retrait.montant),
                'statut': retrait.statut,
            }
        }, status=status.HTTP_201_CREATED)


class MesRetaitsVendeurView(generics.ListAPIView):
    """GET /api/v1/withdrawal/list/ — Historique retraits vendeur"""
    permission_classes = [IsSeller]

    def get_queryset(self):
        return RetaitVendeur.objects.filter(
            vendeur=self.request.user
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        retraits = []
        for retrait in queryset:
            retraits.append({
                'id': retrait.id,
                'montant': str(retrait.montant),
                'statut': retrait.statut,
                'date_demande': retrait.date_demande,
                'date_effectué': retrait.date_effectué,
                'reference_virement': retrait.reference_virement,
            })
        return Response({
            'success': True,
            'retraits': retraits,
        })


class AdminApproveWithdrawalView(APIView):
    """POST /api/v1/withdrawal/approve/ — Admin approuve retrait"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Permissions insuffisantes.',
            }, status=status.HTTP_403_FORBIDDEN)
        
        retrait_id = request.data.get('retrait_id')
        action = request.data.get('action')  # 'approve' or 'reject'
        
        try:
            retrait = RetaitVendeur.objects.get(id=retrait_id)
        except RetaitVendeur.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Retrait non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if action == 'approve':
            retrait.statut = RetaitVendeur.Statut.APPROUVÉ
            retrait.date_approuvé = timezone.now()
            
            # Marquer paiements comme transférés
            Paiement.objects.filter(
                commande__vendeur=retrait.vendeur,
                statut=Paiement.Statut.PRET_VENDEUR
            ).update(
                statut=Paiement.Statut.TRANSFERE,
                date_transfere=timezone.now()
            )
            
            message = 'Retrait approuvé.'
        
        elif action == 'reject':
            retrait.statut = RetaitVendeur.Statut.REJETÉ
            message = 'Retrait rejeté.'
        
        else:
            return Response({
                'success': False,
                'message': 'Action non valide.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        retrait.save()
        
        return Response({
            'success': True,
            'message': message,
            'retrait': {
                'id': retrait.id,
                'statut': retrait.statut,
            }
        })


class DetailPaiementView(APIView):
    """GET /api/v1/orders/payment/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            paiement = Paiement.objects.select_related('commande').get(pk=pk)
        except Paiement.DoesNotExist:
            return Response({'success': False, 'message': 'Paiement non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        commande = paiement.commande
        if commande.acheteur != request.user and commande.vendeur != request.user and not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'paiement': PaiementSerializer(paiement).data})


# ─────────────────────────────────────────────────────────────────────────────
# NOUVELLES VUES
# ─────────────────────────────────────────────────────────────────────────────

class FedaPayWebhookView(APIView):
    """
    POST /api/v1/orders/payment/webhook/
    Reçoit le callback FedaPay et met à jour le statut du paiement.

    FedaPay envoie un objet Event : { id, name (ex: 'transaction.approved'),
    entity: { id, status, ... } } — pas un objet transaction à plat. On reste
    tolérant sur la forme exacte (certaines intégrations envoient directement
    l'objet transaction) pour éviter de dépendre d'un format non documenté.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import logging
        data   = request.data
        entity = data.get('entity') or data
        event_type = data.get('name') or data.get('type') or ''

        transaction_id = str(entity.get('id') or data.get('id') or '')
        fedapay_status = entity.get('status') or ''
        if not fedapay_status and event_type:
            if 'approved' in event_type:
                fedapay_status = 'approved'
            elif 'declined' in event_type or 'canceled' in event_type:
                fedapay_status = 'declined'

        logging.getLogger(__name__).warning(
            'FedaPay webhook reçu : type=%s transaction_id=%s status=%s payload=%s',
            event_type, transaction_id, fedapay_status, data,
        )

        if not transaction_id:
            return Response({'success': False, 'message': 'transaction_id manquant.'}, status=400)

        try:
            paiement = Paiement.objects.select_related('commande').get(
                reference_transaction=transaction_id
            )
        except Paiement.DoesNotExist:
            return Response({'success': True, 'message': 'Paiement inconnu — ignoré.'})

        commande = paiement.commande

        if fedapay_status == 'approved' and paiement.statut not in [Paiement.Statut.EN_ESCROW, Paiement.Statut.PRET_VENDEUR]:
            paiement.statut        = Paiement.Statut.EN_ESCROW
            paiement.date_recu     = timezone.now()
            paiement.date_en_escrow = timezone.now()
            paiement.log_webhook   = data
            paiement.save(update_fields=['statut', 'date_recu', 'date_en_escrow', 'log_webhook'])

            commande.statut            = Commande.Statut.PAIEMENT_RECU
            commande.date_confirmation = timezone.now()
            commande.save(update_fields=['statut', 'date_confirmation'])
            _decrementer_stock(commande)

            try:
                from apps.notifications.services import notifier_paiement_en_escrow
                notifier_paiement_en_escrow(commande)
            except Exception:
                pass

        elif fedapay_status in ['declined', 'cancelled']:
            paiement.statut        = Paiement.Statut.ECHOUE
            paiement.message_erreur = fedapay_status
            paiement.log_webhook   = data
            paiement.save(update_fields=['statut', 'message_erreur', 'log_webhook'])

        return Response({'success': True})


class ConfirmerReceptionTripartiteView(APIView):
    """
    POST /api/v1/orders/<id>/confirmer-tripartite/
    Chacune des 3 parties confirme la réception / livraison.
    Quand les 3 ont confirmé → libère l'escrow.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk)
        user     = request.user

        # Vérifier que l'utilisateur est bien une des 3 parties
        is_acheteur     = (commande.acheteur == user)
        is_vendeur      = (commande.vendeur  == user)
        is_transporteur = (commande.transporteur == user)

        # Seul l'acheteur utilise cette vue ; le transporteur confirme via TerminerMission
        if not is_acheteur:
            return Response({'success': False, 'message': 'Seul l\'acheteur peut confirmer la réception ici.'}, status=403)

        if commande.statut not in [Commande.Statut.LIVREE, Commande.Statut.EN_LIVRAISON]:
            return Response({
                'success': False,
                'message': 'La commande doit être en livraison ou livrée pour confirmer.',
            }, status=400)

        if commande.confirme_acheteur:
            return Response({'success': False, 'message': 'Vous avez déjà confirmé la réception.'}, status=400)

        champs_modifies = ['confirme_acheteur']
        commande.confirme_acheteur = True

        # Libération : acheteur + transporteur (ou acheteur seul si pas de transporteur)
        if commande.transporteur:
            toutes_confirmees = commande.confirme_acheteur and commande.confirme_transporteur
        else:
            toutes_confirmees = commande.confirme_acheteur

        if toutes_confirmees:
            commande.statut        = Commande.Statut.PAIEMENT_LIBERE
            commande.date_reception = timezone.now()
            commande.paiement_en_escrow = False
            commande.paiement_libere_le = timezone.now()
            champs_modifies += ['statut', 'date_reception', 'paiement_en_escrow', 'paiement_libere_le']
            commande.save(update_fields=champs_modifies)

            # Libérer le séquestre
            try:
                from apps.wallet.services import liberer_paiement_vendeur
                liberer_paiement_vendeur(commande)
            except Exception:
                pass

            try:
                from apps.notifications.services import notifier_escrow_libere
                notifier_escrow_libere(commande)
            except Exception:
                pass

            return Response({'success': True, 'message': 'Toutes les parties ont confirmé. Paiement libéré au vendeur !'})

        commande.save(update_fields=champs_modifies)

        try:
            from apps.notifications.services import notifier_confirmation_partielle
            notifier_confirmation_partielle(commande, user)
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Réception confirmée. En attente de la confirmation du transporteur.',
            'confirme_acheteur':     commande.confirme_acheteur,
            'confirme_transporteur': commande.confirme_transporteur,
        })


class SimulerPaiementView(APIView):
    """
    POST /api/v1/orders/<id>/simuler-paiement/
    Simule un paiement mobile money sans appel FedaPay réel.
    Body: { telephone, reseau, montant }
    """
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)

        if commande.statut != Commande.Statut.PAIEMENT_EN_ATTENTE:
            return Response({
                'success': False,
                'message': 'Cette commande n\'est pas en attente de paiement.',
            }, status=400)

        telephone = request.data.get('telephone', '').strip()
        reseau    = request.data.get('reseau', 'MTN').strip()
        montant   = request.data.get('montant')

        if not telephone:
            return Response({'success': False, 'message': 'Numéro de téléphone requis.'}, status=400)

        reseaux_valides = ['MTN', 'MOOV', 'CELTIS', 'VIREMENT']
        if reseau not in reseaux_valides:
            return Response({'success': False, 'message': f'Réseau invalide. Choisir parmi {reseaux_valides}.'}, status=400)

        # Créer ou récupérer l'objet Paiement
        paiement, _ = Paiement.objects.get_or_create(
            commande=commande,
            defaults={
                'montant':       commande.montant_total,
                'mode_paiement': reseau,
                'statut':        Paiement.Statut.EN_ATTENTE,
            }
        )

        # Simulation : marquer directement comme reçu en séquestre
        import uuid as _uuid
        paiement.statut                = Paiement.Statut.EN_ESCROW
        paiement.mode_paiement         = reseau
        paiement.reference_transaction = f'SIM-{_uuid.uuid4().hex[:12].upper()}'
        paiement.date_recu             = timezone.now()
        paiement.date_en_escrow        = timezone.now()
        paiement.save(update_fields=[
            'statut', 'mode_paiement', 'reference_transaction', 'date_recu', 'date_en_escrow'
        ])

        commande.statut            = Commande.Statut.PAIEMENT_RECU
        commande.mode_paiement     = reseau
        commande.date_confirmation = timezone.now()
        commande.save(update_fields=['statut', 'mode_paiement', 'date_confirmation'])
        _decrementer_stock(commande)

        try:
            from apps.notifications.services import notifier_paiement_en_escrow
            notifier_paiement_en_escrow(commande)
        except Exception:
            pass

        return Response({
            'success':    True,
            'message':    'Paiement simulé avec succès. Les fonds sont sécurisés en séquestre.',
            'reference':  paiement.reference_transaction,
            'montant':    str(paiement.montant),
            'reseau':     reseau,
        }, status=201)


class PanierSimulerPaiementView(APIView):
    """
    POST /api/v1/orders/panier/<panier_id>/simuler-paiement/
    Paie en une seule fois toutes les commandes d'un même panier.
    Body: { telephone, reseau }
    """
    permission_classes = [IsBuyer]

    def post(self, request, panier_id):
        commandes = list(
            Commande.objects.filter(
                panier_id=panier_id,
                acheteur=request.user,
                statut=Commande.Statut.PAIEMENT_EN_ATTENTE,
            ).select_related('produit')
        )

        if not commandes:
            return Response({'success': False, 'message': 'Aucune commande en attente pour ce panier.'}, status=400)

        telephone = request.data.get('telephone', '').strip()
        reseau    = request.data.get('reseau', 'MTN').strip()

        if not telephone:
            return Response({'success': False, 'message': 'Numéro de téléphone requis.'}, status=400)

        reseaux_valides = ['MTN', 'MOOV', 'CELTIS', 'VIREMENT']
        if reseau not in reseaux_valides:
            return Response({'success': False, 'message': f'Réseau invalide. Choisir parmi {reseaux_valides}.'}, status=400)

        import uuid as _uuid
        montant_total = 0

        for commande in commandes:
            paiement, _ = Paiement.objects.get_or_create(
                commande=commande,
                defaults={
                    'montant':       commande.montant_total,
                    'mode_paiement': reseau,
                    'statut':        Paiement.Statut.EN_ATTENTE,
                }
            )
            paiement.statut                = Paiement.Statut.EN_ESCROW
            paiement.mode_paiement         = reseau
            paiement.reference_transaction = f'SIM-{_uuid.uuid4().hex[:12].upper()}'
            paiement.date_recu             = timezone.now()
            paiement.date_en_escrow        = timezone.now()
            paiement.save(update_fields=['statut', 'mode_paiement', 'reference_transaction', 'date_recu', 'date_en_escrow'])

            commande.statut            = Commande.Statut.PAIEMENT_RECU
            commande.mode_paiement     = reseau
            commande.date_confirmation = timezone.now()
            commande.save(update_fields=['statut', 'mode_paiement', 'date_confirmation'])
            _decrementer_stock(commande)

            montant_total += float(commande.montant_total)

            try:
                from apps.notifications.services import notifier_paiement_en_escrow
                notifier_paiement_en_escrow(commande)
            except Exception:
                pass

        return Response({
            'success':       True,
            'message':       f'Paiement de {montant_total:,.0f} FCFA sécurisé en séquestre.',
            'nb_commandes':  len(commandes),
            'montant_total': montant_total,
        }, status=201)


class GroupeVendeurSimulerPaiementView(APIView):
    """
    POST /api/v1/orders/groupe/<groupe_vendeur_id>/simuler-paiement/
    Paie toutes les commandes d'un même groupe-vendeur (même vendeur, même checkout).
    Body: { telephone, reseau }
    """
    permission_classes = [IsBuyer]

    def post(self, request, groupe_vendeur_id):
        commandes = list(
            Commande.objects.filter(
                groupe_vendeur_id=groupe_vendeur_id,
                acheteur=request.user,
                statut=Commande.Statut.PAIEMENT_EN_ATTENTE,
            ).select_related('produit')
        )

        if not commandes:
            return Response({'success': False, 'message': 'Aucune commande en attente pour ce groupe.'}, status=400)

        telephone = request.data.get('telephone', '').strip()
        reseau    = request.data.get('reseau', 'MTN').strip()

        if not telephone:
            return Response({'success': False, 'message': 'Numéro de téléphone requis.'}, status=400)

        reseaux_valides = ['MTN', 'MOOV', 'CELTIS', 'VIREMENT']
        if reseau not in reseaux_valides:
            return Response({'success': False, 'message': f'Réseau invalide. Choisir parmi {reseaux_valides}.'}, status=400)

        import uuid as _uuid
        montant_total = 0

        for commande in commandes:
            paiement, _ = Paiement.objects.get_or_create(
                commande=commande,
                defaults={
                    'montant':       commande.montant_total,
                    'mode_paiement': reseau,
                    'statut':        Paiement.Statut.EN_ATTENTE,
                }
            )
            paiement.statut                = Paiement.Statut.EN_ESCROW
            paiement.mode_paiement         = reseau
            paiement.reference_transaction = f'SIM-{_uuid.uuid4().hex[:12].upper()}'
            paiement.date_recu             = timezone.now()
            paiement.date_en_escrow        = timezone.now()
            paiement.save(update_fields=['statut', 'mode_paiement', 'reference_transaction', 'date_recu', 'date_en_escrow'])

            commande.statut            = Commande.Statut.PAIEMENT_RECU
            commande.mode_paiement     = reseau
            commande.date_confirmation = timezone.now()
            commande.save(update_fields=['statut', 'mode_paiement', 'date_confirmation'])
            _decrementer_stock(commande)

            montant_total += float(commande.montant_total)

            try:
                from apps.notifications.services import notifier_paiement_en_escrow
                notifier_paiement_en_escrow(commande)
            except Exception:
                pass

        return Response({
            'success':       True,
            'message':       f'{len(commandes)} commande(s) payée(s) — {montant_total:,.0f} FCFA sécurisés.',
            'nb_commandes':  len(commandes),
            'montant_total': montant_total,
        }, status=201)


class NoterVendeurView(APIView):
    """
    POST /api/v1/orders/<id>/noter-vendeur/
    Body: { note: 1-5, commentaire: '' }
    Acheteur note le vendeur après livraison confirmée.
    """
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)

        if commande.statut not in [
            Commande.Statut.CONFIRMEE_RECEPTION,
            Commande.Statut.PAIEMENT_LIBERE,
        ]:
            return Response({'success': False, 'message': 'La réception n\'a pas encore été confirmée.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if commande.note_vendeur:
            return Response({'success': False, 'message': 'Vendeur déjà noté.'}, status=400)

        note        = int(request.data.get('note', 0))
        commentaire = request.data.get('commentaire', '')

        if not 1 <= note <= 5:
            return Response({'success': False, 'message': 'Note entre 1 et 5.'}, status=400)

        commande.note_vendeur        = note
        commande.commentaire_vendeur = commentaire
        commande.save(update_fields=['note_vendeur', 'commentaire_vendeur'])

        # Recalculer note moyenne vendeur
        try:
            from apps.authentication.models import SellerProfile
            profil = commande.vendeur.seller_profile
            commandes_notees = Commande.objects.filter(
                vendeur=commande.vendeur, note_vendeur__isnull=False
            )
            total = sum(c.note_vendeur for c in commandes_notees)
            profil.note_moyenne = total / commandes_notees.count()
            profil.save(update_fields=['note_moyenne'])
        except Exception:
            pass

        return Response({'success': True, 'message': 'Vendeur noté. Merci pour votre évaluation !'})


class GroupeVendeurInitierPaiementView(APIView):
    """
    POST /api/v1/orders/groupe/<groupe_vendeur_id>/initier-paiement/
    Crée UNE transaction FedaPay pour toutes les commandes du groupe.
    Le paiement est finalisé côté frontend via le widget Checkout.js.
    """
    permission_classes = [IsBuyer]

    def post(self, request, groupe_vendeur_id):
        commandes = list(
            Commande.objects.filter(
                groupe_vendeur_id=groupe_vendeur_id,
                acheteur=request.user,
                statut=Commande.Statut.PAIEMENT_EN_ATTENTE,
            ).select_related('produit', 'acheteur')
        )

        if not commandes:
            return Response({'success': False, 'message': 'Aucune commande en attente pour ce groupe.'}, status=400)

        # Créer un objet Commande virtuel pour le montant total
        montant_total = sum(c.montant_total for c in commandes)
        principale    = commandes[0]
        principale.montant_total = montant_total

        from .fedapay_service import creer_transaction
        result = creer_transaction(principale)

        if not result.get('success'):
            return Response({'success': False, 'message': result.get('message', 'Erreur FedaPay.')}, status=400)

        transaction_id = result['transaction_id']

        for commande in commandes:
            paiement, _ = Paiement.objects.get_or_create(
                commande=commande,
                defaults={
                    'montant':       commande.montant_total,
                    'mode_paiement': commande.mode_paiement,
                    'statut':        Paiement.Statut.EN_ATTENTE,
                }
            )
            paiement.reference_transaction = str(transaction_id)
            paiement.save(update_fields=['reference_transaction'])

        return Response({
            'success':        True,
            'message':        'Transaction créée.',
            'transaction_id': transaction_id,
            'public_key':     settings.FEDAPAY_PUBLIC_KEY,
            'montant_total':  float(montant_total),
        }, status=201)


class PanierInitierPaiementView(APIView):
    """
    POST /api/v1/orders/panier/<panier_id>/initier-paiement/
    Crée UNE transaction FedaPay pour toutes les commandes du panier.
    Le paiement est finalisé côté frontend via le widget Checkout.js.
    """
    permission_classes = [IsBuyer]

    def post(self, request, panier_id):
        commandes = list(
            Commande.objects.filter(
                panier_id=panier_id,
                acheteur=request.user,
                statut=Commande.Statut.PAIEMENT_EN_ATTENTE,
            ).select_related('produit', 'acheteur')
        )

        if not commandes:
            return Response({'success': False, 'message': 'Aucune commande en attente pour ce panier.'}, status=400)

        montant_total = sum(c.montant_total for c in commandes)
        principale    = commandes[0]
        principale.montant_total = montant_total

        from .fedapay_service import creer_transaction
        result = creer_transaction(principale)

        if not result.get('success'):
            return Response({'success': False, 'message': result.get('message', 'Erreur FedaPay.')}, status=400)

        transaction_id = result['transaction_id']

        for commande in commandes:
            paiement, _ = Paiement.objects.get_or_create(
                commande=commande,
                defaults={
                    'montant':       commande.montant_total,
                    'mode_paiement': commande.mode_paiement,
                    'statut':        Paiement.Statut.EN_ATTENTE,
                }
            )
            paiement.reference_transaction = str(transaction_id)
            paiement.save(update_fields=['reference_transaction'])

        return Response({
            'success':        True,
            'message':        'Transaction créée.',
            'transaction_id': transaction_id,
            'public_key':     settings.FEDAPAY_PUBLIC_KEY,
            'montant_total':  float(montant_total),
        }, status=201)
