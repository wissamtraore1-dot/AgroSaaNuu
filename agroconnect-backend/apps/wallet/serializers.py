from rest_framework import serializers
from .models import Wallet, Transaction


class WalletSerializer(serializers.ModelSerializer):
    solde_disponible = serializers.ReadOnlyField()

    class Meta:
        model  = Wallet
        fields = [
            'id', 'solde', 'solde_bloque', 'solde_disponible',
            'total_recu', 'total_retire', 'est_actif', 'updated_at',
        ]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Transaction
        fields = [
            'id', 'reference', 'type', 'statut', 'mode',
            'montant', 'frais', 'montant_net',
            'description', 'commande_id', 'created_at',
        ]


class DeposerSerializer(serializers.Serializer):
    montant        = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1000)
    mode           = serializers.ChoiceField(choices=Transaction.Mode.choices)
    numero_mobile  = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_mode(self, value):
        if value == 'INTERNE':
            raise serializers.ValidationError('Mode non autorisé pour un dépôt.')
        return value


class RetirerSerializer(serializers.Serializer):
    montant        = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1000)
    mode           = serializers.ChoiceField(choices=Transaction.Mode.choices)
    numero_mobile  = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_mode(self, value):
        if value == 'INTERNE':
            raise serializers.ValidationError('Mode non autorisé pour un retrait.')
        return value