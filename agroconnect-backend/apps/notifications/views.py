from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


class MesNotificationsView(generics.ListAPIView):
    """GET /api/v1/notifications/"""
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarquerLueView(APIView):
    """POST /api/v1/notifications/<id>/lue/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.est_lue = True
        notif.save(update_fields=['est_lue'])
        return Response({'success': True, 'message': 'Notification lue.'})


class MarquerToutesLuesView(APIView):
    """POST /api/v1/notifications/tout-lire/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, est_lue=False).update(est_lue=True)
        return Response({'success': True, 'message': 'Toutes les notifications lues.'})


class NombreNonLuesView(APIView):
    """GET /api/v1/notifications/non-lues/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, est_lue=False).count()
        return Response({'success': True, 'non_lues': count})