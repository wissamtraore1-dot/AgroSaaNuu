from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

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


class EchangerPointsView(APIView):
    """POST /api/v1/loyalty/utiliser/  — convertir des points en crédit wallet"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        points_a_echanger = request.data.get('points')
        if not points_a_echanger:
            return Response({'success': False, 'message': 'Nombre de points requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            points_a_echanger = int(points_a_echanger)
        except (ValueError, TypeError):
            return Response({'success': False, 'message': 'Valeur invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if points_a_echanger < settings.MIN_POINTS_ECHANGE:
            return Response({
                'success': False,
                'message': f'Minimum {settings.MIN_POINTS_ECHANGE} points requis pour échanger.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            pts = services.utiliser_points(request.user, points_a_echanger)
        except ValueError as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        fcfa_credite = points_a_echanger * settings.FCFA_PAR_POINT

        # Crédit dans le wallet
        from apps.wallet import services as wallet_services
        wallet_services.crediter_wallet(request.user, fcfa_credite, description=f'Échange {points_a_echanger} points fidélité')

        return Response({
            'success':         True,
            'points_echanges': points_a_echanger,
            'fcfa_credite':    fcfa_credite,
            'nouveau_solde':   PointsFideliteSerializer(pts).data,
        })


class CalculerPointsView(APIView):
    """GET /api/v1/loyalty/calculer/?amount=xxx  — calcule les points max utilisables"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            montant = float(request.query_params.get('amount', 0))
        except (ValueError, TypeError):
            return Response({'success': False, 'message': 'Montant invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        pts = services.obtenir_ou_creer_points(request.user)
        max_remise_fcfa   = montant * settings.MAX_POINTS_USAGE_PC / 100
        max_points_valeur = pts.points_actuels * settings.FCFA_PAR_POINT
        remise_fcfa       = min(max_remise_fcfa, max_points_valeur)
        max_points        = int(remise_fcfa / settings.FCFA_PAR_POINT)

        return Response({
            'success':          True,
            'points_dispo':     pts.points_actuels,
            'max_points':       max_points,
            'max_remise_fcfa':  remise_fcfa,
            'fcfa_par_point':   settings.FCFA_PAR_POINT,
        })