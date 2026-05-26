from django.contrib import admin
from .models import PrixMarche, HistoriquePrix, AlertePrix


@admin.register(PrixMarche)
class PrixMarcheAdmin(admin.ModelAdmin):
    list_display  = ['produit', 'categorie', 'ville', 'prix', 'variation', 'date_marche', 'est_valide']
    list_filter   = ['categorie', 'ville', 'est_valide']
    search_fields = ['produit', 'ville']
    readonly_fields = ['created_at']


@admin.register(HistoriquePrix)
class HistoriquePrixAdmin(admin.ModelAdmin):
    list_display  = ['produit', 'ville', 'prix', 'date_marche']
    list_filter   = ['ville', 'produit']


@admin.register(AlertePrix)
class AlertePrixAdmin(admin.ModelAdmin):
    list_display  = ['user', 'produit', 'ville', 'prix_seuil', 'est_active']
    list_filter   = ['est_active']
    search_fields = ['user__email', 'produit']