from django.urls import path
from . import views

urlpatterns = [
    path('',              views.MonWalletView.as_view()),
    path('deposer/',      views.DeposerView.as_view()),
    path('retirer/',      views.RetirerView.as_view()),
    path('transactions/', views.MesTransactionsView.as_view()),
]