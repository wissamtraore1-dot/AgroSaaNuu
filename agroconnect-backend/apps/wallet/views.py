from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Wallet, Transaction, PlatformWallet, PlatformTransaction
from .serializers import (
    WalletSerializer, TransactionSerializer,
    DeposerSerializer, RetirerSerializer,
    PlatformWalletSerializer, PlatformTransactionSerializer,
)
from . import services


class MonWalletView(APIView):
    """GET /api/v1/wallet/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = services.obtenir_ou_creer_wallet(request.user)
        return Response({
            'success': True,
            'wallet':  WalletSerializer(wallet).data,
        })


class DeposerView(APIView):
    """POST /api/v1/wallet/deposer/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeposerSerializer(data=request.data)
        if serializer.is_valid():
            try:
                txn = services.deposer(
                    user=request.user,
                    montant=float(serializer.validated_data['montant']),
                    mode=serializer.validated_data['mode'],
                    numero_mobile=serializer.validated_data.get('numero_mobile', ''),
                )
                return Response({
                    'success':     True,
                    'message':     'Dépôt effectué.',
                    'transaction': TransactionSerializer(txn).data,
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'message': str(e),
                }, status=status.HTTP_400_BAD_REQUEST)
        first_err = next(iter(serializer.errors.values()), ['Données invalides.'])[0]
        return Response({'success': False, 'message': str(first_err)}, status=400)


class RetirerView(APIView):
    """POST /api/v1/wallet/retirer/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RetirerSerializer(data=request.data)
        if serializer.is_valid():
            try:
                txn = services.retirer(
                    user=request.user,
                    montant=float(serializer.validated_data['montant']),
                    mode=serializer.validated_data['mode'],
                    numero_mobile=serializer.validated_data.get('numero_mobile', ''),
                )
                return Response({
                    'success':     True,
                    'message':     'Retrait effectué.',
                    'transaction': TransactionSerializer(txn).data,
                })
            except Exception as e:
                return Response({
                    'success': False,
                    'message': str(e),
                }, status=status.HTTP_400_BAD_REQUEST)
        first_err = next(iter(serializer.errors.values()), ['Données invalides.'])[0]
        return Response({'success': False, 'message': str(first_err)}, status=400)


class MesTransactionsView(generics.ListAPIView):
    """GET /api/v1/wallet/transactions/"""
    serializer_class   = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        wallet = services.obtenir_ou_creer_wallet(self.request.user)
        return Transaction.objects.filter(wallet=wallet)


# ── Wallet entreprise (admin uniquement) ─────────────────────────────────────

class PlatformWalletView(APIView):
    """GET /api/v1/wallet/plateforme/ — solde et historique du wallet AgroSaaNuu"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        wallet = PlatformWallet.get()
        return Response({
            'success': True,
            'wallet':  PlatformWalletSerializer(wallet).data,
        })


class PlatformRetraitView(APIView):
    """POST /api/v1/wallet/plateforme/retirer/ — retrait depuis le wallet AgroSaaNuu"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès réservé aux administrateurs.'},
                            status=status.HTTP_403_FORBIDDEN)
        montant     = request.data.get('montant')
        description = request.data.get('description', 'Retrait entreprise')

        if not montant:
            return Response({'success': False, 'message': 'Montant requis.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            services.retirer_plateforme(float(montant), description)
            wallet = PlatformWallet.get()
            return Response({
                'success': True,
                'message': f'Retrait de {montant} FCFA effectué.',
                'wallet':  PlatformWalletSerializer(wallet).data,
            })
        except ValueError as e:
            return Response({'success': False, 'message': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


class PlatformTransactionsView(generics.ListAPIView):
    """GET /api/v1/wallet/plateforme/transactions/ — historique complet des commissions"""
    serializer_class   = PlatformTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return PlatformTransaction.objects.none()
        return PlatformTransaction.objects.filter(wallet=PlatformWallet.get())