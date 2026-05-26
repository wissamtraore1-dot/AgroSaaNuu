from rest_framework import serializers
from .models import PrixMarche, HistoriquePrix, AlertePrix


class PrixMarcheSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PrixMarche
        fields = [
            'id', 'produit', 'categorie', 'ville',
            'prix', 'prix_min', 'prix_max', 'unite',
            'variation', 'date_marche', 'source', 'created_at',
        ]


class HistoriquePrixSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HistoriquePrix
        fields = ['id', 'produit', 'ville', 'prix', 'date_marche']


class AlertePrixSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AlertePrix
        fields = ['id', 'produit', 'ville', 'prix_seuil', 'est_active', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)