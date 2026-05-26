from rest_framework import serializers

from .models import HistoriquePoints, PointsFidelite


class PointsFideliteSerializer(serializers.ModelSerializer):
    user_nom = serializers.CharField(source='user.nom_complet', read_only=True)

    class Meta:
        model = PointsFidelite
        fields = [
            'id',
            'user',
            'user_nom',
            'points_actuels',
            'points_totaux',
            'points_utilises',
            'niveau',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class HistoriquePointsSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = HistoriquePoints
        fields = [
            'id',
            'type',
            'type_label',
            'points',
            'description',
            'commande_id',
            'created_at',
        ]
        read_only_fields = fields
