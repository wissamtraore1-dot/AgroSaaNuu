from django.db import models
from apps.common.models import TimeStampedModel
from apps.authentication.models import User
from apps.products.models import Produit


class Panier(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='panier')

    class Meta:
        db_table = 'paniers'

    def __str__(self):
        return f"Panier de {self.user.nom_complet}"

    @property
    def total(self):
        return sum(ligne.sous_total for ligne in self.lignes.all())

    @property
    def nombre_articles(self):
        return self.lignes.count()


class LignePanier(TimeStampedModel):
    panier   = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name='lignes')
    produit  = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='lignes_panier')
    quantite = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'lignes_panier'
        unique_together = ('panier', 'produit')

    def __str__(self):
        return f"{self.quantite}x {self.produit.nom}"

    @property
    def sous_total(self):
        return self.quantite * self.produit.prix
