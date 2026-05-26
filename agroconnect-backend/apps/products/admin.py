from django.contrib import admin
from .models import Categorie, Produit, ImageProduit, AvisProduit, FavoriProduit


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'est_active', 'created_at']
    list_filter   = ['est_active']
    search_fields = ['nom']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'vendeur', 'prix', 'unite', 'ville', 'statut', 'est_disponible', 'vues']
    list_filter   = ['statut', 'est_disponible', 'ville', 'categorie']
    search_fields = ['nom', 'vendeur__email', 'vendeur__nom', 'ville']
    readonly_fields = ['vues', 'note_moyenne', 'total_avis', 'created_at']


@admin.register(AvisProduit)
class AvisProduitAdmin(admin.ModelAdmin):
    list_display  = ['produit', 'acheteur', 'note', 'created_at']
    list_filter   = ['note']