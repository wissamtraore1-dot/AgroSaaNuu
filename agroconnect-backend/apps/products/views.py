from rest_framework import status, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import Categorie, Produit, AvisProduit, FavoriProduit
from .serializers import (
    CategorieSerializer,
    ProduitSerializer,
    ProduitCreateSerializer,
    AjouterAvisSerializer,
)
from apps.authentication.permissions import IsSeller, IsBuyer


class ListeCategoriesView(generics.ListAPIView):
    """GET /api/v1/products/categories/"""
    queryset           = Categorie.objects.filter(est_active=True)
    serializer_class   = CategorieSerializer
    permission_classes = [AllowAny]


class ListeProduitsView(generics.ListAPIView):
    """GET /api/v1/products/"""
    serializer_class   = ProduitSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['ville', 'categorie', 'statut', 'est_disponible']
    search_fields      = ['nom', 'description', 'ville', 'localisation']
    ordering_fields    = ['prix', 'created_at', 'note_moyenne', 'vues']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Produit.objects.filter(
            statut=Produit.Statut.ACTIF,
            est_disponible=True,
            vendeur__seller_profile__est_verifie=True,
        ).select_related('vendeur', 'categorie').prefetch_related('images')


class DetailProduitView(APIView):
    """GET /api/v1/products/<id>/"""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk)
        # Incrémenter les vues
        produit.vues += 1
        produit.save(update_fields=['vues'])
        return Response({
            'success': True,
            'produit': ProduitSerializer(produit).data,
        })


class MesProduitsView(generics.ListAPIView):
    """GET /api/v1/products/mes-produits/"""
    serializer_class   = ProduitSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        return Produit.objects.filter(
            vendeur=self.request.user
        ).select_related('categorie').prefetch_related('images')


class CreerProduitView(APIView):
    """POST /api/v1/products/creer/"""
    permission_classes = [IsSeller]

    def post(self, request):
        # Gate : le vendeur doit avoir renseigné son CIP
        if not request.user.cip:
            return Response({
                'success':         False,
                'profil_incomplet': True,
                'message':         'Complétez votre profil (numéro CIP requis) avant de publier un produit.',
            }, status=status.HTTP_403_FORBIDDEN)

        # Gate : vérification admin requise avant première publication
        try:
            profil = request.user.seller_profile
        except Exception:
            profil = None

        if profil and not profil.est_verifie:
            from django.utils import timezone as tz
            if profil.date_demande_verification is None:
                # Première tentative : déclencher la demande
                profil.date_demande_verification = tz.now()
                profil.save(update_fields=['date_demande_verification'])
                from apps.notifications.services import notifier_demande_verification
                notifier_demande_verification(request.user)
            return Response({
                'success':             False,
                'verification_pending': True,
                'message':             'Votre compte est en attente de vérification par l\'administrateur. '
                                       'Vous serez notifié(e) une fois approuvé(e).',
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ProduitCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            produit = serializer.save()
            return Response({
                'success': True,
                'message': 'Produit créé avec succès.',
                'produit': ProduitSerializer(produit).data,
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ModifierProduitView(APIView):
    """PUT /api/v1/products/<id>/modifier/"""
    permission_classes = [IsSeller]

    def put(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk, vendeur=request.user)
        serializer = ProduitCreateSerializer(
            produit, data=request.data, partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Produit modifié.',
                'produit': ProduitSerializer(produit).data,
            })
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class SupprimerProduitView(APIView):
    """DELETE /api/v1/products/<id>/supprimer/"""
    permission_classes = [IsSeller]

    def delete(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk, vendeur=request.user)
        produit.delete()
        return Response({
            'success': True,
            'message': 'Produit supprimé.',
        })


class AjouterAvisView(APIView):
    """POST /api/v1/products/<id>/avis/"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk)
        if AvisProduit.objects.filter(produit=produit, acheteur=request.user).exists():
            return Response({
                'success': False,
                'message': 'Vous avez déjà noté ce produit.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = AjouterAvisSerializer(
            data=request.data,
            context={'request': request, 'produit': produit}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Avis ajouté.',
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class ToggleFavoriView(APIView):
    """POST /api/v1/products/<id>/favori/"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk)
        favori, created = FavoriProduit.objects.get_or_create(
            acheteur=request.user, produit=produit
        )
        if not created:
            favori.delete()
            return Response({'success': True, 'message': 'Retiré des favoris.', 'favori': False})
        return Response({'success': True, 'message': 'Ajouté aux favoris.', 'favori': True})


class MesFavorisView(generics.ListAPIView):
    """GET /api/v1/products/favoris/"""
    serializer_class   = ProduitSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return Produit.objects.filter(
            favoris__acheteur=self.request.user
        ).select_related('categorie', 'vendeur')