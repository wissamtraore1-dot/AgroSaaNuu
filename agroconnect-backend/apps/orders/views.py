from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Commande, LitigeCommande, Paiement, RetaitVendeur
from .serializers import (
    CommandeSerializer,
    PasserCommandeSerializer,
    ConfirmerReceptionSerializer,
    LitigeSerializer,
    LitigeDetailSerializer,
    PaiementSerializer,
)
from apps.authentication.permissions import IsBuyer, IsSeller


class PasserCommandeView(APIView):
    """POST /api/v1/orders/passer/"""
    permission_classes = [IsBuyer]

    def post(self, request):
        serializer = PasserCommandeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            commande = serializer.save()
            return Response({
                'success':  True,
                'message':  'Commande passée. Paiement en séquestre.',
                'commande': CommandeSerializer(commande).data,
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class MesCommandesAcheteurView(generics.ListAPIView):
    """GET /api/v1/orders/mes-commandes/"""
    serializer_class   = CommandeSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return Commande.objects.filter(
            acheteur=self.request.user
        ).select_related('produit', 'vendeur')


class MesCommandesVendeurView(generics.ListAPIView):
    """GET /api/v1/orders/commandes-recues/"""
    serializer_class   = CommandeSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        return Commande.objects.filter(
            vendeur=self.request.user
        ).select_related('produit', 'acheteur')


class DetailCommandeView(APIView):
    """GET /api/v1/orders/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        commande = get_object_or_404(
            Commande, pk=pk
        )
        if commande.acheteur != request.user and commande.vendeur != request.user:
            return Response({
                'success': False,
                'message': 'Accès non autorisé.',
            }, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'success':  True,
            'commande': CommandeSerializer(commande).data,
        })


class ConfirmerCommandeView(APIView):
    """POST /api/v1/orders/<id>/confirmer/ — vendeur"""
    permission_classes = [IsSeller]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, vendeur=request.user)
        if commande.statut != Commande.Statut.EN_ATTENTE:
            return Response({
                'success': False,
                'message': 'Cette commande ne peut pas être confirmée.',
            }, status=status.HTTP_400_BAD_REQUEST)
        commande.statut             = Commande.Statut.CONFIRMEE
        commande.date_confirmation  = timezone.now()
        commande.save(update_fields=['statut', 'date_confirmation'])
        return Response({'success': True, 'message': 'Commande confirmée.'})


class MarquerEnLivraisonView(APIView):
    """POST /api/v1/orders/<id>/en-livraison/ — vendeur"""
    permission_classes = [IsSeller]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, vendeur=request.user)
        if commande.statut not in [Commande.Statut.CONFIRMEE, Commande.Statut.EN_PREPARATION]:
            return Response({
                'success': False,
                'message': 'Action non autorisée.',
            }, status=status.HTTP_400_BAD_REQUEST)
        commande.statut         = Commande.Statut.EN_LIVRAISON
        commande.date_livraison = timezone.now()
        commande.save(update_fields=['statut', 'date_livraison'])
        return Response({'success': True, 'message': 'Commande en livraison.'})


class ConfirmerReceptionView(APIView):
    """POST /api/v1/orders/<id>/confirmer-reception/ — acheteur"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)
        if commande.statut != Commande.Statut.EN_LIVRAISON:
            return Response({
                'success': False,
                'message': 'La commande n\'est pas encore en livraison.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ConfirmerReceptionSerializer(data=request.data)
        if serializer.is_valid():
            commande.statut                 = Commande.Statut.CONFIRMEE_RECEPTION
            commande.date_reception         = timezone.now()
            commande.note_livraison         = serializer.validated_data['note']
            commande.commentaire_livraison  = serializer.validated_data.get('commentaire', '')
            commande.save()

            # Libérer le paiement au vendeur (via wallet)
            try:
                from apps.wallet.services import liberer_paiement_vendeur
                liberer_paiement_vendeur(commande)
            except Exception:
                pass

            return Response({'success': True, 'message': 'Réception confirmée. Vendeur payé.'})
        return Response({
            'success': False,
            'errors':  serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class AnnulerCommandeView(APIView):
    """POST /api/v1/orders/<id>/annuler/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk)
        if commande.acheteur != request.user and commande.vendeur != request.user:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=403)
        if commande.statut not in [Commande.Statut.EN_ATTENTE, Commande.Statut.CONFIRMEE]:
            return Response({'success': False, 'message': 'Commande non annulable.'}, status=400)
        commande.statut = Commande.Statut.ANNULEE
        commande.save(update_fields=['statut'])
        return Response({'success': True, 'message': 'Commande annulée.'})


class SignalerLitigeView(APIView):
    """POST /api/v1/orders/<id>/litige/"""
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)
        if LitigeCommande.objects.filter(commande=commande).exists():
            return Response({'success': False, 'message': 'Un problème a déjà été signalé pour cette commande.'}, status=400)
        serializer = LitigeSerializer(data=request.data)
        if serializer.is_valid():
            litige = LitigeCommande.objects.create(
                commande=commande,
                plaignant=request.user,
                description=serializer.validated_data['description']
            )
            commande.statut = Commande.Statut.LITIGE
            commande.save(update_fields=['statut'])
            try:
                from apps.notifications.services import notifier_litige_signale
                notifier_litige_signale(litige)
            except Exception:
                pass
            return Response({'success': True, 'message': 'Problème signalé. Notre équipe va examiner votre demande.'}, status=201)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class MesLitigesView(generics.ListAPIView):
    """GET /api/v1/orders/mes-litiges/ — acheteur"""
    serializer_class   = LitigeDetailSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return LitigeCommande.objects.filter(
            plaignant=self.request.user
        ).select_related('commande', 'commande__produit', 'commande__vendeur', 'plaignant')


class DetailLitigeView(APIView):
    """GET /api/v1/orders/litiges/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        litige = get_object_or_404(LitigeCommande, pk=pk)
        commande = litige.commande
        if request.user not in [commande.acheteur, commande.vendeur] and not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=403)
        return Response({'success': True, 'litige': LitigeDetailSerializer(litige).data})


class ResoudreLitigeView(APIView):
    """PATCH /api/v1/orders/litiges/<id>/resoudre/ — admin uniquement"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'success': False, 'message': 'Réservé aux administrateurs.'}, status=403)

        litige     = get_object_or_404(LitigeCommande, pk=pk)
        resolution = request.data.get('resolution', '').strip()
        statut     = request.data.get('statut', LitigeCommande.Statut.RESOLU)

        if not resolution:
            return Response({'success': False, 'message': 'La réponse au problème est requise.'}, status=400)

        if statut not in [LitigeCommande.Statut.RESOLU, LitigeCommande.Statut.FERME, LitigeCommande.Statut.EN_COURS]:
            return Response({'success': False, 'message': 'Statut invalide.'}, status=400)

        litige.resolution      = resolution
        litige.statut          = statut
        litige.date_resolution = timezone.now()
        litige.save(update_fields=['resolution', 'statut', 'date_resolution'])

        try:
            from apps.notifications.services import notifier_litige_resolu
            notifier_litige_resolu(litige)
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Problème mis à jour.',
            'litige':  LitigeDetailSerializer(litige).data,
        })


# ===== ESCROW & PAYMENT ENDPOINTS =====

class InitiatePaiementView(APIView):
    """POST /api/v1/payment/initiate/ — Acheteur initie paiement"""
    permission_classes = [IsBuyer]

    def post(self, request):
        commande_id = request.data.get('commande_id')
        mode_paiement = request.data.get('mode_paiement')  # MTN, MOOV, CELTIS, BANK
        
        try:
            commande = Commande.objects.get(id=commande_id, acheteur=request.user)
        except Commande.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Commande non trouvée.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if commande.statut != Commande.Statut.PAIEMENT_EN_ATTENTE:
            return Response({
                'success': False,
                'message': 'Commande non en attente de paiement.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer/mettre à jour le paiement
        paiement, created = Paiement.objects.get_or_create(
            commande=commande,
            defaults={
                'montant': commande.montant_total,
                'mode_paiement': mode_paiement,
                'statut': Paiement.Statut.EN_ATTENTE,
            }
        )
        
        return Response({
            'success': True,
            'message': 'Paiement initié.',
            'paiement': {
                'id': paiement.id,
                'montant': str(paiement.montant),
                'mode_paiement': paiement.mode_paiement,
                'statut': paiement.statut,
            }
        }, status=status.HTTP_201_CREATED)


class ConfirmPaiementView(APIView):
    """POST /api/v1/payment/confirm/ — Confirmer paiement reçu (via webhook)"""
    permission_classes = [IsAuthenticated]  # Peut être appelé par système

    def post(self, request):
        paiement_id = request.data.get('paiement_id')
        transaction_id = request.data.get('transaction_id')
        
        try:
            paiement = Paiement.objects.get(id=paiement_id)
        except Paiement.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paiement non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Marquer paiement comme effectué et en escrow
        paiement.statut = Paiement.Statut.EN_ESCROW
        paiement.reference_transaction = transaction_id
        paiement.date_recu = timezone.now()
        paiement.date_en_escrow = timezone.now()
        paiement.save()
        
        # Mettre à jour statut commande
        commande = paiement.commande
        commande.statut = Commande.Statut.PAIEMENT_RECU
        commande.date_confirmation = timezone.now()
        commande.save()
        
        return Response({
            'success': True,
            'message': 'Paiement confirmé et en escrow.',
            'paiement': {
                'id': paiement.id,
                'statut': paiement.statut,
                'montant': str(paiement.montant),
            }
        })


class ReleasePaiementView(APIView):
    """POST /api/v1/payment/release/ — Libérer paiement au vendeur"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        commande_id = request.data.get('commande_id')
        
        try:
            commande = Commande.objects.get(id=commande_id)
            paiement = Paiement.objects.get(commande=commande)
        except (Commande.DoesNotExist, Paiement.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Commande ou paiement non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier que acheteur a confirmé réception
        if commande.statut != Commande.Statut.CONFIRMEE_RECEPTION:
            return Response({
                'success': False,
                'message': 'Livraison non confirmée.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Libérer paiement
        paiement.statut = Paiement.Statut.PRET_VENDEUR
        paiement.save()
        
        commande.paiement_en_escrow = False
        commande.paiement_libere_le = timezone.now()
        commande.statut = Commande.Statut.PAIEMENT_LIBERE
        commande.save()
        
        return Response({
            'success': True,
            'message': 'Paiement libéré. Vendeur peut retirer.',
            'paiement': {
                'statut': paiement.statut,
                'montant': str(paiement.montant),
            }
        })


# ===== SELLER WITHDRAWAL ENDPOINTS =====

class DemandedRetaitVendeurView(APIView):
    """POST /api/v1/withdrawal/request/ — Vendeur demande retrait"""
    permission_classes = [IsSeller]

    def post(self, request):
        montant = request.data.get('montant')
        compte_bancaire = request.data.get('compte_bancaire')
        nom_titulaire = request.data.get('nom_titulaire')
        
        if not montant or not compte_bancaire or not nom_titulaire:
            return Response({
                'success': False,
                'message': 'Données manquantes.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier solde disponible
        from django.db.models import Sum
        paiements_liberes = Paiement.objects.filter(
            commande__vendeur=request.user,
            statut=Paiement.Statut.PRET_VENDEUR
        ).aggregate(total=Sum('montant'))['total'] or 0
        
        if float(montant) > float(paiements_liberes):
            return Response({
                'success': False,
                'message': f'Solde insuffisant. Disponible: {paiements_liberes}',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        retrait = RetaitVendeur.objects.create(
            vendeur=request.user,
            montant=montant,
            compte_bancaire=compte_bancaire,
            nom_titulaire=nom_titulaire,
            statut=RetaitVendeur.Statut.DEMANDÉ,
        )
        
        return Response({
            'success': True,
            'message': 'Retrait demandé. Attente d\'approbation admin.',
            'retrait': {
                'id': retrait.id,
                'montant': str(retrait.montant),
                'statut': retrait.statut,
            }
        }, status=status.HTTP_201_CREATED)


class MesRetaitsVendeurView(generics.ListAPIView):
    """GET /api/v1/withdrawal/list/ — Historique retraits vendeur"""
    permission_classes = [IsSeller]

    def get_queryset(self):
        return RetaitVendeur.objects.filter(
            vendeur=self.request.user
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        retraits = []
        for retrait in queryset:
            retraits.append({
                'id': retrait.id,
                'montant': str(retrait.montant),
                'statut': retrait.statut,
                'date_demande': retrait.date_demande,
                'date_effectué': retrait.date_effectué,
                'reference_virement': retrait.reference_virement,
            })
        return Response({
            'success': True,
            'retraits': retraits,
        })


class AdminApproveWithdrawalView(APIView):
    """POST /api/v1/withdrawal/approve/ — Admin approuve retrait"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Permissions insuffisantes.',
            }, status=status.HTTP_403_FORBIDDEN)
        
        retrait_id = request.data.get('retrait_id')
        action = request.data.get('action')  # 'approve' or 'reject'
        
        try:
            retrait = RetaitVendeur.objects.get(id=retrait_id)
        except RetaitVendeur.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Retrait non trouvé.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if action == 'approve':
            retrait.statut = RetaitVendeur.Statut.APPROUVÉ
            retrait.date_approuvé = timezone.now()
            
            # Marquer paiements comme transférés
            Paiement.objects.filter(
                commande__vendeur=retrait.vendeur,
                statut=Paiement.Statut.PRET_VENDEUR
            ).update(
                statut=Paiement.Statut.TRANSFERE,
                date_transfere=timezone.now()
            )
            
            message = 'Retrait approuvé.'
        
        elif action == 'reject':
            retrait.statut = RetaitVendeur.Statut.REJETÉ
            message = 'Retrait rejeté.'
        
        else:
            return Response({
                'success': False,
                'message': 'Action non valide.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        retrait.save()
        
        return Response({
            'success': True,
            'message': message,
            'retrait': {
                'id': retrait.id,
                'statut': retrait.statut,
            }
        })


class DetailPaiementView(APIView):
    """GET /api/v1/orders/payment/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            paiement = Paiement.objects.select_related('commande').get(pk=pk)
        except Paiement.DoesNotExist:
            return Response({'success': False, 'message': 'Paiement non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

        commande = paiement.commande
        if commande.acheteur != request.user and commande.vendeur != request.user and not request.user.is_staff:
            return Response({'success': False, 'message': 'Accès non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'paiement': PaiementSerializer(paiement).data})


# ─────────────────────────────────────────────────────────────────────────────
# NOUVELLES VUES
# ─────────────────────────────────────────────────────────────────────────────

class NoterVendeurView(APIView):
    """
    POST /api/v1/orders/<id>/noter-vendeur/
    Body: { note: 1-5, commentaire: '' }
    Acheteur note le vendeur après livraison confirmée.
    """
    permission_classes = [IsBuyer]

    def post(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk, acheteur=request.user)

        if commande.statut not in [
            Commande.Statut.CONFIRMEE_RECEPTION,
            Commande.Statut.PAIEMENT_LIBERE,
        ]:
            return Response({'success': False, 'message': 'La réception n\'a pas encore été confirmée.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if commande.note_vendeur:
            return Response({'success': False, 'message': 'Vendeur déjà noté.'}, status=400)

        note        = int(request.data.get('note', 0))
        commentaire = request.data.get('commentaire', '')

        if not 1 <= note <= 5:
            return Response({'success': False, 'message': 'Note entre 1 et 5.'}, status=400)

        commande.note_vendeur        = note
        commande.commentaire_vendeur = commentaire
        commande.save(update_fields=['note_vendeur', 'commentaire_vendeur'])

        # Recalculer note moyenne vendeur
        try:
            from apps.authentication.models import SellerProfile
            profil = commande.vendeur.seller_profile
            commandes_notees = Commande.objects.filter(
                vendeur=commande.vendeur, note_vendeur__isnull=False
            )
            total = sum(c.note_vendeur for c in commandes_notees)
            profil.note_moyenne = total / commandes_notees.count()
            profil.save(update_fields=['note_moyenne'])
        except Exception:
            pass

        return Response({'success': True, 'message': 'Vendeur noté. Merci pour votre évaluation !'})


