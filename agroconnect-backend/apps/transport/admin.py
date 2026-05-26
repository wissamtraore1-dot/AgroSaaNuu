from django.contrib import admin
from .models import Vehicule, MissionTransport


@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    list_display  = ['immatriculation', 'transporteur', 'type', 'statut', 'capacite_tonnes', 'est_actif']
    list_filter   = ['type', 'statut', 'est_actif']
    search_fields = ['immatriculation', 'transporteur__email']


@admin.register(MissionTransport)
class MissionTransportAdmin(admin.ModelAdmin):
    list_display  = ['commande', 'transporteur', 'statut', 'ville_depart', 'ville_arrivee', 'tarif']
    list_filter   = ['statut']