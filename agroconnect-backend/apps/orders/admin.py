from django.contrib import admin
from .models import Commande, LitigeCommande


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display  = ['reference', 'acheteur', 'vendeur', 'produit', 'montant_total', 'statut', 'created_at']
    list_filter   = ['statut', 'mode_paiement']
    search_fields = ['reference', 'acheteur__email', 'vendeur__email']
    readonly_fields = ['reference', 'created_at', 'updated_at']


@admin.register(LitigeCommande)
class LitigeCommandeAdmin(admin.ModelAdmin):
    list_display  = ['commande', 'plaignant', 'statut', 'created_at']
    list_filter   = ['statut']