from django.urls import path
from . import views

urlpatterns = [
    path('',             views.MesNotificationsView.as_view()),
    path('non-lues/',    views.NombreNonLuesView.as_view()),
    path('tout-lire/',   views.MarquerToutesLuesView.as_view()),
    path('<uuid:pk>/lue/', views.MarquerLueView.as_view()),
]