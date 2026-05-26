# authentication/sms_auth_views.py - NOUVEL SYSTÈME D'AUTHENTIFICATION PAR SMS

import random
from datetime import timedelta
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.conf import settings

from .models import User, OTPCode
from .serializers import UserSerializer

# ========== SERVICES SMS ==========

class SMSService:
    """Service pour envoyer SMS via Twilio"""
    
    @staticmethod
    def send_otp_sms(phone_number, otp_code):
        """Envoyer OTP par SMS"""
        try:
            from twilio.rest import Client
            
            account_sid = settings.TWILIO_ACCOUNT_SID
            auth_token = settings.TWILIO_AUTH_TOKEN
            twilio_phone = settings.TWILIO_PHONE_NUMBER
            
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"Votre code de vérification AgroSaaNuu est: {otp_code}. Valable 5 minutes.",
                from_=twilio_phone,
                to=str(phone_number)
            )
            return True, message.sid
        except Exception as e:
            print(f"Erreur SMS Twilio: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def generate_otp():
        """Générer code OTP 6 chiffres"""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])


def get_tokens_for_user(user):
    """Générer tokens JWT"""
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['nom_complet'] = user.nom_complet
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ========== AUTHENTIFICATION SMS ==========

class RequestOTPView(APIView):
    """
    POST /api/auth/sms/request-otp/
    Demander code OTP par SMS
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response({
                'success': False,
                'message': 'Numéro de téléphone requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Générer OTP
        otp_code = SMSService.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)
        
        # Sauvegarder OTP (pas encore lié à un user)
        otp = OTPCode.objects.create(
            phone=phone,
            code=otp_code,
            type=OTPCode.Type.INSCRIPTION,
            expire_at=expires_at
        )
        
        # Envoyer SMS
        success, result = SMSService.send_otp_sms(phone, otp_code)
        
        if success:
            return Response({
                'success': True,
                'message': f'Code OTP envoyé à {phone}',
                'otp_id': otp.id,  # Pour le frontend
                'expires_in': 300  # 5 minutes en secondes
            }, status=status.HTTP_201_CREATED)
        else:
            otp.delete()
            return Response({
                'success': False,
                'message': f'Erreur lors de l\'envoi SMS: {result}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPAndCreateAccountView(APIView):
    """
    POST /api/auth/sms/verify-and-register/
    Vérifier OTP et créer compte utilisateur
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        otp_code = request.data.get('code')
        role = request.data.get('role')  # BUYER, SELLER, TRANSPORTER
        prenom = request.data.get('prenom')
        nom = request.data.get('nom')
        ville = request.data.get('ville', '')
        
        # Validation
        if not all([phone, otp_code, role, prenom, nom]):
            return Response({
                'success': False,
                'message': 'Données manquantes'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier OTP
        try:
            otp = OTPCode.objects.filter(
                phone=phone,
                code=otp_code,
                type=OTPCode.Type.INSCRIPTION,
                est_utilise=False
            ).latest('created_at')
            
            if otp.expire_at < timezone.now():
                return Response({
                    'success': False,
                    'message': 'Code OTP expiré'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except OTPCode.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Code OTP invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier utilisateur n'existe pas déjà
        if User.objects.filter(telephone=phone).exists():
            return Response({
                'success': False,
                'message': 'Utilisateur existe déjà'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer utilisateur
        try:
            user = User.objects.create_user(
                telephone=phone,
                prenom=prenom,
                nom=nom,
                role=role,
                ville=ville,
                password=None,  # SMS auth, pas de mot de passe
                phone_verified=True,
                status=User.Status.ACTIVE,
            )
            
            # Marquer OTP comme utilisé
            otp.est_utilise = True
            otp.save()
            
            # Générer tokens
            tokens = get_tokens_for_user(user)
            
            return Response({
                'success': True,
                'message': 'Compte créé avec succès',
                'user': UserSerializer(user).data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PhoneLoginView(APIView):
    """
    POST /api/auth/sms/phone-login/
    Login avec téléphone + OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        otp_code = request.data.get('code')
        
        if not all([phone, otp_code]):
            return Response({
                'success': False,
                'message': 'Téléphone et code requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier utilisateur existe
        try:
            user = User.objects.get(telephone=phone)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier OTP
        try:
            otp = OTPCode.objects.filter(
                phone=phone,
                code=otp_code,
                type=OTPCode.Type.INSCRIPTION,
                est_utilise=False
            ).latest('created_at')
            
            if otp.expire_at < timezone.now():
                return Response({
                    'success': False,
                    'message': 'Code OTP expiré'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except OTPCode.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Code OTP invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Marquer OTP comme utilisé
        otp.est_utilise = True
        otp.save()
        
        # Mettre à jour last_login
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # Générer tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'success': True,
            'message': 'Connexion réussie',
            'user': UserSerializer(user).data,
            'tokens': tokens,
        })


class ResendOTPView(APIView):
    """
    POST /api/auth/sms/resend-otp/
    Renvoyer code OTP
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response({
                'success': False,
                'message': 'Numéro requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Générer nouveau OTP
        otp_code = SMSService.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=5)
        
        otp = OTPCode.objects.create(
            phone=phone,
            code=otp_code,
            type=OTPCode.Type.INSCRIPTION,
            expire_at=expires_at
        )
        
        success, result = SMSService.send_otp_sms(phone, otp_code)
        
        if success:
            return Response({
                'success': True,
                'message': 'Code renvoyé',
                'otp_id': otp.id,
                'expires_in': 300
            })
        else:
            otp.delete()
            return Response({
                'success': False,
                'message': 'Erreur SMS'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompleteProfileView(APIView):
    """
    PUT /api/auth/complete-profile/
    Compléter le profil utilisateur
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        
        # Données à mettre à jour
        data = {
            'prenom': request.data.get('prenom', user.prenom),
            'nom': request.data.get('nom', user.nom),
            'ville': request.data.get('ville', user.ville),
            'adresse': request.data.get('adresse', user.adresse),
            'bio': request.data.get('bio', user.bio),
            'profile_completed': True
        }
        
        # Upload avatar si fourni
        if 'avatar' in request.FILES:
            data['avatar'] = request.FILES['avatar']
        
        for field, value in data.items():
            if value is not None:
                setattr(user, field, value)
        
        user.save()
        
        return Response({
            'success': True,
            'message': 'Profil complété',
            'user': UserSerializer(user).data,
        })
