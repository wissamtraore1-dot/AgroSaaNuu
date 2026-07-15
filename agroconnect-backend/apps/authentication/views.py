import re
import random
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
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


class ConnexionUnifieeView(APIView):
    """
    POST /api/v1/auth/login/
    Accepte email OU numéro de téléphone + mot de passe
    """
    permission_classes = [AllowAny]
    # Applique le scope 'login' (5/min, voir DEFAULT_THROTTLE_RATES) pour
    # limiter le brute force sur cet endpoint, le plus sensible de l'API.
    throttle_scope = 'login'

    def post(self, request):
        identifiant = request.data.get('identifiant', '').strip()
        password    = request.data.get('password',    '').strip()

        if not identifiant or not password:
            return Response(
                {'success': False, 'message': 'Identifiant et mot de passe requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = None
        if re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', identifiant):
            # C'est un email
            user = authenticate(request=request, email=identifiant, password=password)
        else:
            # C'est un numéro de téléphone
            try:
                u    = User.objects.get(telephone=identifiant)
                user = authenticate(request=request, email=u.email, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            return Response(
                {'success': False, 'message': 'Identifiant ou mot de passe incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not user.is_active:
            return Response(
                {'success': False, 'message': 'Compte désactivé. Contactez le support.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

        tokens = get_tokens_for_user(user)
        return Response({
            'success': True,
            'message': 'Connexion réussie.',
            'user':    UserSerializer(user).data,
            'tokens':  tokens,
        })


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
            'user':    UserSerializer(request.user, context={'request': request}).data,
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
                'user':    UserSerializer(request.user, context={'request': request}).data,
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
        first_error = next(iter(serializer.errors.values()), ['Données invalides.'])[0]
        return Response({'success': False, 'message': str(first_error)}, status=status.HTTP_400_BAD_REQUEST)


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
                try:
                    profile = user.seller_profile
                except SellerProfile.DoesNotExist:
                    profile = SellerProfile.objects.create(user=user)
                if document_type == 'cip':
                    profile.cip_photo = cip_photo
                    profile.kyc_status = SellerProfile.KYCStatus.PENDING
                elif document_type == 'business_license':
                    profile.licence_business = cip_photo
                profile.save()

            elif user.role == User.Role.TRANSPORTER:
                try:
                    profile = user.transporter_profile
                except Exception:
                    from apps.authentication.models import TransporterProfile as TP
                    profile = TP.objects.create(user=user)
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


# ── Admin — Gestion des utilisateurs ─────────────────────────────────────────

def _statut_frontend(user):
    """Mappe User.Status → valeur frontend attendue par Users.jsx."""
    mapping = {
        User.Status.ACTIVE:   'actif',
        User.Status.INACTIVE: 'suspendu',
        User.Status.BANNED:   'banni',
        User.Status.PENDING:  'actif',
    }
    return mapping.get(user.status, 'actif')


def _user_row(user):
    return {
        'id':          str(user.id),
        'prenom':      user.prenom,
        'nom':         user.nom,
        'email':       user.email,
        'telephone':   str(user.telephone) if user.telephone else '',
        'role':        user.role,
        'statut':      _statut_frontend(user),
        'date_joined': user.created_at.isoformat() if user.created_at else None,
        'ville':       user.ville,
        'is_active':   user.is_active,
    }


class AdminListeUtilisateursView(APIView):
    """GET /api/v1/auth/admin/users/?role=&statut=&search="""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)

        qs = User.objects.all().order_by('-created_at')

        role   = request.query_params.get('role', '')
        statut = request.query_params.get('statut', '')
        search = request.query_params.get('search', '').strip()

        if role and role != 'Tous':
            qs = qs.filter(role=role.upper())

        if statut and statut != 'Tous':
            mapping = {'actif': User.Status.ACTIVE, 'suspendu': User.Status.INACTIVE, 'banni': User.Status.BANNED}
            if statut in mapping:
                qs = qs.filter(status=mapping[statut])

        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(prenom__icontains=search) |
                Q(nom__icontains=search) |
                Q(email__icontains=search) |
                Q(telephone__icontains=search)
            )

        return Response({
            'success': True,
            'count':   qs.count(),
            'results': [_user_row(u) for u in qs],
        })


class AdminUserDetailView(APIView):
    """GET /api/v1/auth/admin/users/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Introuvable'}, status=404)
        return Response({'success': True, 'user': _user_row(user)})


class SuspendreUtilisateurView(APIView):
    """POST /api/v1/auth/admin/users/<id>/suspendre/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Introuvable'}, status=404)
        user.status    = User.Status.INACTIVE
        user.is_active = False
        user.save(update_fields=['status', 'is_active'])
        return Response({'success': True, 'message': f'{user.nom_complet} suspendu.'})


class BannirUtilisateurView(APIView):
    """POST /api/v1/auth/admin/users/<id>/bannir/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Introuvable'}, status=404)
        user.status    = User.Status.BANNED
        user.is_active = False
        user.save(update_fields=['status', 'is_active'])
        return Response({'success': True, 'message': f'{user.nom_complet} banni.'})


class ReactiverUtilisateurView(APIView):
    """POST /api/v1/auth/admin/users/<id>/reactiver/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Introuvable'}, status=404)
        user.status    = User.Status.ACTIVE
        user.is_active = True
        user.save(update_fields=['status', 'is_active'])
        return Response({'success': True, 'message': f'{user.nom_complet} réactivé.'})


class AdminStatsView(APIView):
    """GET /api/v1/auth/admin/stats/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        from apps.authentication.models import SellerProfile, TransporterProfile
        total_users    = User.objects.count()
        total_sellers  = User.objects.filter(role=User.Role.SELLER).count()
        total_buyers   = User.objects.filter(role=User.Role.BUYER).count()
        total_transporters = User.objects.filter(role=User.Role.TRANSPORTER).count()
        pending_verif_sellers = SellerProfile.objects.filter(est_verifie=False).count()
        pending_verif_transporters = TransporterProfile.objects.filter(est_verifie=False).count()
        return Response({
            'success':           True,
            'total_users':       total_users,
            'total_sellers':     total_sellers,
            'total_buyers':      total_buyers,
            'total_transporters': total_transporters,
            'pending_verifications': pending_verif_sellers + pending_verif_transporters,
            'pending_kyc':       0,
        })


class AdminLogsView(APIView):
    """GET /api/v1/auth/admin/logs/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        # Retourne les dernières connexions comme logs basiques
        users = User.objects.exclude(last_login_at=None).order_by('-last_login_at')[:50]
        logs = [{
            'id':        str(u.id),
            'user':      u.nom_complet,
            'email':     u.email,
            'role':      u.role,
            'action':    'Connexion',
            'timestamp': u.last_login_at.isoformat() if u.last_login_at else None,
        } for u in users]
        return Response({'success': True, 'results': logs, 'count': len(logs)})


# ── Vérification admin avant première publication / première mission ──────────

class ListeVerificationsVendeursView(APIView):
    """GET /api/v1/auth/admin/verifications/vendeurs/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        profils = SellerProfile.objects.filter(
            est_verifie=False
        ).select_related('user').order_by('date_demande_verification')
        data = []
        for p in profils:
            data.append({
                'user_id':                   str(p.user.id),
                'prenom':                    p.user.prenom,
                'nom':                       p.user.nom,
                'email':                     p.user.email,
                'telephone':                 str(p.user.telephone) if p.user.telephone else '',
                'ville':                     p.user.ville,
                'est_verifie':               p.est_verifie,
                'date_demande_verification': p.date_demande_verification.isoformat() if p.date_demande_verification else None,
                'cip_photo':                 request.build_absolute_uri(p.cip_photo.url) if p.cip_photo else None,
                'licence_business':          request.build_absolute_uri(p.licence_business.url) if p.licence_business else None,
            })
        return Response({'success': True, 'vendeurs': data})


class ListeVerificationsTransporteursView(APIView):
    """GET /api/v1/auth/admin/verifications/transporteurs/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)
        profils = TransporterProfile.objects.filter(
            est_verifie=False
        ).select_related('user').order_by('date_demande_verification')
        data = []
        for p in profils:
            data.append({
                'user_id':                   str(p.user.id),
                'prenom':                    p.user.prenom,
                'nom':                       p.user.nom,
                'email':                     p.user.email,
                'telephone':                 str(p.user.telephone) if p.user.telephone else '',
                'ville':                     p.user.ville,
                'est_verifie':               p.est_verifie,
                'date_demande_verification': p.date_demande_verification.isoformat() if p.date_demande_verification else None,
                'cip_photo':                 request.build_absolute_uri(p.cip_photo.url) if p.cip_photo else None,
            })
        return Response({'success': True, 'transporteurs': data})


class TraiterVerificationView(APIView):
    """
    POST /api/v1/auth/admin/verifications/traiter/
    Body: { user_id, type: 'vendeur'|'transporteur', action: 'approuver'|'rejeter', motif? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès refusé'}, status=403)

        user_id = request.data.get('user_id')
        type_   = request.data.get('type', '')
        action  = request.data.get('action', '')
        motif   = request.data.get('motif', '')

        if not all([user_id, type_, action]):
            return Response({'success': False, 'message': 'Paramètres manquants'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'Utilisateur introuvable'}, status=404)

        from apps.notifications.services import notifier_verification_approuvee, notifier_verification_rejetee

        if type_ == 'vendeur':
            try:
                profil = user.seller_profile
            except Exception:
                return Response({'success': False, 'message': 'Profil vendeur introuvable'}, status=404)
        elif type_ == 'transporteur':
            try:
                profil = user.transporter_profile
            except Exception:
                return Response({'success': False, 'message': 'Profil transporteur introuvable'}, status=404)
        else:
            return Response({'success': False, 'message': 'type invalide (vendeur|transporteur)'}, status=400)

        if action == 'approuver':
            profil.est_verifie = True
            profil.motif_rejet = ''
            profil.save(update_fields=['est_verifie', 'motif_rejet'])
            notifier_verification_approuvee(user)
            return Response({'success': True, 'message': f'{type_.capitalize()} approuvé(e).'})
        elif action == 'rejeter':
            profil.est_verifie = False
            profil.date_demande_verification = None
            profil.motif_rejet = motif
            profil.save(update_fields=['est_verifie', 'date_demande_verification', 'motif_rejet'])
            notifier_verification_rejetee(user, motif)
            return Response({'success': True, 'message': f'{type_.capitalize()} rejeté(e).'})
        else:
            return Response({'success': False, 'message': 'action invalide (approuver|rejeter)'}, status=400)