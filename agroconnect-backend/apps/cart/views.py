from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Panier, LignePanier
from .serializers import PanierSerializer
from apps.products.models import Produit


def _get_or_create_panier(user):
    panier, _ = Panier.objects.get_or_create(user=user)
    return panier


class MonPanierView(APIView):
    """GET /api/v1/cart/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        panier = _get_or_create_panier(request.user)
        return Response(PanierSerializer(panier, context={'request': request}).data)


class AjouterAuPanierView(APIView):
    """POST /api/v1/cart/ajouter/  { produit_id, quantite }"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        produit_id = request.data.get('produit_id')
        quantite   = int(request.data.get('quantite', 1))

        if not produit_id:
            return Response({'message': 'produit_id requis.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantite < 1:
            return Response({'message': 'La quantité doit être >= 1.'}, status=status.HTTP_400_BAD_REQUEST)

        produit = get_object_or_404(Produit, pk=produit_id, statut='ACTIF')
        panier  = _get_or_create_panier(request.user)

        ligne, created = LignePanier.objects.get_or_create(
            panier=panier, produit=produit,
            defaults={'quantite': quantite}
        )
        if not created:
            ligne.quantite += quantite
            ligne.save(update_fields=['quantite'])

        return Response(
            PanierSerializer(panier, context={'request': request}).data,
            status=status.HTTP_200_OK
        )


class ModifierLigneView(APIView):
    """PUT /api/v1/cart/modifier/<pk>/  { quantite }"""
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        panier   = _get_or_create_panier(request.user)
        ligne    = get_object_or_404(LignePanier, pk=pk, panier=panier)
        quantite = int(request.data.get('quantite', 1))

        if quantite < 1:
            ligne.delete()
        else:
            ligne.quantite = quantite
            ligne.save(update_fields=['quantite'])

        return Response(PanierSerializer(panier, context={'request': request}).data)


class SupprimerLigneView(APIView):
    """DELETE /api/v1/cart/supprimer/<pk>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        panier = _get_or_create_panier(request.user)
        ligne  = get_object_or_404(LignePanier, pk=pk, panier=panier)
        ligne.delete()
        return Response(PanierSerializer(panier, context={'request': request}).data)


class ViderPanierView(APIView):
    """POST /api/v1/cart/vider/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        panier = _get_or_create_panier(request.user)
        panier.lignes.all().delete()
        return Response(PanierSerializer(panier, context={'request': request}).data)
