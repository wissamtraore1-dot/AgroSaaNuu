from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class CategorieActualite(TimeStampedModel):
    nom       = models.CharField(max_length=100, unique=True)
    couleur   = models.CharField(max_length=20, default='#1a5c2a')

    class Meta:
        db_table = 'categories_actualite'

    def __str__(self):
        return self.nom


class Actualite(TimeStampedModel):

    class Statut(models.TextChoices):
        BROUILLON  = 'BROUILLON',  _('Brouillon')
        PUBLIE     = 'PUBLIE',     _('Publié')
        ARCHIVE    = 'ARCHIVE',    _('Archivé')

    auteur      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='actualites')
    categorie   = models.ForeignKey(CategorieActualite, on_delete=models.SET_NULL, null=True, related_name='actualites')
    titre       = models.CharField(max_length=300)
    extrait     = models.TextField(max_length=500)
    contenu     = models.TextField()
    image       = models.ImageField(upload_to='actualites/', blank=True, null=True)
    statut      = models.CharField(max_length=15, choices=Statut.choices, default=Statut.BROUILLON)
    est_vedette = models.BooleanField(default=False)
    vues        = models.PositiveIntegerField(default=0)
    tags        = models.JSONField(default=list)

    class Meta:
        db_table            = 'actualites'
        verbose_name        = 'Actualité'
        verbose_name_plural = 'Actualités'
        ordering            = ['-created_at']

    def __str__(self):
        return self.titre