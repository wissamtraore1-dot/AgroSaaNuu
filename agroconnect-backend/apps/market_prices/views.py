from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Avg

from .models import PrixMarche, HistoriquePrix, AlertePrix
from .serializers import PrixMarcheSerializer, HistoriquePrixSerializer, AlertePrixSerializer


class ListePrixMarcheView(generics.ListAPIView):
    """GET /api/v1/market-prices/"""
    serializer_class   = PrixMarcheSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['ville', 'categorie', 'produit']
    search_fields      = ['produit', 'ville', 'categorie']
    ordering_fields    = ['prix', 'variation', 'date_marche']
    ordering           = ['-date_marche']

    def get_queryset(self):
        return PrixMarche.objects.filter(est_valide=True)


class HistoriquePrixView(APIView):
    """GET /api/v1/market-prices/historique/?produit=Maïs&ville=Cotonou"""
    permission_classes = [AllowAny]

    def get(self, request):
        produit = request.query_params.get('produit', '')
        ville   = request.query_params.get('ville', '')
        qs      = HistoriquePrix.objects.all()
        if produit:
            qs = qs.filter(produit__icontains=produit)
        if ville:
            qs = qs.filter(ville__icontains=ville)
        qs = qs[:90]  # 90 derniers jours
        return Response({
            'success':    True,
            'historique': HistoriquePrixSerializer(qs, many=True).data,
        })


class StatistiquesPrixView(APIView):
    """GET /api/v1/market-prices/statistiques/"""
    permission_classes = [AllowAny]

    def get(self, request):
        stats = PrixMarche.objects.filter(est_valide=True).values(
            'produit', 'categorie'
        ).annotate(
            prix_moyen=Avg('prix'),
            prix_min=Avg('prix_min'),
            prix_max=Avg('prix_max'),
        )
        return Response({'success': True, 'statistiques': list(stats)})


class MesAlertesPrixView(generics.ListAPIView):
    """GET /api/v1/market-prices/alertes/"""
    serializer_class   = AlertePrixSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AlertePrix.objects.filter(user=self.request.user)


class CreerAlertePrixView(APIView):
    """POST /api/v1/market-prices/alertes/creer/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AlertePrixSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Alerte créée.',
                'alerte':  serializer.data,
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class SupprimerAlertePrixView(APIView):
    """DELETE /api/v1/market-prices/alertes/<id>/supprimer/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        alerte = get_object_or_404(AlertePrix, pk=pk, user=request.user)
        alerte.delete()
        return Response({'success': True, 'message': 'Alerte supprimée.'})