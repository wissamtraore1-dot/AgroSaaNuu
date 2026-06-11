from django.urls import path
from . import views

urlpatterns = [
    # Wallet utilisateur
    path('',                            views.MonWalletView.as_view()),
    path('deposer/',                    views.DeposerView.as_view()),
    path('retirer/',                    views.RetirerView.as_view()),
    path('transactions/',               views.MesTransactionsView.as_view()),

    # Wallet entreprise (admin)
    path('plateforme/',                 views.PlatformWalletView.as_view()),
    path('plateforme/retirer/',         views.PlatformRetraitView.as_view()),
    path('plateforme/transactions/',    views.PlatformTransactionsView.as_view()),
]