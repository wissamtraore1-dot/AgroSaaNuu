from rest_framework import serializers
from .models import CategorieActualite, Actualite


class CategorieActualiteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CategorieActualite
        fields = ['id', 'nom', 'couleur']


class ActualiteSerializer(serializers.ModelSerializer):
    auteur_nom    = serializers.CharField(source='auteur.nom_complet', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom',      read_only=True)

    class Meta:
        model  = Actualite
        fields = [
            'id', 'titre', 'extrait', 'contenu', 'image',
            'statut', 'est_vedette', 'vues', 'tags',
            'auteur', 'auteur_nom',
            'categorie', 'categorie_nom',
            'created_at',
        ]
        read_only_fields = ['id', 'vues', 'created_at']


class ActualiteListSerializer(serializers.ModelSerializer):
    auteur_nom    = serializers.CharField(source='auteur.nom_complet', read_only=True)
    categorie_nom = serializers.CharField(source='categorie.nom',      read_only=True)

    class Meta:
        model  = Actualite
        fields = [
            'id', 'titre', 'extrait', 'image',
            'est_vedette', 'vues', 'tags',
            'auteur_nom', 'categorie_nom', 'created_at',
        ]