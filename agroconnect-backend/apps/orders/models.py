from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.common.utils import generer_reference
from apps.authentication.models import User
from apps.products.models import Produit


class Commande(TimeStampedModel):

    class Statut(models.TextChoices):
        PAIEMENT_EN_ATTENTE = 'PAIEMENT_EN_ATTENTE', _('Paiement en attente')
        PAIEMENT_RECU       = 'PAIEMENT_RECU',       _('Paiement reçu (en escrow)')
        EN_PREPARATION      = 'EN_PREPARATION',      _('En préparation')
        EN_LIVRAISON        = 'EN_LIVRAISON',        _('En cours de livraison')
        LIVREE              = 'LIVREE',              _('Livrée')
        CONFIRMEE_RECEPTION = 'CONFIRMEE_RECEPTION', _('Réception confirmée')
        PAIEMENT_LIBERE     = 'PAIEMENT_LIBERE',     _('Paiement libéré au vendeur')
        ANNULEE             = 'ANNULEE',             _('Annulée')
        LITIGE              = 'LITIGE',              _('En litige')

    class ModePaiement(models.TextChoices):
        MTN    = 'MTN',    _('MTN Mobile Money')
        MOOV   = 'MOOV',   _('Moov Money')
        CELTIS = 'CELTIS', _('Celtis Cash')
        BANK   = 'BANK',   _('Virement bancaire')

    reference       = models.CharField(max_length=20, unique=True, blank=True)
    acheteur        = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='commandes_acheteur',
        limit_choices_to={'role': 'BUYER'}
    )
    vendeur         = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='commandes_vendeur',
        limit_choices_to={'role': 'SELLER'}
    )
    produit         = models.ForeignKey(
        Produit, on_delete=models.SET_NULL,
        null=True, related_name='commandes'
    )
    quantite        = models.DecimalField(max_digits=10, decimal_places=2)
    prix_unitaire   = models.DecimalField(max_digits=12, decimal_places=2)
    montant_produit = models.DecimalField(max_digits=12, decimal_places=2)
    frais_livraison = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frais_paiement  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    commission      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_total   = models.DecimalField(max_digits=12, decimal_places=2)
    montant_vendeur = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mode_paiement   = models.CharField(max_length=10, choices=ModePaiement.choices)
    statut          = models.CharField(max_length=30, choices=Statut.choices, default=Statut.PAIEMENT_EN_ATTENTE)
    adresse_livraison = models.TextField()
    telephone_livraison = models.CharField(max_length=20)
    note_acheteur   = models.TextField(blank=True, default='')
    note_livraison  = models.PositiveSmallIntegerField(null=True, blank=True)
    commentaire_livraison = models.TextField(blank=True, default='')
    date_confirmation = models.DateTimeField(null=True, blank=True)
    date_livraison  = models.DateTimeField(null=True, blank=True)
    date_reception  = models.DateTimeField(null=True, blank=True)
    
    # ESCROW: Track if payment is held or released
    paiement_en_escrow = models.BooleanField(default=True)
    paiement_libere_le = models.DateTimeField(null=True, blank=True)

    # ÉVALUATION VENDEUR par l'acheteur
    note_vendeur        = models.PositiveSmallIntegerField(null=True, blank=True)
    commentaire_vendeur = models.TextField(blank=True, default='')

    class Meta:
        db_table            = 'commandes'
        verbose_name        = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering            = ['-created_at']

    def __str__(self):
        return f"Commande {self.reference} — {self.acheteur.nom_complet}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generer_reference('CMD')
        super().save(*args, **kwargs)


class Message(TimeStampedModel):
    """Messagerie interne entre acheteur, vendeur et transporteur."""

    commande    = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='messages')
    expediteur  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_envoyes')
    contenu     = models.TextField()
    est_lu      = models.BooleanField(default=False)

    class Meta:
        db_table = 'messages_commande'
        ordering = ['created_at']

    def __str__(self):
        return f"Message de {self.expediteur.nom_complet} — {self.commande.reference}"


class LitigeCommande(TimeStampedModel):

    class Statut(models.TextChoices):
        OUVERT   = 'OUVERT',   _('Ouvert')
        EN_COURS = 'EN_COURS', _('En cours d\'examen')
        RESOLU   = 'RESOLU',   _('Résolu')
        FERME    = 'FERME',    _('Fermé')

    commande    = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='litige')
    plaignant   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='litiges')
    description = models.TextField()
    statut      = models.CharField(max_length=20, choices=Statut.choices, default=Statut.OUVERT)
    resolution  = models.TextField(blank=True, default='')
    date_resolution = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'litiges_commande'
        ordering = ['-created_at']

    def __str__(self):
        return f"Litige {self.commande.reference}"


class Paiement(TimeStampedModel):
    
    class Statut(models.TextChoices):
        EN_ATTENTE    = 'EN_ATTENTE',    _('En attente')
        EFFECTUE      = 'EFFECTUE',      _('Effectué')
        EN_ESCROW     = 'EN_ESCROW',     _('En escrow (bloqué)')
        PRET_VENDEUR  = 'PRET_VENDEUR',  _('Prêt pour retrait vendeur')
        TRANSFERE     = 'TRANSFERE',     _('Transféré au vendeur')
        ECHOUE        = 'ECHOUE',        _('Échoué')
        REMBOURSÉ     = 'REMBOURSÉ',     _('Remboursé')
    
    commande    = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='paiement')
    montant     = models.DecimalField(max_digits=12, decimal_places=2)
    mode_paiement = models.CharField(max_length=10, choices=Commande.ModePaiement.choices)
    statut      = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    
    # Payment provider reference
    reference_transaction = models.CharField(max_length=100, blank=True, null=True)
    
    # Escrow tracking
    date_recu   = models.DateTimeField(null=True, blank=True)  # When payment received
    date_en_escrow = models.DateTimeField(null=True, blank=True)  # When held in escrow
    date_transfere = models.DateTimeField(null=True, blank=True)  # When transferred to seller
    
    # Error tracking
    message_erreur = models.TextField(blank=True, default='')
    log_webhook = models.JSONField(default=dict, blank=True)  # Raw webhook data from provider
    
    class Meta:
        db_table = 'paiements'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Paiement {self.commande.reference} — {self.montant} XOF"


class RetaitVendeur(TimeStampedModel):
    
    class Statut(models.TextChoices):
        DEMANDÉ    = 'DEMANDE',    _('Demandé')
        APPROUVÉ   = 'APPROUVE',   _('Approuvé')
        TRAITEMENT = 'TRAITEMENT', _('En traitement')
        EFFECTUÉ   = 'EFFECTUE',   _('Effectué')
        REJETÉ     = 'REJETE',     _('Rejeté')
    
    vendeur     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retraits')
    montant     = models.DecimalField(max_digits=12, decimal_places=2)
    statut      = models.CharField(max_length=20, choices=Statut.choices, default=Statut.DEMANDÉ)
    
    # Bank details
    compte_bancaire = models.CharField(max_length=50)
    nom_titulaire = models.CharField(max_length=200)
    
    # Tracking
    date_demande = models.DateTimeField(auto_now_add=True)
    date_approuvé = models.DateTimeField(null=True, blank=True)
    date_effectué = models.DateTimeField(null=True, blank=True)
    
    # Reference & notes
    reference_virement = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, default='')
    
    class Meta:
        db_table = 'retraits_vendeur'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Retrait {self.vendeur.nom_complet} — {self.montant} XOF"