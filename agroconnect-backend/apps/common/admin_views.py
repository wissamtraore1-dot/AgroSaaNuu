from django.contrib import admin
from django.contrib.admin import AdminSite
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta


class AgroSaaNuuAdminSite(AdminSite):
    site_header = 'AgroSaaNuu Administration'
    site_title  = 'AgroSaaNuu Admin'
    index_title = 'Tableau de bord AgroSaaNuu'

    def index(self, request, extra_context=None):
        from apps.authentication.models import User
        from apps.orders.models import Commande
        from apps.products.models import Produit
        from apps.wallet.models import Transaction

        aujourd_hui = timezone.now().date()
        debut_mois  = aujourd_hui.replace(day=1)

        stats = {
            # Utilisateurs
            'total_users':        User.objects.count(),
            'acheteurs':          User.objects.filter(role='BUYER').count(),
            'vendeurs':           User.objects.filter(role='SELLER').count(),
            'transporteurs':      User.objects.filter(role='TRANSPORTER').count(),
            'users_ce_mois':      User.objects.filter(created_at__date__gte=debut_mois).count(),

            # Commandes
            'total_commandes':    Commande.objects.count(),
            'commandes_en_attente': Commande.objects.filter(statut='EN_ATTENTE').count(),
            'commandes_livrees':  Commande.objects.filter(statut='CONFIRMEE_RECEPTION').count(),
            'commandes_litiges':  Commande.objects.filter(statut='LITIGE').count(),
            'commandes_ce_mois':  Commande.objects.filter(created_at__date__gte=debut_mois).count(),

            # Revenus
            'revenus_total':      Commande.objects.filter(
                statut='CONFIRMEE_RECEPTION'
            ).aggregate(total=Sum('commission'))['total'] or 0,
            'revenus_ce_mois':    Commande.objects.filter(
                statut='CONFIRMEE_RECEPTION',
                created_at__date__gte=debut_mois
            ).aggregate(total=Sum('commission'))['total'] or 0,

            # Produits
            'total_produits':     Produit.objects.count(),
            'produits_actifs':    Produit.objects.filter(statut='ACTIF').count(),
            'produits_en_attente': Produit.objects.filter(statut='EN_ATTENTE').count(),
        }

        extra_context = extra_context or {}
        extra_context['stats'] = stats
        return super().index(request, extra_context)


agroconnect_admin = AgroSaaNuuAdminSite(name='agroconnect_admin')