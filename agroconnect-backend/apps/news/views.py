from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.core.cache import cache

from .models import CategorieActualite, Actualite
from .serializers import (
    CategorieActualiteSerializer,
    ActualiteSerializer,
    ActualiteListSerializer,
)
from .rss_fetcher import get_all_news


class ListeActualitesView(generics.ListAPIView):
    """GET /api/v1/news/"""
    serializer_class   = ActualiteListSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = ['categorie', 'est_vedette']
    search_fields      = ['titre', 'extrait', 'contenu']

    def get_queryset(self):
        return Actualite.objects.filter(
            statut=Actualite.Statut.PUBLIE
        ).select_related('auteur', 'categorie')


class DetailActualiteView(APIView):
    """GET /api/v1/news/<id>/"""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        actualite = get_object_or_404(Actualite, pk=pk, statut=Actualite.Statut.PUBLIE)
        actualite.vues += 1
        actualite.save(update_fields=['vues'])
        return Response({
            'success':   True,
            'actualite': ActualiteSerializer(actualite).data,
        })


class ListeCategoriesActualiteView(generics.ListAPIView):
    """GET /api/v1/news/categories/"""
    queryset           = CategorieActualite.objects.order_by('nom')
    serializer_class   = CategorieActualiteSerializer
    permission_classes = [AllowAny]


class ExternalNewsView(APIView):
    """GET /api/v1/news/external/ — Flux RSS agrégés (cache 30 min)"""
    permission_classes = [AllowAny]

    def get(self, request):
        force_refresh = request.query_params.get('refresh') == '1'
        CACHE_KEY     = 'external_news_v2'
        articles      = None if force_refresh else cache.get(CACHE_KEY)

        if articles is None:
            articles = get_all_news(max_total=40)
            cache.set(CACHE_KEY, articles, timeout=1800)  # 30 minutes

        return Response({
            'success':  True,
            'count':    len(articles),
            'articles': articles,
        })
