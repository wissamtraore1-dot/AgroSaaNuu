from django.urls import path
from . import views

urlpatterns = [
    path('',                      views.MonPanierView.as_view()),
    path('ajouter/',              views.AjouterAuPanierView.as_view()),
    path('modifier/<uuid:pk>/',   views.ModifierLigneView.as_view()),
    path('supprimer/<uuid:pk>/',  views.SupprimerLigneView.as_view()),
    path('vider/',                views.ViderPanierView.as_view()),
]
