from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class Notification(TimeStampedModel):

    class Type(models.TextChoices):
        COMMANDE    = 'COMMANDE',    _('Commande')
        PAIEMENT    = 'PAIEMENT',    _('Paiement')
        LIVRAISON   = 'LIVRAISON',   _('Livraison')
        SYSTEME     = 'SYSTEME',     _('Système')
        PROMOTION   = 'PROMOTION',   _('Promotion')
        ALERTE_PRIX = 'ALERTE_PRIX', _('Alerte prix')

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    titre       = models.CharField(max_length=200)
    message     = models.TextField()
    type        = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEME)
    est_lue     = models.BooleanField(default=False)
    lien        = models.CharField(max_length=200, blank=True, default='')
    data        = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.titre} — {self.user.nom_complet}"