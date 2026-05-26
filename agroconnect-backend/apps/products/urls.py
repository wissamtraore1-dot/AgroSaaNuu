from django.urls import path
from . import views

urlpatterns = [
    path('',                          views.ListeProduitsView.as_view()),
    path('categories/',               views.ListeCategoriesView.as_view()),
    path('mes-produits/',             views.MesProduitsView.as_view()),
    path('creer/',                    views.CreerProduitView.as_view()),
    path('favoris/',                  views.MesFavorisView.as_view()),
    path('<uuid:pk>/',                views.DetailProduitView.as_view()),
    path('<uuid:pk>/modifier/',       views.ModifierProduitView.as_view()),
    path('<uuid:pk>/supprimer/',      views.SupprimerProduitView.as_view()),
    path('<uuid:pk>/avis/',           views.AjouterAvisView.as_view()),
    path('<uuid:pk>/favori/',         views.ToggleFavoriView.as_view()),
]