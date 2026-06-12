from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Vehicule, MissionTransport, TarifLivraison
from .serializers import VehiculeSerializer, MissionTransportSerializer, TransporteurDisponibleSerializer, TarifLivraisonSerializer
from apps.authentication.models import User
from apps.authentication.permissions import IsTransporter, IsBuyer, IsSeller

# ── Distances approximatives entre villes du Bénin (km) ──────────────────────
_DISTANCES = {
    ('COTONOU',       'PORTO-NOVO'):    30,
    ('COTONOU',       'ABOMEY-CALAVI'): 15,
    ('COTONOU',       'OUIDAH'):        40,
    ('COTONOU',       'BOHICON'):      107,
    ('COTONOU',       'ABOMEY'):       115,
    ('COTONOU',       'LOKOSSA'):      118,
    ('COTONOU',       'NATITINGOU'):   550,
    ('COTONOU',       'DJOUGOU'):      420,
    ('COTONOU',       'KANDI'):        600,
    ('COTONOU',       'PARAKOU'):      405,
    ('COTONOU',       'SAVE'):         190,
    ('COTONOU',       'BEMBEREKE'):    490,
    ('COTONOU',       'NIKKI'):        520,
    ('COTONOU',       'MALANVILLE'):   670,
    ('PARAKOU',       'NATITINGOU'):   185,
    ('PARAKOU',       'KANDI'):        200,
    ('PARAKOU',       'DJOUGOU'):      115,
    ('PARAKOU',       'NIKKI'):        120,
    ('PARAKOU',       'MALANVILLE'):   265,
    ('PARAKOU',       'BEMBEREKE'):     90,
    ('ABOMEY',        'BOHICON'):        8,
    ('ABOMEY',        'LOKOSSA'):       30,
    ('BOHICON',       'LOKOSSA'):       33,
    ('NATITINGOU',    'DJOUGOU'):      135,
    ('KANDI',         'MALANVILLE'):    65,
    ('PORTO-NOVO',    'ABOMEY-CALAVI'): 18,
}

TAUX_TONNE_KM = 300     # FCFA par tonne·km
FRAIS_BASE    = 10_000  # FCFA (minimum)


def _distance_km(v1: str, v2: str) -> int:
    k = v1.upper().strip(), v2.upper().strip()
    return _DISTANCES.get(k, _DISTANCES.get((k[1], k[0]), 200))


def estimer_tarif(ville_depart: str, ville_arrivee: str, tonnes: float) -> int:
    if ville_depart.upper() == ville_arrivee.upper():
        return FRAIS_BASE
    dist = _distance_km(ville_depart, ville_arrivee)
    return max(FRAIS_BASE, round(TAUX_TONNE_KM * tonnes * dist))


class ListeTransporteursView(generics.ListAPIView):
    """GET /api/v1/transport/transporteurs/"""
    permission_classes = [AllowAny]

    def get(self, request):
        transporteurs = User.objects.filter(
            role='TRANSPORTER', is_active=True,
            transporter_profile__est_verifie=True,
        ).select_related('transporter_profile')
        from apps.authentication.serializers import UserSerializer
        return Response({
            'success':       True,
            'transporteurs': UserSerializer(transporteurs, many=True).data,
        })


class MesVehiculesView(generics.ListAPIView):
    """GET /api/v1/transport/mes-vehicules/"""
    serializer_class   = VehiculeSerializer
    permission_classes = [IsTransporter]

    def get_queryset(self):
        return Vehicule.objects.filter(transporteur=self.request.user)


