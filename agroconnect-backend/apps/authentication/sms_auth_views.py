# authentication/sms_auth_views.py

from datetime import timedelta
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from django.conf import settings

from .models import User, OTPCode, SellerProfile, TransporterProfile
from .serializers import UserSerializer
from .sms_service import send_otp_sms, generate_otp


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['nom_complet'] = user.nom_complet
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RequestOTPView(APIView):
    """
    POST /api/v1/auth/sms/request-otp/
    Envoie un OTP par SMS. Retourne `existing: bool`.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone:
            return Response({'success': False, 'message': 'Numéro de téléphone requis'},
                            status=status.HTTP_400_BAD_REQUEST)

        existing = User.objects.filter(telephone=phone).exists()

        OTPCode.objects.filter(phone=phone, est_utilise=False).update(est_utilise=True)

        otp_code = generate_otp()
        otp = OTPCode.objects.create(
            phone=phone,
            code=otp_code,
            type=OTPCode.Type.INSCRIPTION,
            expire_at=timezone.now() + timedelta(minutes=5)
        )

        sms_ok, _ = send_otp_sms(phone, otp_code)

        if not sms_ok:
            print(f"[DEV] OTP pour {phone}: {otp_code}")

        return Response({
            'success':    True,
            'message':    f'Code envoyé à {phone}',
            'otp_id':     str(otp.id),
            'existing':   existing,
            'expires_in': 300,
            'code_dev':   otp_code if not sms_ok else None,
        }, status=status.HTTP_201_CREATED)


class VerifyOTPAndCreateAccountView(APIView):
    """
    POST /api/v1/auth/sms/verify-and-register/
    Champs requis : phone, code, role
    Champs optionnels : prenom, nom, ville, password, email
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone         = request.data.get('phone',         '').strip()
        otp_code      = request.data.get('code',          '').strip()
        role          = request.data.get('role',          'BUYER').strip()
        nom_complet   = request.data.get('nom_complet',   '').strip()
        ville         = request.data.get('ville',         '').strip()
        password      = request.data.get('password')
        email_input   = request.data.get('email',         '').strip()
        # Champs spécifiques par rôle
        nom_boutique  = request.data.get('nom_boutique',  '').strip()  # Vendeur
        type_vehicule = request.data.get('type_vehicule', '').strip()  # Transporteur

        if not all([phone, otp_code, role]):
            return Response({'success': False, 'message': 'Téléphone, code et rôle requis'},
                            status=status.HTTP_400_BAD_REQUEST)

        if role not in [User.Role.BUYER, User.Role.SELLER, User.Role.TRANSPORTER]:
            return Response({'success': False, 'message': 'Rôle invalide'},
                            status=status.HTTP_400_BAD_REQUEST)

        # DEV bypass : code magique 000000 accepté si DEBUG=True
        dev_bypass = settings.DEBUG and otp_code == '000000'

        if not dev_bypass:
            try:
                otp = OTPCode.objects.filter(
                    phone=phone, code=otp_code,
                    type=OTPCode.Type.INSCRIPTION, est_utilise=False
                ).latest('created_at')

                if otp.expire_at < timezone.now():
                    return Response({'success': False, 'message': 'Code OTP expiré'},
                                    status=status.HTTP_400_BAD_REQUEST)
            except OTPCode.DoesNotExist:
                return Response({'success': False, 'message': 'Code OTP invalide'},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            otp = None  # pas d'OTP à marquer utilisé

        if User.objects.filter(telephone=phone).exists():
            return Response({'success': False, 'message': 'Un compte existe déjà avec ce numéro'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Valider et déterminer l'email
        import re as _re
        clean_phone = ''.join(c for c in phone if c.isdigit())
        if email_input:
            if not _re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email_input):
                return Response({'success': False, 'message': 'Adresse email invalide'},
                                status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email_input).exists():
                return Response({'success': False, 'message': 'Cette adresse email est déjà utilisée'},
                                status=status.HTTP_400_BAD_REQUEST)
            final_email = email_input
        else:
            final_email = f"sms{clean_phone}@agrosaanuu.phone"

        try:

            # Décomposer nom_complet → prenom + nom
            parts  = nom_complet.split(' ', 1) if nom_complet else []
            prenom = parts[0] if parts else ''
            nom    = parts[1] if len(parts) > 1 else (parts[0] if parts else f"Utilisateur {clean_phone[-4:]}")

            user = User.objects.create_user(
                email=final_email,
                telephone=phone,
                prenom=prenom,
                nom=nom,
                role=role,
                ville=ville,
                password=password,
                status=User.Status.ACTIVE,
                is_verified=True,
            )

            # Créer le profil spécialisé selon le rôle
            from apps.notifications.services import notifier_demande_verification
            if role == User.Role.SELLER:
                SellerProfile.objects.create(
                    user=user,
                    association=nom_boutique,
                    date_demande_verification=timezone.now(),
                )
                notifier_demande_verification(user)
            elif role == User.Role.TRANSPORTER:
                TransporterProfile.objects.create(
                    user=user,
                    zones=[type_vehicule] if type_vehicule else [],
                    date_demande_verification=timezone.now(),
                )
                notifier_demande_verification(user)

            if otp:
                otp.est_utilise = True
                otp.save()

            return Response({
                'success': True,
                'message': 'Compte créé avec succès',
                'user':    UserSerializer(user).data,
                'tokens':  get_tokens_for_user(user),
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'success': False, 'message': f'Erreur: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PhoneLoginView(APIView):
    """POST /api/v1/auth/sms/phone-login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        phone    = request.data.get('phone', '').strip()
        otp_code = request.data.get('code',  '').strip()

        if not phone or not otp_code:
            return Response({'success': False, 'message': 'Téléphone et code requis'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(telephone=phone)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Aucun compte avec ce numéro'},
                            status=status.HTTP_404_NOT_FOUND)

        # DEV bypass : code magique 000000 accepté si DEBUG=True
        dev_bypass = settings.DEBUG and otp_code == '000000'

        if not dev_bypass:
            try:
                otp = OTPCode.objects.filter(
                    phone=phone, code=otp_code,
                    type=OTPCode.Type.INSCRIPTION, est_utilise=False
                ).latest('created_at')

                if otp.expire_at < timezone.now():
                    return Response({'success': False, 'message': 'Code OTP expiré'},
                                    status=status.HTTP_400_BAD_REQUEST)
            except OTPCode.DoesNotExist:
                return Response({'success': False, 'message': 'Code OTP invalide'},
                                status=status.HTTP_400_BAD_REQUEST)

            otp.est_utilise = True
            otp.save()

        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

        return Response({
            'success': True,
            'message': 'Connexion réussie',
            'user':    UserSerializer(user).data,
            'tokens':  get_tokens_for_user(user),
        })


class ResendOTPView(APIView):
    """POST /api/v1/auth/sms/resend-otp/"""
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone:
            return Response({'success': False, 'message': 'Numéro requis'},
                            status=status.HTTP_400_BAD_REQUEST)

        OTPCode.objects.filter(phone=phone, est_utilise=False).update(est_utilise=True)

        otp_code = generate_otp()
        otp = OTPCode.objects.create(
            phone=phone,
            code=otp_code,
            type=OTPCode.Type.INSCRIPTION,
            expire_at=timezone.now() + timedelta(minutes=5)
        )

        sms_ok, _ = send_otp_sms(phone, otp_code)
        if not sms_ok:
            print(f"[DEV] OTP renvoyé pour {phone}: {otp_code}")

        return Response({
            'success':    True,
            'message':    'Code renvoyé',
            'otp_id':     str(otp.id),
            'expires_in': 300,
            'code_dev':   otp_code if not sms_ok else None,
        })


class CompleteProfileView(APIView):
    """PUT /api/v1/auth/complete-profile/"""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        for field in ['prenom', 'nom', 'ville', 'adresse', 'bio', 'cip']:
            val = request.data.get(field)
            if val is not None:
                setattr(user, field, val)

        if 'photo' in request.FILES:
            user.photo = request.FILES['photo']

        user.save()
        return Response({
            'success': True,
            'message': 'Profil mis à jour',
            'user':    UserSerializer(user).data,
        })
