from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Vehicule, MissionTransport
from .serializers import VehiculeSerializer, MissionTransportSerializer
from apps.authentication.models import User
from apps.authentication.permissions import IsTransporter


class ListeTransporteursView(generics.ListAPIView):
    """GET /api/v1/transport/transporteurs/"""
    permission_classes = [AllowAny]

    def get(self, request):
        transporteurs = User.objects.filter(
            role='TRANSPORTER', is_active=True
        ).select_related('transporter_profile')
        from apps.authentication.serializers import UserSerializer
        return Response({
            'success':       True,
            'transporteurs': UserSerializer(transporteurs, many=True).data,
        })


class MesVehiculesView(generics.ListAPIView):
    """GET /api/v1/transport/mes-vehicules/"""
    serializer_class   = VehiculeSerializer
    permission_classes = [IsTransporter]

    def get_queryset(self):
        return Vehicule.objects.filter(transporteur=self.request.user)


class AjouterVehiculeView(APIView):
    """POST /api/v1/transport/vehicules/ajouter/"""
    permission_classes = [IsTransporter]

    def post(self, request):
        serializer = VehiculeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            vehicule = serializer.save()
            return Response({
                'success':  True,
                'message':  'Véhicule ajouté.',
                'vehicule': VehiculeSerializer(vehicule).data,
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class SupprimerVehiculeView(APIView):
    """DELETE /api/v1/transport/vehicules/<id>/supprimer/"""
    permission_classes = [IsTransporter]

    def delete(self, request, pk):
        vehicule = get_object_or_404(Vehicule, pk=pk, transporteur=request.user)
        vehicule.delete()
        return Response({'success': True, 'message': 'Véhicule supprimé.'})


class MesMissionsView(generics.ListAPIView):
    """GET /api/v1/transport/mes-missions/"""
    serializer_class   = MissionTransportSerializer
    permission_classes = [IsTransporter]

    def get_queryset(self):
        return MissionTransport.objects.filter(
            transporteur=self.request.user
        ).select_related('commande', 'vehicule')


class MettreAJourDisponibiliteView(APIView):
    """POST /api/v1/transport/disponibilite/"""
    permission_classes = [IsTransporter]

    def post(self, request):
        est_disponible = request.data.get('est_disponible', True)
        profil = request.user.transporter_profile
        profil.est_disponible = est_disponible
        profil.save(update_fields=['est_disponible'])
        return Response({
            'success':        True,
            'est_disponible': est_disponible,
            'message':        'Disponibilité mise à jour.',
        })