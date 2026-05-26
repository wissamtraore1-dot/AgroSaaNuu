from django.contrib import admin
from .models import PointsFidelite, HistoriquePoints


@admin.register(PointsFidelite)
class PointsFideliteAdmin(admin.ModelAdmin):
    list_display  = ['user', 'points_actuels', 'points_totaux', 'niveau']
    list_filter   = ['niveau']
    search_fields = ['user__email', 'user__nom']


@admin.register(HistoriquePoints)
class HistoriquePointsAdmin(admin.ModelAdmin):
    list_display  = ['points_fidelite', 'type', 'points', 'description', 'created_at']
    list_filter   = ['type']