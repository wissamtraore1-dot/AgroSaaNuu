from django.contrib import admin
from .models import Wallet, Transaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display  = ['user', 'solde', 'solde_bloque', 'total_recu', 'total_retire', 'est_actif']
    list_filter   = ['est_actif']
    search_fields = ['user__email', 'user__nom']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ['reference', 'wallet', 'type', 'statut', 'montant', 'mode', 'created_at']
    list_filter   = ['type', 'statut', 'mode']
    search_fields = ['reference', 'wallet__user__email']
    readonly_fields = ['reference', 'created_at']