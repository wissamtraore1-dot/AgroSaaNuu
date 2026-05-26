from django.urls import path
from . import views

urlpatterns = [
    path('',                          views.ListePrixMarcheView.as_view()),
    path('historique/',               views.HistoriquePrixView.as_view()),
    path('statistiques/',             views.StatistiquesPrixView.as_view()),
    path('alertes/',                  views.MesAlertesPrixView.as_view()),
    path('alertes/creer/',            views.CreerAlertePrixView.as_view()),
    path('alertes/<uuid:pk>/supprimer/', views.SupprimerAlertePrixView.as_view()),
]