class AjouterVehiculeView(APIView):
    """POST /api/v1/transport/vehicules/ajouter/"""
    permission_classes = [IsTransporter]

    def post(self, request):
        # Gate : le transporteur doit avoir renseigné son CIP
        if not request.user.cip:
            return Response({
                'success':         False,
                'profil_incomplet': True,
                'message':         'Complétez votre profil (numéro CIP requis) avant d\'enregistrer un véhicule.',
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = VehiculeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            vehicule = serializer.save()
            return Response({
                'success':  True,
                'message':  'Véhicule ajouté.',
                'vehicule': VehiculeSerializer(vehicule).data,
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=400)


class SupprimerVehiculeView(APIView):
    """DELETE /api/v1/transport/vehicules/<id>/supprimer/"""
    permission_classes = [IsTransporter]

    def delete(self, request, pk):
        vehicule = get_object_or_404(Vehicule, pk=pk, transporteur=request.user)
        vehicule.delete()
        return Response({'success': True, 'message': 'Véhicule supprimé.'})


class MesMissionsView(generics.ListAPIView):
    """GET /api/v1/transport/mes-missions/"""
    serializer_class   = MissionTransportSerializer
    permission_classes = [IsTransporter]

    def get_queryset(self):
        qs = MissionTransport.objects.filter(
            transporteur=self.request.user
        ).select_related('commande', 'commande__acheteur', 'commande__vendeur', 'commande__produit', 'vehicule')
        statut = self.request.query_params.get('status', '').strip().upper()
        if statut:
            qs = qs.filter(statut=statut)
        return qs.order_by('-created_at')


class MettreAJourDisponibiliteView(APIView):
    """GET/POST /api/v1/transport/disponibilite/"""
    permission_classes = [IsTransporter]

    def get(self, request):
        profil = request.user.transporter_profile
        return Response({
            'success':        True,
            'est_disponible': profil.est_disponible,
        })

    def post(self, request):
        est_disponible = request.data.get('est_disponible', True)
        profil = request.user.transporter_profile
        profil.est_disponible = est_disponible
        profil.save(update_fields=['est_disponible'])
        return Response({
            'success':        True,
            'est_disponible': est_disponible,
            'message':        'Disponibilité mise à jour.',
        })


class ModifierVehiculeView(APIView):
    """PUT /api/v1/transport/vehicules/<id>/modifier/"""
    permission_classes = [IsTransporter]

    def put(self, request, pk):
        vehicule = get_object_or_404(Vehicule, pk=pk, transporteur=request.user)
        serializer = VehiculeSerializer(vehicule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success':  True,
                'message':  'Véhicule mis à jour.',
                'vehicule': serializer.data,
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AccepterMissionView(APIView):
    """POST /api/v1/transport/missions/<id>/accepter/"""
    permission_classes = [IsTransporter]

    def post(self, request, pk):
        mission = get_object_or_404(MissionTransport, pk=pk, transporteur=request.user)
        if mission.statut != MissionTransport.Statut.EN_ATTENTE:
            return Response({
                'success': False,
                'message': 'Seules les missions en attente peuvent être acceptées.',
            }, status=status.HTTP_400_BAD_REQUEST)

        # Gate : vérification admin requise avant première mission
        try:
            profil = request.user.transporter_profile
        except Exception:
            profil = None

        if profil and not profil.est_verifie:
            if profil.date_demande_verification is None:
                profil.date_demande_verification = timezone.now()
                profil.save(update_fields=['date_demande_verification'])
                from apps.notifications.services import notifier_demande_verification
                notifier_demande_verification(request.user)
            return Response({
                'success':             False,
                'verification_pending': True,
                'message':             'Votre compte est en attente de vérification par l\'administrateur. '
                                       'Vous serez notifié(e) une fois approuvé(e).',
            }, status=status.HTTP_403_FORBIDDEN)

        mission.statut = MissionTransport.Statut.ACCEPTEE
        mission.save(update_fields=['statut'])
        return Response({
            'success': True,
            'message': 'Mission acceptée.',
            'mission': MissionTransportSerializer(mission).data,
        })


class RefuserMissionView(APIView):
    """POST /api/v1/transport/missions/<id>/refuser/"""
    permission_classes = [IsTransporter]

    def post(self, request, pk):
        mission = get_object_or_404(MissionTransport, pk=pk, transporteur=request.user)
        if mission.statut not in [MissionTransport.Statut.EN_ATTENTE, MissionTransport.Statut.ACCEPTEE]:
            return Response({
                'success': False,
                'message': 'Mission ne peut plus être refusée.',
            }, status=status.HTTP_400_BAD_REQUEST)
        mission.statut = MissionTransport.Statut.ANNULEE
        mission.save(update_fields=['statut'])
        return Response({
            'success': True,
            'message': 'Mission refusée.',
            'mission': MissionTransportSerializer(mission).data,
        })


# ─────────────────────────────────────────────────────────────────────────────
# NOUVELLES VUES
# ─────────────────────────────────────────────────────────────────────────────

class TransporteursDisponiblesView(APIView):
    """
    GET /api/v1/transport/disponibles/?ville_depart=&ville_arrivee=&tonnes=
    Liste les transporteurs disponibles filtrés par capacité.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ville_depart  = request.query_params.get('ville_depart', '')
        ville_arrivee = request.query_params.get('ville_arrivee', '')
        tonnes        = float(request.query_params.get('tonnes', 1))

        transporteurs = User.objects.filter(
            role='TRANSPORTER',
            is_active=True,
            transporter_profile__est_disponible=True,
            transporter_profile__est_verifie=True,
        ).select_related('transporter_profile').prefetch_related('vehicules')

        # Filtrer par capacité
        result = []
        for t in transporteurs:
            vehicules = t.vehicules.filter(
                statut=Vehicule.Statut.DISPONIBLE,
                est_actif=True,
                capacite_tonnes__gte=tonnes,
            )
            if vehicules.exists():
                tarif_estime = estimer_tarif(ville_depart, ville_arrivee, tonnes)
                result.append({
                    'id':            str(t.id),
                    'nom':           t.nom_complet,
                    'photo':         request.build_absolute_uri(t.photo.url) if t.photo else None,
                    'note_moyenne':  float(t.transporter_profile.note_moyenne),
                    'total_missions': t.transporter_profile.total_missions,
                    'est_certifie':  t.transporter_profile.est_certifie,
                    'vehicules':     [
                        {
                            'id':               str(v.id),
                            'type':             v.type,
                            'immatriculation':  v.immatriculation,
                            'capacite_tonnes':  float(v.capacite_tonnes),
                        }
                        for v in vehicules
                    ],
                    'tarif_estime':  tarif_estime,
                })

        return Response({'success': True, 'transporteurs': result})


class EstimationCoutView(APIView):
    """
    GET /api/v1/transport/estimation/?ville_depart=&ville_arrivee=&tonnes=
    Retourne une estimation du coût de transport.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ville_depart  = request.query_params.get('ville_depart', 'Cotonou')
        ville_arrivee = request.query_params.get('ville_arrivee', 'Parakou')
        tonnes        = float(request.query_params.get('tonnes', 1))

        distance  = _distance_km(ville_depart, ville_arrivee)
        tarif     = estimer_tarif(ville_depart, ville_arrivee, tonnes)

        return Response({
            'success':        True,
            'ville_depart':   ville_depart,
            'ville_arrivee':  ville_arrivee,
            'tonnes':         tonnes,
            'distance_km':    distance,
            'tarif_estime':   tarif,
            'taux_tonne_km':  TAUX_TONNE_KM,
        })


class AssignerTransporteurView(APIView):
    """
    POST /api/v1/transport/assigner/
    Crée une MissionTransport pour une commande confirmée.
    Body: { commande_id, transporteur_id, vehicule_id, ville_depart, ville_arrivee, date_depart? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.orders.models import Commande

        commande_id    = request.data.get('commande_id')
        transporteur_id = request.data.get('transporteur_id')
        vehicule_id    = request.data.get('vehicule_id')
        ville_depart   = request.data.get('ville_depart', '')
        ville_arrivee  = request.data.get('ville_arrivee', '')
        date_depart    = request.data.get('date_depart')

        if not all([commande_id, transporteur_id, ville_depart, ville_arrivee]):
            return Response({'success': False, 'message': 'Données manquantes'},
                            status=status.HTTP_400_BAD_REQUEST)

        commande = get_object_or_404(Commande, pk=commande_id)

        # Seuls acheteur et vendeur peuvent assigner
        if request.user not in [commande.acheteur, commande.vendeur]:
            return Response({'success': False, 'message': 'Accès non autorisé'},
                            status=status.HTTP_403_FORBIDDEN)

        if hasattr(commande, 'mission_transport'):
            return Response({'success': False, 'message': 'Un transporteur est déjà assigné'},
                            status=status.HTTP_400_BAD_REQUEST)

        transporteur = get_object_or_404(User, pk=transporteur_id, role='TRANSPORTER')
        vehicule     = None
        if vehicule_id:
            vehicule = get_object_or_404(Vehicule, pk=vehicule_id, transporteur=transporteur)

        tonnes = float(commande.quantite)
        tarif  = estimer_tarif(ville_depart, ville_arrivee, tonnes)

        mission = MissionTransport.objects.create(
            commande      = commande,
            transporteur  = transporteur,
            vehicule      = vehicule,
            ville_depart  = ville_depart,
            ville_arrivee = ville_arrivee,
            tarif         = tarif,
            date_depart   = date_depart,
            statut        = MissionTransport.Statut.EN_ATTENTE,
        )

        # Notification transporteur
        from apps.notifications.services import notifier_mission_assignee
        notifier_mission_assignee(mission)

        return Response({
            'success': True,
            'message': 'Transporteur assigné. En attente de confirmation.',
            'mission': MissionTransportSerializer(mission).data,
        }, status=status.HTTP_201_CREATED)


class MissionDetailView(APIView):
    """GET /api/v1/transport/missions/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        mission = get_object_or_404(MissionTransport, pk=pk)
        commande = mission.commande
        if request.user not in [mission.transporteur, commande.acheteur, commande.vendeur]:
            return Response({'success': False, 'message': 'Accès non autorisé'},
                            status=status.HTTP_403_FORBIDDEN)
        return Response({'success': True, 'mission': MissionTransportSerializer(mission).data})


class MissionDeCommandeView(APIView):
    """GET /api/v1/transport/commande/<commande_id>/mission/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, commande_id):
        from apps.orders.models import Commande
        commande = get_object_or_404(Commande, pk=commande_id)
        if request.user not in [commande.acheteur, commande.vendeur, commande.transporteur]:
            return Response({'success': False, 'message': 'Accès non autorisé'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            mission = commande.mission_transport
            return Response({'success': True, 'mission': MissionTransportSerializer(mission).data})
        except MissionTransport.DoesNotExist:
            return Response({'success': True, 'mission': None})


class DemarrerMissionView(APIView):
    """POST /api/v1/transport/missions/<id>/demarrer/ — transporteur"""
    permission_classes = [IsTransporter]

    def post(self, request, pk):
        mission = get_object_or_404(MissionTransport, pk=pk, transporteur=request.user)
        if mission.statut != MissionTransport.Statut.ACCEPTEE:
            return Response({'success': False, 'message': 'Mission non acceptée.'},
                            status=status.HTTP_400_BAD_REQUEST)
        commande = mission.commande
        if not commande.confirme_vendeur:
            return Response({'success': False, 'message': 'Le vendeur n\'a pas encore remis le colis.'},
                            status=status.HTTP_400_BAD_REQUEST)
        mission.statut      = MissionTransport.Statut.EN_COURS
        mission.date_depart = timezone.now()
        mission.save(update_fields=['statut', 'date_depart'])

        commande.statut         = 'EN_LIVRAISON'
        commande.date_livraison = timezone.now()
        commande.save(update_fields=['statut', 'date_livraison'])

        from apps.notifications.services import notifier_transport_demarre
        notifier_transport_demarre(mission)

        return Response({
            'success': True,
            'message': 'Mission en cours — commande en livraison.',
            'mission': MissionTransportSerializer(mission).data,
        })


class TerminerMissionView(APIView):
    """POST /api/v1/transport/missions/<id>/terminer/ — transporteur"""
    permission_classes = [IsTransporter]

    def post(self, request, pk):
        mission = get_object_or_404(MissionTransport, pk=pk, transporteur=request.user)
        if mission.statut != MissionTransport.Statut.EN_COURS:
            return Response({'success': False, 'message': 'Mission non démarrée'},
                            status=status.HTTP_400_BAD_REQUEST)

        mission.statut       = MissionTransport.Statut.TERMINEE
        mission.date_arrivee = timezone.now()
        mission.save(update_fields=['statut', 'date_arrivee'])

        # Mettre commande LIVREE + confirme_transporteur
        from apps.orders.models import Commande
        commande = mission.commande
        commande.statut               = Commande.Statut.LIVREE
        commande.confirme_transporteur = True
        champs = ['statut', 'confirme_transporteur']

        # Libération escrow : acheteur + transporteur (ou acheteur seul si pas de transporteur)
        if commande.transporteur:
            toutes_confirmees = commande.confirme_acheteur and commande.confirme_transporteur
        else:
            toutes_confirmees = commande.confirme_acheteur
        if toutes_confirmees:
            commande.statut             = Commande.Statut.PAIEMENT_LIBERE
            commande.paiement_en_escrow = False
            commande.paiement_libere_le = timezone.now()
            commande.date_reception     = timezone.now()
            champs += ['paiement_en_escrow', 'paiement_libere_le', 'date_reception']

        commande.save(update_fields=champs)

        try:
            from apps.notifications.services import notifier_livraison_effectuee
            notifier_livraison_effectuee(mission)
        except Exception:
            pass

        if toutes_confirmees:
            try:
                from apps.wallet.services import liberer_paiement_vendeur
                liberer_paiement_vendeur(commande)
            except Exception:
                pass
            try:
                from apps.notifications.services import notifier_escrow_libere
                notifier_escrow_libere(commande)
            except Exception:
                pass

        # Incrémenter compteur missions transporteur
        try:
            profil = mission.transporteur.transporter_profile
            profil.total_missions += 1
            profil.save(update_fields=['total_missions'])
        except Exception:
            pass

        msg = ('Toutes les parties ont confirmé — paiement libéré au vendeur !'
               if toutes_confirmees
               else 'Livraison confirmée. En attente de confirmation des autres parties.')
        return Response({
            'success': True,
            'message': msg,
            'mission': MissionTransportSerializer(mission).data,
        })


class MesTarifsView(APIView):
    """GET /api/v1/transport/mes-tarifs/ — liste les tarifs du transporteur connecté"""
    permission_classes = [IsTransporter]

    def get(self, request):
        tarifs = TarifLivraison.objects.filter(transporteur=request.user)
        return Response({
            'success': True,
            'tarifs':  TarifLivraisonSerializer(tarifs, many=True, context={'request': request}).data,
        })


class AjouterTarifView(APIView):
    """POST /api/v1/transport/tarifs/ajouter/ — crée un tarif"""
    permission_classes = [IsTransporter]

    def post(self, request):
        serializer = TarifLivraisonSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            tarif = serializer.save()
            return Response({
                'success': True,
                'message': 'Tarif ajouté.',
                'tarif':   TarifLivraisonSerializer(tarif, context={'request': request}).data,
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ModifierTarifView(APIView):
    """PUT/DELETE /api/v1/transport/tarifs/<pk>/"""
    permission_classes = [IsTransporter]

    def put(self, request, pk):
        tarif = get_object_or_404(TarifLivraison, pk=pk, transporteur=request.user)
        serializer = TarifLivraisonSerializer(tarif, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Tarif mis à jour.', 'tarif': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tarif = get_object_or_404(TarifLivraison, pk=pk, transporteur=request.user)
        tarif.delete()
        return Response({'success': True, 'message': 'Tarif supprimé.'})


TARIF_FORFAITAIRE_DEFAUT = 5000  # FCFA — utilisé quand le transporteur n'a aucun tarif défini


class TarifsParTrajetView(APIView):
    """
    GET /api/v1/transport/tarifs/trajet/?ville_depart=X&ville_arrivee=Y

    Niveau 1 — Transporteurs avec un tarif exact pour ce trajet.
    Niveau 2 — Si aucun : transporteurs avec des tarifs sur d'autres trajets
               (tarif le moins cher affiché comme indicatif).
    Niveau 3 — Si toujours aucun : tous les transporteurs actifs/vérifiés/disponibles,
               avec le tarif forfaitaire par défaut.
    """
    permission_classes = [IsAuthenticated]

    def _filtre_transporteur_actif(self):
        return dict(
            is_active=True,
            transporter_profile__est_verifie=True,
            transporter_profile__est_disponible=True,
        )

    def _serialiser_transporteur(self, user, tarif_montant, trajet_label, request):
        """Construit manuellement l'objet renvoyé au front pour un transporteur sans TarifLivraison."""
        profil       = getattr(user, 'transporter_profile', None)
        photo        = None
        if profil and getattr(profil, 'photo', None):
            try:
                photo = request.build_absolute_uri(profil.photo.url)
            except Exception:
                photo = None
        return {
            'id':               None,
            'transporteur':     str(user.id),
            'transporteur_nom': user.nom_complet or user.email,
            'transporteur_photo': photo,
            'note_transporteur': float(profil.note_moyenne) if profil else 0.0,
            'total_missions':    profil.total_missions if profil else 0,
            'tarif':             str(tarif_montant),
            'ville_depart':      '',
            'ville_arrivee':     '',
            'est_trajet_exact':  False,
            'trajet_fallback':   trajet_label,
        }

    def get(self, request):
        from apps.authentication.models import User as AuthUser

        ville_depart  = request.query_params.get('ville_depart', '').strip()
        ville_arrivee = request.query_params.get('ville_arrivee', '').strip()

        if not ville_depart or not ville_arrivee:
            return Response({'success': False, 'message': 'ville_depart et ville_arrivee requis.'}, status=400)

        # ── Niveau 1 : tarif exact ────────────────────────────────────────────
        tarifs_exacts = TarifLivraison.objects.filter(
            ville_depart__iexact=ville_depart,
            ville_arrivee__iexact=ville_arrivee,
            est_actif=True,
            transporteur__is_active=True,
            transporteur__transporter_profile__est_verifie=True,
            transporteur__transporter_profile__est_disponible=True,
        ).select_related('transporteur', 'transporteur__transporter_profile')

        serialized_exacts = TarifLivraisonSerializer(
            tarifs_exacts, many=True, context={'request': request}
        ).data

        if serialized_exacts:
            return Response({
                'success': True,
                'tarifs':        serialized_exacts,
                'autres_tarifs': [],
                'trajet_exact':  True,
            })

        # ── Niveau 2 : tarifs sur d'autres trajets ────────────────────────────
        ids_avec_tarif = (
            TarifLivraison.objects
            .filter(
                est_actif=True,
                transporteur__is_active=True,
                transporteur__transporter_profile__est_verifie=True,
                transporteur__transporter_profile__est_disponible=True,
            )
            .values_list('transporteur_id', flat=True)
            .distinct()
        )

        tarifs_autres_objs = []
        for t_id in ids_avec_tarif:
            tarif = (
                TarifLivraison.objects
                .filter(transporteur_id=t_id, est_actif=True)
                .select_related('transporteur', 'transporteur__transporter_profile')
                .order_by('tarif')
                .first()
            )
            if tarif:
                tarifs_autres_objs.append(tarif)

        if tarifs_autres_objs:
            autres_tarifs_data = TarifLivraisonSerializer(
                tarifs_autres_objs, many=True, context={'request': request}
            ).data
            for item in autres_tarifs_data:
                item['est_trajet_exact'] = False
                item['trajet_fallback']  = f"{item.get('ville_depart', '?')} → {item.get('ville_arrivee', '?')}"
            return Response({
                'success': True,
                'tarifs':        [],
                'autres_tarifs': autres_tarifs_data,
                'trajet_exact':  False,
            })

        # ── Niveau 3 : transporteurs disponibles sans aucun tarif défini ──────
        transporteurs_dispo = AuthUser.objects.filter(
            role='TRANSPORTER',
            **self._filtre_transporteur_actif(),
        ).select_related('transporter_profile')

        # Exclure ceux qui ont déjà un tarif (couverts en niveau 2)
        transporteurs_dispo = transporteurs_dispo.exclude(id__in=ids_avec_tarif)

        autres_tarifs_data = [
            self._serialiser_transporteur(
                user=t,
                tarif_montant=TARIF_FORFAITAIRE_DEFAUT,
                trajet_label='Tarif à convenir',
                request=request,
            )
            for t in transporteurs_dispo
        ]

        return Response({
            'success': True,
            'tarifs':        [],
            'autres_tarifs': autres_tarifs_data,
            'trajet_exact':  False,
        })


class NoterTransporteurView(APIView):
    """
    POST /api/v1/transport/missions/<id>/noter/
    Body: { note: 1-5, commentaire: '' }
    Acheteur ou vendeur note le transporteur.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        mission  = get_object_or_404(MissionTransport, pk=pk)
        commande = mission.commande

        if request.user not in [commande.acheteur, commande.vendeur]:
            return Response({'success': False, 'message': 'Accès non autorisé'},
                            status=status.HTTP_403_FORBIDDEN)
        if mission.statut != MissionTransport.Statut.TERMINEE:
            return Response({'success': False, 'message': 'La mission n\'est pas encore terminée'},
                            status=status.HTTP_400_BAD_REQUEST)
        if mission.note:
            return Response({'success': False, 'message': 'Mission déjà notée'},
                            status=status.HTTP_400_BAD_REQUEST)

        note         = int(request.data.get('note', 0))
        commentaire  = request.data.get('commentaire', '')

        if not 1 <= note <= 5:
            return Response({'success': False, 'message': 'Note entre 1 et 5'},
                            status=status.HTTP_400_BAD_REQUEST)

        mission.note        = note
        mission.commentaire = commentaire
        mission.save(update_fields=['note', 'commentaire'])

        # Recalculer note moyenne du transporteur
        try:
            profil    = mission.transporteur.transporter_profile
            missions_notees = MissionTransport.objects.filter(
                transporteur=mission.transporteur,
                note__isnull=False
            )
            total = sum(m.note for m in missions_notees)
            profil.note_moyenne = total / missions_notees.count()
            profil.save(update_fields=['note_moyenne'])
        except Exception:
            pass

        return Response({'success': True, 'message': 'Transporteur noté. Merci !'})