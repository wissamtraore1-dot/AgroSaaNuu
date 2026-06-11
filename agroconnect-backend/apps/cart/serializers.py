from rest_framework import serializers
from .models import Panier, LignePanier


class LignePanierSerializer(serializers.ModelSerializer):
    produit_id    = serializers.UUIDField(source='produit.id', read_only=True)
    produit_nom   = serializers.CharField(source='produit.nom', read_only=True)
    produit_image = serializers.SerializerMethodField()
    prix_unitaire = serializers.DecimalField(source='produit.prix', max_digits=12, decimal_places=2, read_only=True)
    vendeur_nom   = serializers.CharField(source='produit.vendeur.nom_complet', read_only=True)
    sous_total    = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model  = LignePanier
        fields = ['id', 'produit_id', 'produit_nom', 'produit_image',
                  'prix_unitaire', 'vendeur_nom', 'quantite', 'sous_total']

    def get_produit_image(self, obj):
        request = self.context.get('request')
        img = obj.produit.images.filter(est_principale=True).first() or obj.produit.images.first()
        if img and request:
            return request.build_absolute_uri(img.image.url)
        return None


class PanierSerializer(serializers.ModelSerializer):
    lignes           = LignePanierSerializer(many=True, read_only=True)
    total            = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    nombre_articles  = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Panier
        fields = ['id', 'lignes', 'total', 'nombre_articles']
