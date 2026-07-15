from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class PrixMarche(TimeStampedModel):

    class Unite(models.TextChoices):
        TONNE    = 'TONNE',    _('Tonne')
        KG       = 'KG',       _('Kilogramme')
        SAC_50KG = 'SAC_50KG', _('Sac 50kg')

    produit      = models.CharField(max_length=100)
    categorie    = models.CharField(max_length=100)
    ville        = models.CharField(max_length=100)
    prix         = models.DecimalField(max_digits=12, decimal_places=2)
    prix_min     = models.DecimalField(max_digits=12, decimal_places=2)
    prix_max     = models.DecimalField(max_digits=12, decimal_places=2)
    unite        = models.CharField(max_length=15, choices=Unite.choices, default=Unite.TONNE)
    variation    = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    date_marche  = models.DateField()
    source       = models.CharField(max_length=200, blank=True, default='AgroSaaNuu')
    est_valide   = models.BooleanField(default=True)

    class Meta:
        db_table            = 'prix_marche'
        verbose_name        = 'Prix du marché'
        verbose_name_plural = 'Prix du marché'
        ordering            = ['-date_marche', 'produit']

    def __str__(self):
        return f"{self.produit} — {self.ville} — {self.prix} FCFA/{self.unite}"


class HistoriquePrix(TimeStampedModel):
    produit     = models.CharField(max_length=100)
    ville       = models.CharField(max_length=100)
    prix        = models.DecimalField(max_digits=12, decimal_places=2)
    date_marche = models.DateField()

    class Meta:
        db_table = 'historique_prix'
        ordering = ['date_marche']

    def __str__(self):
        return f"{self.produit} — {self.ville} — {self.date_marche}"


class AlertePrix(TimeStampedModel):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alertes_prix')
    produit     = models.CharField(max_length=100)
    ville       = models.CharField(max_length=100, blank=True, default='')
    prix_seuil  = models.DecimalField(max_digits=12, decimal_places=2)
    est_active  = models.BooleanField(default=True)
    email       = models.EmailField(blank=True, default='')

    class Meta:
        db_table = 'alertes_prix'
        ordering = ['-created_at']

    def __str__(self):
        return f"Alerte {self.produit} — {self.user.nom_complet}"