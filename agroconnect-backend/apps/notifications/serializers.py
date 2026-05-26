from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'titre', 'message', 'type', 'est_lue', 'lien', 'data', 'created_at']