from django.urls import path
from . import views

urlpatterns = [
    path('',            views.ListeActualitesView.as_view()),
    path('external/',   views.ExternalNewsView.as_view()),
    path('categories/', views.ListeCategoriesActualiteView.as_view()),
    path('<uuid:pk>/',  views.DetailActualiteView.as_view()),
]