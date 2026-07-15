import re
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, SellerProfile, TransporterProfile, OTPCode


class InscriptionSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    association      = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model  = User
        fields = [
            'email', 'telephone', 'prenom', 'nom',
            'cip', 'role', 'ville', 'adresse',
            'password', 'password_confirm', 'association',
        ]

    def validate_telephone(self, value):
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError(
                'Le numéro de téléphone doit contenir exactement 10 chiffres.'
            )
        return value

    def validate_cip(self, value):
        if not re.match(r'^\d{8,12}$', value):
            raise serializers.ValidationError(
                'Le CIP doit contenir entre 8 et 12 chiffres.'
            )
        return value

    def validate_role(self, value):
        if value not in [User.Role.BUYER, User.Role.SELLER, User.Role.TRANSPORTER]:
            raise serializers.ValidationError('Rôle non autorisé.')
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Les mots de passe ne correspondent pas.'
            })
        return data

    def create(self, validated_data):
        from django.utils import timezone as tz
        from apps.notifications.services import notifier_demande_verification
        association = validated_data.pop('association', '')
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.status = User.Status.PENDING
        user.save()
        if user.role == User.Role.SELLER:
            SellerProfile.objects.create(user=user, association=association, date_demande_verification=tz.now())
            notifier_demande_verification(user)
        elif user.role == User.Role.TRANSPORTER:
            TransporterProfile.objects.create(user=user, date_demande_verification=tz.now())
            notifier_demande_verification(user)
        return user


class ConnexionSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            email=data.get('email'),
            password=data.get('password')
        )
        if not user:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        if not user.is_active:
            raise serializers.ValidationError('Compte désactivé.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    nom_complet         = serializers.ReadOnlyField()
    seller_profile      = serializers.SerializerMethodField()
    transporter_profile = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'telephone', 'prenom', 'nom',
            'nom_complet', 'cip', 'role', 'status',
            'ville', 'adresse', 'bio', 'photo',
            'is_verified', 'cip_verifie', 'created_at',
            'seller_profile', 'transporter_profile',
        ]
        read_only_fields = [
            'id', 'email', 'cip', 'role',
            'status', 'is_verified', 'cip_verifie', 'created_at',
        ]

    def get_seller_profile(self, obj):
        if obj.role == User.Role.SELLER:
            try:
                p = obj.seller_profile
                request = self.context.get('request')
                def url(f):
                    if not f: return None
                    return request.build_absolute_uri(f.url) if request else f.url
                return {
                    'association':               p.association,
                    'note_moyenne':              str(p.note_moyenne),
                    'total_ventes':              p.total_ventes,
                    'est_certifie':              p.est_certifie,
                    'est_verifie':               p.est_verifie,
                    'date_demande_verification': p.date_demande_verification.isoformat() if p.date_demande_verification else None,
                    'motif_rejet':               p.motif_rejet,
                    'cip_photo':                 url(p.cip_photo),
                    'licence_business':          url(p.licence_business),
                }
            except Exception:
                return None
        return None

    def get_transporter_profile(self, obj):
        if obj.role == User.Role.TRANSPORTER:
            try:
                p = obj.transporter_profile
                request = self.context.get('request')
                def url(f):
                    if not f: return None
                    return request.build_absolute_uri(f.url) if request else f.url
                return {
                    'note_moyenne':              str(p.note_moyenne),
                    'total_missions':            p.total_missions,
                    'est_disponible':            p.est_disponible,
                    'zones':                     p.zones,
                    'est_certifie':              p.est_certifie,
                    'est_verifie':               p.est_verifie,
                    'date_demande_verification': p.date_demande_verification.isoformat() if p.date_demande_verification else None,
                    'motif_rejet':               p.motif_rejet,
                    'cip_photo':                 url(p.cip_photo),
                }
            except Exception:
                return None
        return None


class UpdateProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['prenom', 'nom', 'telephone', 'ville', 'adresse', 'bio', 'photo']

    def validate_telephone(self, value):
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError(
                'Le numéro de téléphone doit contenir exactement 10 chiffres.'
            )
        return value


class ChangerMotDePasseSerializer(serializers.Serializer):
    mot_de_passe_actuel  = serializers.CharField(write_only=True)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=8)
    confirmation         = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['mot_de_passe_actuel']):
            raise serializers.ValidationError({
                'mot_de_passe_actuel': 'Mot de passe actuel incorrect.'
            })
        if data['nouveau_mot_de_passe'] != data['confirmation']:
            raise serializers.ValidationError({
                'confirmation': 'Les mots de passe ne correspondent pas.'
            })
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['nouveau_mot_de_passe'])
        user.save()
        return user


class EnvoyerOTPSerializer(serializers.Serializer):
    telephone = serializers.CharField()
    type      = serializers.ChoiceField(choices=OTPCode.Type.choices)


class VerifierOTPSerializer(serializers.Serializer):
    telephone = serializers.CharField()
    code      = serializers.CharField(max_length=6, min_length=6)
    type      = serializers.ChoiceField(choices=OTPCode.Type.choices)


class ReinitialisationMDPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmerReinitialisationSerializer(serializers.Serializer):
    email                = serializers.EmailField()
    code                 = serializers.CharField(max_length=6)
    nouveau_mot_de_passe = serializers.CharField(min_length=8)
    confirmation         = serializers.CharField()

    def validate(self, data):
        if data['nouveau_mot_de_passe'] != data['confirmation']:
            raise serializers.ValidationError({
                'confirmation': 'Les mots de passe ne correspondent pas.'
            })
        return data


# ===== KYC DOCUMENT SERIALIZERS =====

class SellerProfileSerializer(serializers.ModelSerializer):
    kyc_status = serializers.CharField(read_only=True)
    kyc_verified_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = SellerProfile
        fields = [
            'id', 'user', 'association', 'description', 'note_moyenne',
            'total_ventes', 'est_certifie',
            'numero_immatriculation', 'numero_impot',
            'cip_photo', 'licence_business',
            'kyc_status', 'kyc_verified_at',
            'compte_bancaire', 'nom_titulaire_compte',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'note_moyenne', 'total_ventes', 'est_certifie',
            'kyc_status', 'kyc_verified_at', 'created_at', 'updated_at'
        ]


class TransporterProfileSerializer(serializers.ModelSerializer):
    kyc_status = serializers.CharField(read_only=True)
    kyc_verified_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = TransporterProfile
        fields = [
            'id', 'user', 'note_moyenne', 'total_missions',
            'est_disponible', 'zones', 'est_certifie',
            'cip_photo', 'kyc_status', 'kyc_verified_at',
            'compte_bancaire', 'nom_titulaire_compte',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'note_moyenne', 'total_missions', 'est_certifie',
            'kyc_status', 'kyc_verified_at', 'created_at', 'updated_at'
        ]


class UploadKYCDocumentSerializer(serializers.Serializer):
    document_type = serializers.ChoiceField(choices=['cip', 'business_license'])
    cip_photo = serializers.ImageField(required=True)
    
    def validate_cip_photo(self, value):
        # Valider la taille (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image trop grande (max 5MB).')
        return value


class GetKYCStatusSerializer(serializers.Serializer):
    kyc_status = serializers.CharField(read_only=True)
    kyc_verified_at = serializers.DateTimeField(read_only=True, allow_null=True)
    cip_uploaded = serializers.BooleanField(read_only=True)
    business_license_uploaded = serializers.BooleanField(read_only=True, required=False)


class AdminVerifyKYCSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    kyc_status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED', 'PENDING'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')
    
    def validate_user_id(self, value):
        try:
            user = User.objects.get(id=value)
            self.context['user'] = user
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('Utilisateur non trouvé.')
