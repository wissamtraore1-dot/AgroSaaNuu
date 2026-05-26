from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PointsFidelite, HistoriquePoints
from .serializers import PointsFideliteSerializer, HistoriquePointsSerializer
from . import services


class MesPointsView(APIView):
    """GET /api/v1/loyalty/mes-points/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pts = services.obtenir_ou_creer_points(request.user)
        return Response({
            'success': True,
            'points':  PointsFideliteSerializer(pts).data,
        })


class HistoriquePointsView(generics.ListAPIView):
    """GET /api/v1/loyalty/historique/"""
    serializer_class   = HistoriquePointsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        pts = services.obtenir_ou_creer_points(self.request.user)
        return HistoriquePoints.objects.filter(points_fidelite=pts)