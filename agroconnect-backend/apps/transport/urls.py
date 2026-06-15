from django.urls import path
from . import views

urlpatterns = [
    # ─── Publics / consultation ───────────────────────────────────────────────
    path('transporteurs/',                         views.ListeTransporteursView.as_view()),
    path('transporteurs/<uuid:pk>/',               views.ProfilPublicTransporteurView.as_view()),
    path('disponibles/',                           views.TransporteursDisponiblesView.as_view()),
    path('estimation/',                            views.EstimationCoutView.as_view()),

    # ─── Véhicules ────────────────────────────────────────────────────────────
    path('mes-vehicules/',                         views.MesVehiculesView.as_view()),
    path('vehicules/ajouter/',                     views.AjouterVehiculeView.as_view()),
    path('vehicules/<uuid:pk>/modifier/',          views.ModifierVehiculeView.as_view()),
    path('vehicules/<uuid:pk>/supprimer/',         views.SupprimerVehiculeView.as_view()),

    # ─── Disponibilité ────────────────────────────────────────────────────────
    path('disponibilite/',                         views.MettreAJourDisponibiliteView.as_view()),

    # ─── Missions (transporteur) ──────────────────────────────────────────────
    path('mes-missions/',                          views.MesMissionsView.as_view()),
    path('missions/<uuid:pk>/',                    views.MissionDetailView.as_view()),
    path('missions/<uuid:pk>/accepter/',           views.AccepterMissionView.as_view()),
    path('missions/<uuid:pk>/refuser/',            views.RefuserMissionView.as_view()),
    path('missions/<uuid:pk>/demarrer/',           views.DemarrerMissionView.as_view()),
    path('missions/<uuid:pk>/terminer/',           views.TerminerMissionView.as_view()),
    path('missions/<uuid:pk>/noter/',              views.NoterTransporteurView.as_view()),

    # ─── Assignation (acheteur/vendeur) ──────────────────────────────────────
    path('assigner/',                              views.AssignerTransporteurView.as_view()),
    path('commande/<uuid:commande_id>/mission/',   views.MissionDeCommandeView.as_view()),

    # ─── Tarifs livraison ─────────────────────────────────────────────────────
    path('mes-tarifs/',                            views.MesTarifsView.as_view()),
    path('tarifs/ajouter/',                        views.AjouterTarifView.as_view()),
    path('tarifs/trajet/',                         views.TarifsParTrajetView.as_view()),
    path('tarifs/<uuid:pk>/',                      views.ModifierTarifView.as_view()),
]