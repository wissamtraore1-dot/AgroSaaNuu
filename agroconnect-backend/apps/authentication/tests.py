from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


class InscriptionTestCase(APITestCase):

    def setUp(self):
        self.url    = reverse('authentication:inscription')
        self.client = APIClient()
        self.data   = {
            'email':            'test@agrosaanuu.com',
            'telephone':        '0197000001',
            'prenom':           'Test',
            'nom':              'User',
            'cip':              '12345678',
            'role':             'BUYER',
            'ville':            'Cotonou',
            'password':         'testpass123',
            'password_confirm': 'testpass123',
        }

    def test_inscription_acheteur_succes(self):
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_inscription_email_duplique(self):
        self.client.post(self.url, self.data, format='json')
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inscription_cip_invalide(self):
        self.data['cip'] = 'abc'
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inscription_mdp_non_correspondants(self):
        self.data['password_confirm'] = 'autrepass'
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ConnexionTestCase(APITestCase):

    def setUp(self):
        self.url    = reverse('authentication:connexion')
        self.client = APIClient()
        self.user   = User.objects.create_user(
            email='test@agrosaanuu.com',
            password='testpass123',
            telephone='+2290197000001',
            prenom='Test', nom='User',
            cip='12345678', role='BUYER',
        )

    def test_connexion_succes(self):
        response = self.client.post(self.url, {
            'email':    'test@agrosaanuu.com',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)

    def test_connexion_mauvais_mdp(self):
        response = self.client.post(self.url, {
            'email':    'test@agrosaanuu.com',
            'password': 'mauvais',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_connexion_email_inexistant(self):
        response = self.client.post(self.url, {
            'email':    'inexistant@test.bj',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfilTestCase(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user   = User.objects.create_user(
            email='test@agrosaanuu.com',
            password='testpass123',
            telephone='+2290197000001',
            prenom='Test', nom='User',
            cip='12345678', role='BUYER',
        )
        self.client.force_authenticate(user=self.user)

    def test_voir_profil(self):
        response = self.client.get(reverse('authentication:mon-profil'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'test@agrosaanuu.com')

    def test_modifier_profil(self):
        response = self.client.put(
            reverse('authentication:mon-profil'),
            {'prenom': 'Nouveau', 'nom': 'Nom'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['prenom'], 'Nouveau')

    def test_role_non_modifiable_via_profil(self):
        """Un acheteur ne doit pas pouvoir s'auto-attribuer un autre rôle."""
        response = self.client.put(
            reverse('authentication:mon-profil'),
            {'role': 'SELLER'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.BUYER)


class ChampsProtegesProfilVendeurTestCase(APITestCase):
    """Vérifie qu'un vendeur ne peut pas s'auto-certifier ni changer son propre statut KYC."""

    def setUp(self):
        self.client = APIClient()
        self.user   = User.objects.create_user(
            email='vendeur@agrosaanuu.com',
            password='testpass123',
            telephone='+2290197000002',
            prenom='Vendeur', nom='Test',
            cip='12345679', role='SELLER',
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('authentication:seller-profile')

    def test_est_certifie_non_modifiable(self):
        response = self.client.put(self.url, {'est_certifie': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.seller_profile.est_certifie)

    def test_kyc_status_non_modifiable(self):
        response = self.client.put(self.url, {'kyc_status': 'APPROVED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.seller_profile.kyc_status, 'PENDING')


class ChampsProtegesProfilTransporteurTestCase(APITestCase):
    """Même vérification côté transporteur."""

    def setUp(self):
        self.client = APIClient()
        self.user   = User.objects.create_user(
            email='transporteur@agrosaanuu.com',
            password='testpass123',
            telephone='+2290197000003',
            prenom='Transporteur', nom='Test',
            cip='12345680', role='TRANSPORTER',
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('authentication:transporter-profile')

    def test_est_certifie_non_modifiable(self):
        response = self.client.put(self.url, {'est_certifie': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.transporter_profile.est_certifie)

    def test_kyc_status_non_modifiable(self):
        response = self.client.put(self.url, {'kyc_status': 'APPROVED'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.transporter_profile.kyc_status, 'PENDING')


@override_settings(CACHES={
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'},
})
class ThrottleLoginTestCase(APITestCase):
    """
    Vérifie que le endpoint /auth/login/ est bien limité (scope 'login', 5/min).
    Le cache dev réel (DummyCache, voir settings/development.py) ne stocke rien,
    donc on force un cache en mémoire ici pour pouvoir exercer le throttling
    (celui utilisé en production est Redis, voir settings/production.py).
    """

    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.client = APIClient()
        self.url    = reverse('authentication:login-unifie')
        self.user   = User.objects.create_user(
            email='throttle@agrosaanuu.com',
            password='testpass123',
            telephone='+2290197000004',
            prenom='Throttle', nom='Test',
            cip='12345681', role='BUYER',
        )

    def test_throttle_login_bloque_apres_5_tentatives(self):
        payload = {'identifiant': 'throttle@agrosaanuu.com', 'password': 'mauvais'}
        for _ in range(5):
            response = self.client.post(self.url, payload, format='json')
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class InscriptionParTelephoneTestCase(APITestCase):
    """
    L'OTP a été déplacé de l'inscription vers la connexion : l'inscription par
    téléphone crée le compte directement, sans code à vérifier.
    """

    def setUp(self):
        self.client = APIClient()
        self.url    = '/api/v1/auth/sms/register/'

    def test_inscription_directe_sans_otp(self):
        response = self.client.post(self.url, {
            'phone': '0197000020', 'role': 'BUYER',
            'nom_complet': 'Test Direct', 'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)
        self.assertEqual(User.objects.filter(telephone='0197000020').count(), 1)

    def test_inscription_telephone_deja_utilise(self):
        User.objects.create_user(
            email='deja@agrosaanuu.com', password='testpass123',
            telephone='0197000021', prenom='Deja', nom='Existant',
            cip='30000001', role='BUYER',
        )
        response = self.client.post(self.url, {
            'phone': '0197000021', 'role': 'BUYER',
            'nom_complet': 'Nouveau', 'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inscription_mdp_trop_court_refusee(self):
        response = self.client.post(self.url, {
            'phone': '0197000022', 'role': 'BUYER',
            'nom_complet': 'Test', 'password': 'court',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.filter(telephone='0197000022').count(), 0)


class ConnexionParOTPTestCase(APITestCase):
    """La vérification du téléphone se fait désormais à chaque connexion par SMS."""

    def setUp(self):
        self.client = APIClient()
        self.user   = User.objects.create_user(
            email='otpuser@agrosaanuu.com', password='testpass123',
            telephone='0197000030', prenom='Otp', nom='User',
            cip='30000010', role='BUYER',
        )

    def test_demande_otp_sur_numero_inexistant_refusee(self):
        response = self.client.post('/api/v1/auth/sms/request-otp/', {'phone': '0197099999'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_connexion_par_otp_bout_en_bout(self):
        # 1. Demande du code
        response = self.client.post('/api/v1/auth/sms/request-otp/', {'phone': '0197000030'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        code = response.data.get('code_dev')
        self.assertIsNotNone(code, "Le code de dev doit être renvoyé en environnement de test (SMS non configuré).")

        # 2. Connexion avec le code reçu
        response = self.client.post('/api/v1/auth/sms/phone-login/', {
            'phone': '0197000030', 'code': code,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_connexion_par_otp_code_invalide_refusee(self):
        self.client.post('/api/v1/auth/sms/request-otp/', {'phone': '0197000030'}, format='json')
        response = self.client.post('/api/v1/auth/sms/phone-login/', {
            'phone': '0197000030', 'code': '000001',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_code_otp_reutilise_refuse(self):
        response = self.client.post('/api/v1/auth/sms/request-otp/', {'phone': '0197000030'}, format='json')
        code = response.data.get('code_dev')
        self.client.post('/api/v1/auth/sms/phone-login/', {'phone': '0197000030', 'code': code}, format='json')
        # Deuxième tentative avec le même code, déjà consommé
        response = self.client.post('/api/v1/auth/sms/phone-login/', {'phone': '0197000030', 'code': code}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
