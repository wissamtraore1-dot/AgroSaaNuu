from django.urls import path
from . import views

urlpatterns = [
    path('mes-points/',  views.MesPointsView.as_view()),
    path('historique/',  views.HistoriquePointsView.as_view()),
    path('utiliser/',    views.EchangerPointsView.as_view()),
    path('calculer/',    views.CalculerPointsView.as_view()),
]