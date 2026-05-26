from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SellerProfile, TransporterProfile, OTPCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ['email', 'nom_complet', 'role', 'status', 'is_verified', 'created_at']
    list_filter     = ['role', 'status', 'is_verified']
    search_fields   = ['email', 'prenom', 'nom', 'telephone', 'cip']
    ordering        = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_login_at']

    fieldsets = (
        ('Connexion',            {'fields': ('email', 'password')}),
        ('Informations',         {'fields': ('prenom', 'nom', 'telephone', 'cip', 'photo', 'bio', 'ville', 'adresse')}),
        ('Rôle et statut',       {'fields': ('role', 'status', 'is_verified', 'cip_verifie')}),
        ('Permissions',          {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates',                {'fields': ('created_at', 'updated_at', 'last_login_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'telephone', 'prenom', 'nom', 'cip', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'association', 'note_moyenne', 'total_ventes', 'est_certifie']
    list_filter   = ['est_certifie']
    search_fields = ['user__email', 'user__nom', 'association']


@admin.register(TransporterProfile)
class TransporterProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'note_moyenne', 'total_missions', 'est_disponible', 'est_certifie']
    list_filter   = ['est_disponible', 'est_certifie']
    search_fields = ['user__email', 'user__nom']


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display    = ['user', 'code', 'type', 'est_utilise', 'expire_at', 'created_at']
    list_filter     = ['type', 'est_utilise']
    readonly_fields = ['created_at']