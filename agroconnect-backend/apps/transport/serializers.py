from rest_framework import serializers
from .models import Vehicule, MissionTransport, TarifLivraison


class VehiculeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Vehicule
        fields = [
            'id', 'type', 'immatriculation', 'annee',
            'capacite_tonnes', 'statut', 'assurance_expiry',
            'visite_expiry', 'photo', 'carte_grise', 'est_actif', 'created_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at']

    def create(self, validated_data):
        validated_data['transporteur'] = self.context['request'].user
        return super().create(validated_data)


class MissionTransportSerializer(serializers.ModelSerializer):
    transporteur_nom    = serializers.CharField(source='transporteur.nom_complet', read_only=True)
    transporteur_photo  = serializers.SerializerMethodField()
    commande_ref        = serializers.CharField(source='commande.reference',            read_only=True)
    commande_statut     = serializers.CharField(source='commande.statut',               read_only=True)
    commande_montant    = serializers.DecimalField(source='commande.montant_total',      max_digits=12, decimal_places=2, read_only=True)
    adresse_livraison   = serializers.CharField(source='commande.adresse_livraison',    read_only=True)
    telephone_livraison = serializers.CharField(source='commande.telephone_livraison',  read_only=True)
    acheteur_nom        = serializers.CharField(source='commande.acheteur.nom_complet', read_only=True)
    vendeur_nom         = serializers.CharField(source='commande.vendeur.nom_complet',  read_only=True)
    produit_nom         = serializers.SerializerMethodField()
    tarif_str           = serializers.SerializerMethodField()
    confirme_transporteur = serializers.BooleanField(source='commande.confirme_transporteur', read_only=True)

    class Meta:
        model  = MissionTransport
        fields = [
            'id', 'commande', 'commande_ref', 'commande_statut', 'commande_montant',
            'adresse_livraison', 'telephone_livraison',
            'transporteur', 'transporteur_nom', 'transporteur_photo',
            'acheteur_nom', 'vendeur_nom', 'produit_nom',
            'vehicule', 'statut',
            'ville_depart', 'ville_arrivee', 'tarif', 'tarif_str',
            'delai_livraison_jours', 'delai_livraison_unite',
            'date_depart', 'date_arrivee',
            'note', 'commentaire', 'created_at',
            'confirme_transporteur',
        ]
        read_only_fields = ['id', 'statut', 'created_at']

    def get_transporteur_photo(self, obj):
        request = self.context.get('request')
        if obj.transporteur.photo:
            url = obj.transporteur.photo.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_produit_nom(self, obj):
        return obj.commande.produit.nom if obj.commande.produit else ''

    def get_tarif_str(self, obj):
        return f"{obj.tarif:,.0f} FCFA"


class TransporteurDisponibleSerializer(serializers.Serializer):
    """Utilisé uniquement pour la doc OpenAPI."""
    id            = serializers.UUIDField()
    nom           = serializers.CharField()
    note_moyenne  = serializers.FloatField()
    tarif_estime  = serializers.IntegerField()


class TarifLivraisonSerializer(serializers.ModelSerializer):
    transporteur_nom   = serializers.CharField(source='transporteur.nom_complet', read_only=True)
    transporteur_photo = serializers.SerializerMethodField()
    note_transporteur  = serializers.FloatField(source='transporteur.transporter_profile.note_moyenne', read_only=True)
    total_missions     = serializers.IntegerField(source='transporteur.transporter_profile.total_missions', read_only=True)

    class Meta:
        model  = TarifLivraison
        fields = [
            'id', 'transporteur', 'transporteur_nom', 'transporteur_photo',
            'note_transporteur', 'total_missions',
            'ville_depart', 'ville_arrivee', 'tarif', 'est_actif', 'created_at',
        ]
        read_only_fields = ['id', 'transporteur', 'created_at']

    def get_transporteur_photo(self, obj):
        request = self.context.get('request')
        if obj.transporteur.photo:
            url = obj.transporteur.photo.url
            return request.build_absolute_uri(url) if request else url
        return None

    def create(self, validated_data):
        validated_data['transporteur'] = self.context['request'].user
        return super().create(validated_data)