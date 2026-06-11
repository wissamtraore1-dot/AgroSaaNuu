from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.common.utils import generer_reference
from apps.authentication.models import User


class PlatformWallet(TimeStampedModel):
    """Wallet singleton de l'entreprise AgroSaaNuu — capte toutes les commissions."""

    nom               = models.CharField(max_length=50, unique=True, default='AGROSAANUU')
    solde             = models.DecimalField(max_digits=16, decimal_places=2, default=0.00)
    total_commissions = models.DecimalField(max_digits=16, decimal_places=2, default=0.00)
    total_retire      = models.DecimalField(max_digits=16, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'platform_wallet'

    def __str__(self):
        return f"Wallet AgroSaaNuu — {self.solde} FCFA"

    @classmethod
    def get(cls):
        wallet, _ = cls.objects.get_or_create(nom='AGROSAANUU')
        return wallet


class PlatformTransaction(TimeStampedModel):
    """Historique de toutes les entrées/sorties du wallet entreprise."""

    class Type(models.TextChoices):
        COMMISSION = 'COMMISSION', _('Commission perçue')
        RETRAIT    = 'RETRAIT',    _('Retrait entreprise')
        AJUSTEMENT = 'AJUSTEMENT', _('Ajustement manuel')

    wallet      = models.ForeignKey(PlatformWallet, on_delete=models.CASCADE, related_name='transactions')
    reference   = models.CharField(max_length=25, unique=True, blank=True)
    type        = models.CharField(max_length=15, choices=Type.choices)
    montant     = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default='')
    commande_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'platform_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} — {self.type} {self.montant} FCFA"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generer_reference('PLT')
        super().save(*args, **kwargs)


class Wallet(TimeStampedModel):
    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    solde           = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    solde_bloque    = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_recu      = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_retire    = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    est_actif       = models.BooleanField(default=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet {self.user.nom_complet} — {self.solde} FCFA"

    @property
    def solde_disponible(self):
        return self.solde - self.solde_bloque


class Transaction(TimeStampedModel):

    class Type(models.TextChoices):
        DEPOT       = 'DEPOT',       _('Dépôt')
        RETRAIT     = 'RETRAIT',     _('Retrait')
        PAIEMENT    = 'PAIEMENT',    _('Paiement commande')
        RECEPTION   = 'RECEPTION',   _('Réception paiement')
        COMMISSION  = 'COMMISSION',  _('Commission AgroConnect')
        REMBOURSEMENT = 'REMBOURSEMENT', _('Remboursement')
        BLOCAGE     = 'BLOCAGE',     _('Blocage séquestre')
        LIBERATION  = 'LIBERATION',  _('Libération séquestre')

    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', _('En attente')
        SUCCES     = 'SUCCES',     _('Succès')
        ECHEC      = 'ECHEC',      _('Échec')
        ANNULEE    = 'ANNULEE',    _('Annulée')

    class Mode(models.TextChoices):
        MTN    = 'MTN',    _('MTN Mobile Money')
        MOOV   = 'MOOV',   _('Moov Money')
        CELTIS = 'CELTIS', _('Celtis Cash')
        BANK   = 'BANK',   _('Virement bancaire')
        INTERNE = 'INTERNE', _('Transfert interne')

    wallet      = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    reference   = models.CharField(max_length=25, unique=True, blank=True)
    type        = models.CharField(max_length=20, choices=Type.choices)
    statut      = models.CharField(max_length=15, choices=Statut.choices, default=Statut.EN_ATTENTE)
    mode        = models.CharField(max_length=10, choices=Mode.choices, default=Mode.INTERNE)
    montant     = models.DecimalField(max_digits=12, decimal_places=2)
    frais       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_net = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default='')
    commande_id = models.UUIDField(null=True, blank=True)
    numero_mobile = models.CharField(max_length=20, blank=True, default='')

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} — {self.type} {self.montant} FCFA"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generer_reference('TXN')
        super().save(*args, **kwargs)