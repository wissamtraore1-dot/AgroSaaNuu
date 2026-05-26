from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


class InscriptionTestCase(APITestCase):

    def setUp(self):
        self.url    = reverse('authentication:inscription')
        self.client = APIClient()
        self.data   = {
            'email':            'test@agroconnect.bj',
            'telephone':        '+2290197000001',
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
            email='test@agroconnect.bj',
            password='testpass123',
            telephone='+2290197000001',
            prenom='Test', nom='User',
            cip='12345678', role='BUYER',
        )

    def test_connexion_succes(self):
        response = self.client.post(self.url, {
            'email':    'test@agroconnect.bj',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data)

    def test_connexion_mauvais_mdp(self):
        response = self.client.post(self.url, {
            'email':    'test@agroconnect.bj',
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
            email='test@agroconnect.bj',
            password='testpass123',
            telephone='+2290197000001',
            prenom='Test', nom='User',
            cip='12345678', role='BUYER',
        )
        self.client.force_authenticate(user=self.user)

    def test_voir_profil(self):
        response = self.client.get(reverse('authentication:mon-profil'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'test@agroconnect.bj')

    def test_modifier_profil(self):
        response = self.client.put(
            reverse('authentication:mon-profil'),
            {'prenom': 'Nouveau', 'nom': 'Nom'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['prenom'], 'Nouveau')
