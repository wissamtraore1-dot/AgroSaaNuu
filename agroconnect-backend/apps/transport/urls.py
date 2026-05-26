from django.urls import path
from . import views

urlpatterns = [
    path('transporteurs/',                 views.ListeTransporteursView.as_view()),
    path('mes-vehicules/',                 views.MesVehiculesView.as_view()),
    path('vehicules/ajouter/',             views.AjouterVehiculeView.as_view()),
    path('vehicules/<uuid:pk>/supprimer/', views.SupprimerVehiculeView.as_view()),
    path('mes-missions/',                  views.MesMissionsView.as_view()),
    path('disponibilite/',                 views.MettreAJourDisponibiliteView.as_view()),
]