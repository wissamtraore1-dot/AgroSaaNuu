from rest_framework import serializers
from .models import Vehicule, MissionTransport


class VehiculeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Vehicule
        fields = [
            'id', 'type', 'immatriculation', 'annee',
            'capacite_tonnes', 'statut', 'assurance_expiry',
            'visite_expiry', 'photo', 'est_actif', 'created_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at']

    def create(self, validated_data):
        validated_data['transporteur'] = self.context['request'].user
        return super().create(validated_data)


class MissionTransportSerializer(serializers.ModelSerializer):
    transporteur_nom = serializers.CharField(source='transporteur.nom_complet', read_only=True)
    commande_ref     = serializers.CharField(source='commande.reference', read_only=True)

    class Meta:
        model  = MissionTransport
        fields = [
            'id', 'commande', 'commande_ref',
            'transporteur', 'transporteur_nom',
            'vehicule', 'statut',
            'ville_depart', 'ville_arrivee', 'tarif',
            'date_depart', 'date_arrivee',
            'note', 'commentaire', 'created_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at']