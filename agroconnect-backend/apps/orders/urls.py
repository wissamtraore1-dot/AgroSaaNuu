from django.urls import path
from . import views

urlpatterns = [
    path('passer/',                          views.PasserCommandeView.as_view()),
    path('mes-commandes/',                   views.MesCommandesAcheteurView.as_view()),
    path('commandes-recues/',               views.MesCommandesVendeurView.as_view()),
    path('<uuid:pk>/',                       views.DetailCommandeView.as_view()),
    path('<uuid:pk>/confirmer/',             views.ConfirmerCommandeView.as_view()),
    path('<uuid:pk>/en-livraison/',          views.MarquerEnLivraisonView.as_view()),
    path('<uuid:pk>/confirmer-reception/',   views.ConfirmerReceptionView.as_view()),
    path('<uuid:pk>/annuler/',               views.AnnulerCommandeView.as_view()),
    path('<uuid:pk>/litige/',                views.SignalerLitigeView.as_view()),
    
    # ===== ESCROW & PAYMENT ENDPOINTS =====
    path('payment/initiate/',                views.InitiatePaiementView.as_view()),
    path('payment/confirm/',                 views.ConfirmPaiementView.as_view()),
    path('payment/release/',                 views.ReleasePaiementView.as_view()),
    
    # ===== SELLER WITHDRAWAL ENDPOINTS =====
    path('withdrawal/request/',              views.DemandedRetaitVendeurView.as_view()),
    path('withdrawal/list/',                 views.MesRetaitsVendeurView.as_view()),
    path('withdrawal/admin-approve/',        views.AdminApproveWithdrawalView.as_view()),
]