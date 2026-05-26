from django.contrib import admin
from .models import CategorieActualite, Actualite


@admin.register(CategorieActualite)
class CategorieActualiteAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'couleur']
    search_fields = ['nom']


@admin.register(Actualite)
class ActualiteAdmin(admin.ModelAdmin):
    list_display  = ['titre', 'auteur', 'categorie', 'statut', 'est_vedette', 'vues', 'created_at']
    list_filter   = ['statut', 'est_vedette', 'categorie']
    search_fields = ['titre', 'extrait']
    readonly_fields = ['vues', 'created_at']