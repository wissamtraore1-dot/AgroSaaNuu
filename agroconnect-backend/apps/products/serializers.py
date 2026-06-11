from rest_framework import serializers
from .models import Categorie, Produit, ImageProduit, AvisProduit, FavoriProduit
from apps.authentication.serializers import UserSerializer


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categorie
        fields = ['id', 'nom', 'description', 'icone', 'est_active']


class ImageProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ImageProduit
        fields = ['id', 'image', 'est_principale', 'ordre']

    def to_representation(self, instance):
        data    = super().to_representation(instance)
        request = self.context.get('request')
        if request and data.get('image'):
            data['image'] = request.build_absolute_uri(data['image'])
        return data


class AvisProduitSerializer(serializers.ModelSerializer):
    acheteur_nom = serializers.CharField(source='acheteur.nom_complet', read_only=True)

    class Meta:
        model  = AvisProduit
        fields = ['id', 'acheteur_nom', 'note', 'commentaire', 'created_at']
        read_only_fields = ['id', 'acheteur_nom', 'created_at']


class ProduitSerializer(serializers.ModelSerializer):
    images        = ImageProduitSerializer(many=True, read_only=True)
    avis          = AvisProduitSerializer(many=True, read_only=True)
    vendeur_nom   = serializers.CharField(source='vendeur.nom_complet', read_only=True)
    vendeur_ville = serializers.CharField(source='vendeur.ville', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model  = Produit
        fields = [
            'id', 'nom', 'description', 'prix', 'unite',
            'quantite', 'ville', 'statut',
            'est_disponible', 'vues', 'note_moyenne', 'total_avis',
            'vendeur', 'vendeur_nom', 'vendeur_ville',
            'categorie', 'categorie_nom',
            'images', 'avis', 'created_at',
        ]
        read_only_fields = ['id', 'vues', 'note_moyenne', 'total_avis', 'created_at']


class ProduitCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Produit
        fields = [
            'nom', 'description', 'prix', 'unite',
            'quantite', 'localisation', 'ville', 'categorie',
        ]

    def create(self, validated_data):
        validated_data['vendeur'] = self.context['request'].user
        validated_data['statut']  = Produit.Statut.ACTIF
        return super().create(validated_data)


class AjouterAvisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AvisProduit
        fields = ['note', 'commentaire']

    def validate_note(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('La note doit être entre 1 et 5.')
        return value

    def create(self, validated_data):
        validated_data['acheteur'] = self.context['request'].user
        validated_data['produit']  = self.context['produit']
        return super().create(validated_data)