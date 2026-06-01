import random
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone
from datetime import timedelta

from .models import User, OTPCode, SellerProfile, TransporterProfile
from .serializers import (
    InscriptionSerializer,
    ConnexionSerializer,
    UserSerializer,
    UpdateProfilSerializer,
    ChangerMotDePasseSerializer,
    EnvoyerOTPSerializer,
    VerifierOTPSerializer,
    ReinitialisationMDPSerializer,
    ConfirmerReinitialisationSerializer,
    SellerProfileSerializer,
    TransporterProfileSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role']        = user.role
    refresh['nom_complet'] = user.nom_complet
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class InscriptionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = InscriptionSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'success': True,
                'message': 'Inscription réussie.',
                'user':    UserSerializer(user).data,
                'tokens':  tokens,
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ConnexionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConnexionSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            user   = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            user.last_login_at = timezone.now()
            user.save(update_fields=['last_login_at'])
            return Response({
                'success': True,
                'message': 'Connexion réussie.',
                'user':    UserSerializer(user).data,
                'tokens':  tokens,
            })
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class DeconnexionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'success': True, 'message': 'Déconnexion réussie.'})
        except TokenError:
            return Response({
                'success': False,
                'message': 'Token invalide.',
            }, status=status.HTTP_400_BAD_REQUEST)


class MonProfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'success': True,
            'user':    UserSerializer(request.user).data,
        })

    def put(self, request):
        serializer = UpdateProfilSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profil mis à jour.',
                'user':    UserSerializer(request.user).data,
            })
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangerMotDePasseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangerMotDePasseSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Mot de passe modifié.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class EnvoyerOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EnvoyerOTPSerializer(data=request.data)
        if serializer.is_valid():
            telephone = serializer.validated_data['telephone']
            type_otp  = serializer.validated_data['type']
            try:
                user = User.objects.get(telephone=telephone)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Aucun compte avec ce numéro.',
                }, status=status.HTTP_404_NOT_FOUND)

            code = str(random.randint(100000, 999999))
            OTPCode.objects.filter(
                user=user, type=type_otp, est_utilise=False
            ).update(est_utilise=True)
            OTPCode.objects.create(
                user=user, code=code, type=type_otp,
                expire_at=timezone.now() + timedelta(minutes=10)
            )
            return Response({
                'success':  True,
                'message':  f'Code OTP envoyé sur {telephone}.',
                'code_dev': code,
            })
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifierOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifierOTPSerializer(data=request.data)
        if serializer.is_valid():
            telephone = serializer.validated_data['telephone']
            code      = serializer.validated_data['code']
            type_otp  = serializer.validated_data['type']
            try:
                user = User.objects.get(telephone=telephone)
                otp  = OTPCode.objects.get(
                    user=user, code=code,
                    type=type_otp, est_utilise=False
                )
            except (User.DoesNotExist, OTPCode.DoesNotExist):
                return Response({
                    'success': False,
                    'message': 'Code OTP invalide.',
                }, status=status.HTTP_400_BAD_REQUEST)

            if not otp.est_valide:
                return Response({
                    'success': False,
                    'message': 'Code OTP expiré.',
                }, status=status.HTTP_400_BAD_REQUEST)

            otp.est_utilise = True
            otp.save()

            if type_otp == OTPCode.Type.INSCRIPTION:
                user.is_verified = True
                user.status      = User.Status.ACTIVE
                user.save(update_fields=['is_verified', 'status'])

            return Response({'success': True, 'message': 'OTP vérifié.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ReinitialisationMDPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ReinitialisationMDPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                code = str(random.randint(100000, 999999))
                OTPCode.objects.create(
                    user=user, code=code,
                    type=OTPCode.Type.REINIT_MDP,
                    expire_at=timezone.now() + timedelta(minutes=15)
                )
                return Response({
                    'success':  True,
                    'message':  'Code envoyé.',
                    'code_dev': code,
                })
            except User.DoesNotExist:
                return Response({'success': True, 'message': 'Code envoyé si email existe.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ConfirmerReinitialisationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmerReinitialisationSerializer(data=request.data)
        if serializer.is_valid():
            email   = serializer.validated_data['email']
            code    = serializer.validated_data['code']
            nouveau = serializer.validated_data['nouveau_mot_de_passe']
            try:
                user = User.objects.get(email=email)
                otp  = OTPCode.objects.get(
                    user=user, code=code,
                    type=OTPCode.Type.REINIT_MDP,
                    est_utilise=False
                )
            except (User.DoesNotExist, OTPCode.DoesNotExist):
                return Response({
                    'success': False,
                    'message': 'Code invalide.',
                }, status=status.HTTP_400_BAD_REQUEST)

            if not otp.est_valide:
                return Response({
                    'success': False,
                    'message': 'Code expiré.',
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(nouveau)
            user.save()
            otp.est_utilise = True
            otp.save()
            return Response({'success': True, 'message': 'Mot de passe réinitialisé.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


# ===== PROFILS SPÉCIALISÉS =====

class SellerProfileView(APIView):
    """GET/PUT /api/v1/auth/seller-profile/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.SELLER:
            return Response({'success': False, 'message': 'Réservé aux vendeurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profil = request.user.seller_profile
        except SellerProfile.DoesNotExist:
            profil = SellerProfile.objects.create(user=request.user)
        return Response({'success': True, 'profil': SellerProfileSerializer(profil).data})

    def put(self, request):
        if request.user.role != User.Role.SELLER:
            return Response({'success': False, 'message': 'Réservé aux vendeurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profil = request.user.seller_profile
        except SellerProfile.DoesNotExist:
            profil = SellerProfile.objects.create(user=request.user)
        serializer = SellerProfileSerializer(profil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Profil vendeur mis à jour.', 'profil': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class TransporterProfileView(APIView):
    """GET/PUT /api/v1/auth/transporter-profile/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.TRANSPORTER:
            return Response({'success': False, 'message': 'Réservé aux transporteurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profil = request.user.transporter_profile
        except TransporterProfile.DoesNotExist:
            profil = TransporterProfile.objects.create(user=request.user)
        return Response({'success': True, 'profil': TransporterProfileSerializer(profil).data})

    def put(self, request):
        if request.user.role != User.Role.TRANSPORTER:
            return Response({'success': False, 'message': 'Réservé aux transporteurs.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profil = request.user.transporter_profile
        except TransporterProfile.DoesNotExist:
            profil = TransporterProfile.objects.create(user=request.user)
        serializer = TransporterProfileSerializer(profil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Profil transporteur mis à jour.', 'profil': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# ===== KYC VERIFICATION ENDPOINTS =====

class UploadKYCDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Upload CIP document for KYC verification"""
        user = request.user
        document_type = request.data.get('document_type')  # 'cip' or 'business_license'
        cip_photo = request.FILES.get('cip_photo')
        
        if not cip_photo:
            return Response({
                'success': False,
                'message': 'Aucun fichier fourni.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if user.role == User.Role.SELLER:
                profile = user.seller_profile
                if document_type == 'cip':
                    profile.cip_photo = cip_photo
                    profile.kyc_status = SellerProfile.KYCStatus.PENDING
                elif document_type == 'business_license':
                    profile.licence_business = cip_photo
                profile.save()
                
            elif user.role == User.Role.TRANSPORTER:
                profile = user.transporter_profile
                profile.cip_photo = cip_photo
                profile.kyc_status = TransporterProfile.KYCStatus.PENDING
                profile.save()
            
            return Response({
                'success': True,
                'message': 'Document uploadé. En attente de vérification.',
                'kyc_status': profile.kyc_status,
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e),
            }, status=status.HTTP_400_BAD_REQUEST)


class GetKYCStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get KYC status for current user"""
        user = request.user
        
        if user.role == User.Role.SELLER:
            profile = user.seller_profile
            return Response({
                'success': True,
                'kyc_status': profile.kyc_status,
                'kyc_verified_at': profile.kyc_verified_at,
                'cip_uploaded': bool(profile.cip_photo),
                'business_license_uploaded': bool(profile.licence_business),
            })
        
        elif user.role == User.Role.TRANSPORTER:
            profile = user.transporter_profile
            return Response({
                'success': True,
                'kyc_status': profile.kyc_status,
                'kyc_verified_at': profile.kyc_verified_at,
                'cip_uploaded': bool(profile.cip_photo),
            })
        
        return Response({
            'success': False,
            'message': 'Utilisateur non valide.',
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminVerifyKYCView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Admin approves/rejects KYC verification"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Permissions insuffisantes.',
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        kyc_status = request.data.get('kyc_status')  # 'APPROVED' or 'REJECTED'
        
        try:
            user = User.objects.get(id=user_id)
            
            if user.role == User.Role.SELLER:
                profile = user.seller_profile
            elif user.role == User.Role.TRANSPORTER:
                profile = user.transporter_profile
            else:
                return Response({
                    'success': False,
                    'message': 'Type utilisateur non valide.',
                }, status=status.HTTP_400_BAD_REQUEST)
            
            profile.kyc_status = kyc_status
            profile.kyc_verified_at = timezone.now() if kyc_status == 'APPROVED' else None
            profile.save()
            
            return Response({
                'success': True,
                'message': f'KYC {kyc_status.lower()} pour {user.nom_complet}.',
            })
        
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Utilisateur non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)