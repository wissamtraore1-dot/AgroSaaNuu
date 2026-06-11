from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from apps.common.models import TimeStampedModel
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):

    class Role(models.TextChoices):
        BUYER       = 'BUYER',       _('Acheteur')
        SELLER      = 'SELLER',      _('Vendeur')
        TRANSPORTER = 'TRANSPORTER', _('Transporteur')
        ADMIN       = 'ADMIN',       _('Administrateur')

    class Status(models.TextChoices):
        ACTIVE   = 'ACTIVE',   _('Actif')
        INACTIVE = 'INACTIVE', _('Inactif')
        BANNED   = 'BANNED',   _('Banni')
        PENDING  = 'PENDING',  _('En attente')

    email     = models.EmailField(unique=True)
    telephone = PhoneNumberField(unique=True, region='BJ', null=True, blank=True)
    prenom = models.CharField(max_length=100, blank=True)
    nom         = models.CharField(max_length=100)
    cip = models.CharField(max_length=12, unique=True, blank=True, null=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.BUYER)
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    ville       = models.CharField(max_length=100, blank=True, default='')
    adresse     = models.TextField(blank=True, default='')
    bio         = models.TextField(blank=True, default='')
    photo       = models.ImageField(upload_to='users/photos/', blank=True, null=True)
    is_staff    = models.BooleanField(default=False)
    is_active   = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)  # Email verified
    cip_verifie = models.BooleanField(default=False)
    last_login_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nom']

    objects = UserManager()

    class Meta:
        verbose_name        = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        db_table            = 'users'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    @property
    def is_buyer(self):
        return self.role == self.Role.BUYER

    @property
    def is_seller(self):
        return self.role == self.Role.SELLER

    @property
    def is_transporter(self):
        return self.role == self.Role.TRANSPORTER


class SellerProfile(TimeStampedModel):
    
    class KYCStatus(models.TextChoices):
        PENDING  = 'PENDING',  _('En attente')
        APPROVED = 'APPROVED', _('Approuvé')
        REJECTED = 'REJECTED', _('Rejeté')
    
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    association  = models.CharField(max_length=200, blank=True, default='')
    description  = models.TextField(blank=True, default='')
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ventes = models.PositiveIntegerField(default=0)
    est_certifie = models.BooleanField(default=False)
    
    # KYC/Documents
    numero_immatriculation = models.CharField(max_length=50, blank=True, null=True)
    numero_impot = models.CharField(max_length=50, blank=True, null=True)
    cip_photo = models.ImageField(upload_to='documents/cip/', blank=True, null=True)
    licence_business = models.FileField(upload_to='documents/business_license/', blank=True, null=True)
    kyc_status = models.CharField(max_length=20, choices=KYCStatus.choices, default=KYCStatus.PENDING)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)

    # Vérification admin avant première publication
    est_verifie = models.BooleanField(default=False)
    date_demande_verification = models.DateTimeField(null=True, blank=True)
    motif_rejet = models.TextField(blank=True, default='')

    # Bank account for payouts
    compte_bancaire = models.CharField(max_length=50, blank=True, null=True)
    nom_titulaire_compte = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = 'seller_profiles'

    def __str__(self):
        return f"Vendeur — {self.user.nom_complet}"


class TransporterProfile(TimeStampedModel):
    
    class KYCStatus(models.TextChoices):
        PENDING  = 'PENDING',  _('En attente')
        APPROVED = 'APPROVED', _('Approuvé')
        REJECTED = 'REJECTED', _('Rejeté')
    
    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    note_moyenne   = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_missions = models.PositiveIntegerField(default=0)
    est_disponible = models.BooleanField(default=True)
    zones          = models.JSONField(default=list)
    est_certifie   = models.BooleanField(default=False)
    
    # KYC/Documents
    cip_photo = models.ImageField(upload_to='documents/cip/', blank=True, null=True)
    kyc_status = models.CharField(max_length=20, choices=KYCStatus.choices, default=KYCStatus.PENDING)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)

    # Vérification admin avant première mission
    est_verifie = models.BooleanField(default=False)
    date_demande_verification = models.DateTimeField(null=True, blank=True)
    motif_rejet = models.TextField(blank=True, default='')

    # Bank account for payouts
    compte_bancaire = models.CharField(max_length=50, blank=True, null=True)
    nom_titulaire_compte = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = 'transporter_profiles'

    def __str__(self):
        return f"Transporteur — {self.user.nom_complet}"


class OTPCode(TimeStampedModel):

    class Type(models.TextChoices):
        INSCRIPTION = 'INSCRIPTION', _('Inscription')
        PAIEMENT    = 'PAIEMENT',    _('Paiement')
        REINIT_MDP  = 'REINIT_MDP',  _('Réinitialisation')

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_codes', null=True, blank=True)
    phone       = models.CharField(max_length=20, blank=True)  # Pour OTP avant création user
    code        = models.CharField(max_length=6)
    type        = models.CharField(max_length=20, choices=Type.choices)
    est_utilise = models.BooleanField(default=False)
    expire_at   = models.DateTimeField()

    class Meta:
        db_table = 'otp_codes'
        ordering = ['-created_at']

    def __str__(self):
        user_info = f"{self.user.email}" if self.user else self.phone
        return f"OTP {self.type} — {user_info}"

    @property
    def est_valide(self):
        from django.utils import timezone
        return not self.est_utilise and self.expire_at > timezone.now()
