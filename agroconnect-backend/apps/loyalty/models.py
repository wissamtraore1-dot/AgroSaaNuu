from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class PointsFidelite(TimeStampedModel):

    class Niveau(models.TextChoices):
        BRONZE   = 'BRONZE',   _('Bronze')
        ARGENT   = 'ARGENT',   _('Argent')
        OR       = 'OR',       _('Or')
        PLATINE  = 'PLATINE',  _('Platine')

    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='points_fidelite')
    points_actuels = models.PositiveIntegerField(default=0)
    points_totaux  = models.PositiveIntegerField(default=0)
    points_utilises = models.PositiveIntegerField(default=0)
    niveau         = models.CharField(max_length=10, choices=Niveau.choices, default=Niveau.BRONZE)

    class Meta:
        db_table = 'points_fidelite'

    def __str__(self):
        return f"Points {self.user.nom_complet} — {self.points_actuels} pts"

    def mettre_a_jour_niveau(self):
        if self.points_totaux >= 5000:
            self.niveau = self.Niveau.PLATINE
        elif self.points_totaux >= 2000:
            self.niveau = self.Niveau.OR
        elif self.points_totaux >= 500:
            self.niveau = self.Niveau.ARGENT
        else:
            self.niveau = self.Niveau.BRONZE
        self.save(update_fields=['niveau'])


class HistoriquePoints(TimeStampedModel):

    class Type(models.TextChoices):
        GAIN      = 'GAIN',      _('Gain')
        UTILISATION = 'UTILISATION', _('Utilisation')
        EXPIRATION = 'EXPIRATION', _('Expiration')

    points_fidelite = models.ForeignKey(
        PointsFidelite, on_delete=models.CASCADE, related_name='historique'
    )
    type        = models.CharField(max_length=15, choices=Type.choices)
    points      = models.IntegerField()
    description = models.CharField(max_length=200)
    commande_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'historique_points'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} {self.points} pts — {self.points_fidelite.user.nom_complet}"