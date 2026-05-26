from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['user', 'titre', 'type', 'est_lue', 'created_at']
    list_filter   = ['type', 'est_lue']
    search_fields = ['user__email', 'titre']