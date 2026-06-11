from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class Vehicule(TimeStampedModel):

    class Type(models.TextChoices):
        PICKUP       = 'PICKUP',     _('Pick-up')
        CAMION_5T    = 'CAMION_5T',  _('Camion 5t')
        CAMION_8T    = 'CAMION_8T',  _('Camion 8t')
        CAMION_10T   = 'CAMION_10T', _('Camion 10t')
        CAMION_15T   = 'CAMION_15T', _('Camion 15t')

    class Statut(models.TextChoices):
        DISPONIBLE   = 'DISPONIBLE',   _('Disponible')
        EN_MISSION   = 'EN_MISSION',   _('En mission')
        EN_PANNE     = 'EN_PANNE',     _('En panne')
        INDISPONIBLE = 'INDISPONIBLE', _('Indisponible')

    transporteur    = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='vehicules',
        limit_choices_to={'role': 'TRANSPORTER'}
    )
    type            = models.CharField(max_length=15, choices=Type.choices)
    immatriculation = models.CharField(max_length=20, unique=True)
    annee           = models.PositiveSmallIntegerField()
    capacite_tonnes = models.DecimalField(max_digits=5, decimal_places=2)
    statut          = models.CharField(max_length=15, choices=Statut.choices, default=Statut.DISPONIBLE)
    assurance_expiry = models.DateField()
    visite_expiry    = models.DateField()
    photo            = models.ImageField(upload_to='vehicules/photos/', blank=True, null=True)
    carte_grise      = models.FileField(upload_to='vehicules/carte_grise/', blank=True, null=True)
    est_actif        = models.BooleanField(default=True)

    class Meta:
        db_table            = 'vehicules'
        verbose_name        = 'Véhicule'
        verbose_name_plural = 'Véhicules'

    def __str__(self):
        return f"{self.type} {self.immatriculation} — {self.transporteur.nom_complet}"


class MissionTransport(TimeStampedModel):

    class Statut(models.TextChoices):
        EN_ATTENTE   = 'EN_ATTENTE',   _('En attente')
        ACCEPTEE     = 'ACCEPTEE',     _('Acceptée')
        EN_COURS     = 'EN_COURS',     _('En cours')
        TERMINEE     = 'TERMINEE',     _('Terminée')
        ANNULEE      = 'ANNULEE',      _('Annulée')

    commande        = models.OneToOneField(
        'orders.Commande', on_delete=models.CASCADE, related_name='mission_transport'
    )
    transporteur    = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='missions',
        limit_choices_to={'role': 'TRANSPORTER'}
    )
    vehicule        = models.ForeignKey(
        Vehicule, on_delete=models.SET_NULL,
        null=True, related_name='missions'
    )
    statut          = models.CharField(max_length=15, choices=Statut.choices, default=Statut.EN_ATTENTE)
    ville_depart    = models.CharField(max_length=100)
    ville_arrivee   = models.CharField(max_length=100)
    tarif           = models.DecimalField(max_digits=10, decimal_places=2)
    date_depart     = models.DateTimeField(null=True, blank=True)
    date_arrivee    = models.DateTimeField(null=True, blank=True)
    note            = models.PositiveSmallIntegerField(null=True, blank=True)
    commentaire     = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'missions_transport'
        ordering = ['-created_at']

    def __str__(self):
        return f"Mission {self.commande.reference} — {self.transporteur.nom_complet}"