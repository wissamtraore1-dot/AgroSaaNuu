from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedModel
from apps.authentication.models import User


class Categorie(TimeStampedModel):
    
    CEREALS_CHOICES = [
        ('RIZ', 'Riz'),
        ('MAIS', 'Maïs'),
        ('MIL', 'Mil'),
        ('SORGHO', 'Sorgho'),
        ('ARACHIDES', 'Arachides'),
        ('FONIO', 'Fonio'),
        ('BLE', 'Blé'),
        ('ORGE', 'Orge'),
        ('HARICOTS', 'Haricots'),
        ('LENTILLES', 'Lentilles'),
        ('POIS_CHICHES', 'Pois chiches'),
        ('NIEBE', 'Niébé'),
    ]
    
    nom         = models.CharField(max_length=100, unique=True, choices=CEREALS_CHOICES)
    description = models.TextField(blank=True, default='')
    icone       = models.CharField(max_length=50, blank=True, default='')
    est_active  = models.BooleanField(default=True)

    class Meta:
        db_table            = 'categories'
        verbose_name        = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering            = ['nom']

    def __str__(self):
        return self.get_nom_display()


class Produit(TimeStampedModel):

    class Unite(models.TextChoices):
        TONNE      = 'TONNE',      _('Tonne')
        KG         = 'KG',         _('Kilogramme')
        SAC_50KG   = 'SAC_50KG',   _('Sac 50kg')
        SAC_100KG  = 'SAC_100KG',  _('Sac 100kg')

    class Statut(models.TextChoices):
        ACTIF      = 'ACTIF',      _('Actif')
        INACTIF    = 'INACTIF',    _('Inactif')
        EPUISE     = 'EPUISE',     _('Épuisé')
        EN_ATTENTE = 'EN_ATTENTE', _('En attente de validation')

    class QualiteGrade(models.TextChoices):
        A = 'A', _('Grade A - Supérieur')
        B = 'B', _('Grade B - Bon')
        C = 'C', _('Grade C - Acceptable')

    vendeur      = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='produits',
        limit_choices_to={'role': 'SELLER'}
    )
    categorie    = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL,
        null=True, related_name='produits'
    )
    nom          = models.CharField(max_length=200)
    description  = models.TextField(blank=True, default='')
    prix         = models.DecimalField(max_digits=12, decimal_places=2)
    unite        = models.CharField(max_length=20, choices=Unite.choices, default=Unite.KG)
    quantite     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    localisation = models.CharField(max_length=200)
    ville        = models.CharField(max_length=100)
    statut       = models.CharField(max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE)
    est_disponible = models.BooleanField(default=True)
    vues         = models.PositiveIntegerField(default=0)
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_avis   = models.PositiveIntegerField(default=0)
    
    # Agricultural fields
    grade_qualite = models.CharField(max_length=1, choices=QualiteGrade.choices, default=QualiteGrade.B)
    date_recolte = models.DateField(null=True, blank=True)
    lieu_origine = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        db_table            = 'produits'
        verbose_name        = 'Produit'
        verbose_name_plural = 'Produits'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.nom} — {self.vendeur.nom_complet}"


class ImageProduit(TimeStampedModel):
    produit      = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='images')
    image        = models.ImageField(upload_to='produits/images/')
    est_principale = models.BooleanField(default=False)
    ordre        = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'images_produit'
        ordering = ['ordre']

    def __str__(self):
        return f"Image {self.produit.nom}"


class AvisProduit(TimeStampedModel):
    produit    = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis')
    acheteur   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='avis_donnes')
    note       = models.PositiveSmallIntegerField()
    commentaire = models.TextField(blank=True, default='')

    class Meta:
        db_table   = 'avis_produit'
        unique_together = [('produit', 'acheteur')]
        ordering   = ['-created_at']

    def __str__(self):
        return f"Avis {self.note}/5 — {self.produit.nom}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Mettre à jour la note moyenne du produit
        from django.db.models import Avg
        agg = AvisProduit.objects.filter(produit=self.produit).aggregate(Avg('note'))
        self.produit.note_moyenne = agg['note__avg'] or 0
        self.produit.total_avis   = AvisProduit.objects.filter(produit=self.produit).count()
        self.produit.save(update_fields=['note_moyenne', 'total_avis'])


class FavoriProduit(TimeStampedModel):
    acheteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favoris')
    produit  = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='favoris')

    class Meta:
        db_table        = 'favoris_produit'
        unique_together = [('acheteur', 'produit')]

    def __str__(self):
        return f"Favori {self.acheteur.nom_complet} — {self.produit.nom}"