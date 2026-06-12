from rest_framework import serializers
from django.conf import settings
from apps.common.utils import calculer_frais, calculer_commission
from .models import Commande, LitigeCommande, Paiement, RetaitVendeur, Message
from apps.products.models import Produit


class CommandeSerializer(serializers.ModelSerializer):
    acheteur_nom       = serializers.CharField(source='acheteur.nom_complet',  read_only=True)
    vendeur_nom        = serializers.CharField(source='vendeur.nom_complet',   read_only=True)
    produit_nom        = serializers.CharField(source='produit.nom',           read_only=True)
    transporteur_nom   = serializers.SerializerMethodField()
    produit_image      = serializers.SerializerMethodField()

    class Meta:
        model  = Commande
        fields = [
            'id', 'reference', 'acheteur', 'acheteur_nom',
            'vendeur', 'vendeur_nom', 'produit', 'produit_nom', 'produit_image',
            'transporteur', 'transporteur_nom',
            'quantite', 'prix_unitaire', 'montant_produit',
            'frais_livraison', 'frais_paiement', 'commission',
            'montant_total', 'montant_vendeur',
            'mode_paiement', 'statut',
            'adresse_livraison', 'telephone_livraison', 'note_acheteur',
            'note_livraison', 'commentaire_livraison',
            'confirme_reception_vendeur', 'confirme_preparation_vendeur',
            'confirme_acheteur', 'confirme_vendeur', 'confirme_transporteur',
            'date_confirmation', 'date_livraison', 'date_reception',
            'paiement_en_escrow', 'paiement_libere_le',
            'created_at',
        ]
        read_only_fields = [
            'id', 'reference', 'acheteur', 'vendeur', 'transporteur',
            'prix_unitaire', 'montant_produit', 'frais_paiement',
            'commission', 'montant_total', 'montant_vendeur',
            'statut',
            'confirme_reception_vendeur', 'confirme_preparation_vendeur',
            'confirme_acheteur', 'confirme_vendeur', 'confirme_transporteur',
            'date_confirmation', 'date_livraison', 'date_reception',
            'paiement_en_escrow', 'paiement_libere_le', 'created_at',
        ]

    def get_transporteur_nom(self, obj):
        return obj.transporteur.nom_complet if obj.transporteur else None

    def get_produit_image(self, obj):
        if not obj.produit:
            return None
        img = obj.produit.images.filter(est_principale=True).first() or obj.produit.images.first()
        if img and img.image:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class PasserCommandeSerializer(serializers.Serializer):
    produit_id          = serializers.UUIDField()
    quantite            = serializers.DecimalField(max_digits=10, decimal_places=2)
    mode_paiement       = serializers.ChoiceField(choices=Commande.ModePaiement.choices)
    adresse_livraison   = serializers.CharField()
    telephone_livraison = serializers.CharField()
    note_acheteur       = serializers.CharField(required=False, allow_blank=True, default='')
    transporteur_id     = serializers.UUIDField(required=False, allow_null=True, default=None)
    tarif_livraison     = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, default=None)
    ville_depart        = serializers.CharField(required=False, allow_blank=True, default='')
    ville_arrivee       = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_produit_id(self, value):
        try:
            produit = Produit.objects.get(pk=value, statut='ACTIF', est_disponible=True)
            self.context['produit'] = produit
            return value
        except Produit.DoesNotExist:
            raise serializers.ValidationError('Produit non disponible.')

    def validate(self, data):
        produit  = self.context.get('produit')
        quantite = data.get('quantite')
        if produit and quantite > produit.quantite:
            raise serializers.ValidationError({
                'quantite': f'Quantité disponible : {produit.quantite} {produit.unite}'
            })
        return data

    def create(self, validated_data):
        from apps.authentication.models import User as UserModel
        acheteur        = self.context['request'].user
        produit         = self.context['produit']
        quantite        = validated_data['quantite']
        mode            = validated_data['mode_paiement']
        transporteur_id = validated_data.get('transporteur_id')
        tarif_custom    = validated_data.get('tarif_livraison')

        montant_produit = float(produit.prix) * float(quantite)
        frais_livraison = float(tarif_custom) if tarif_custom else 5000
        frais_paiement  = calculer_frais(montant_produit, mode)
        commission      = calculer_commission(montant_produit)
        montant_total   = montant_produit + frais_livraison + frais_paiement
        montant_vendeur = montant_produit - commission

        transporteur = None
        if transporteur_id:
            try:
                transporteur = UserModel.objects.get(pk=transporteur_id, role='TRANSPORTER')
            except UserModel.DoesNotExist:
                pass

        commande = Commande.objects.create(
            acheteur            = acheteur,
            vendeur             = produit.vendeur,
            produit             = produit,
            quantite            = quantite,
            prix_unitaire       = produit.prix,
            montant_produit     = montant_produit,
            frais_livraison     = frais_livraison,
            frais_paiement      = frais_paiement,
            commission          = commission,
            montant_total       = montant_total,
            montant_vendeur     = montant_vendeur,
            mode_paiement       = mode,
            adresse_livraison   = validated_data['adresse_livraison'],
            telephone_livraison = validated_data['telephone_livraison'],
            note_acheteur       = validated_data.get('note_acheteur', ''),
            transporteur        = transporteur,
        )

        # Créer automatiquement la MissionTransport quand un transporteur est choisi
        if transporteur:
            from apps.transport.models import MissionTransport
            MissionTransport.objects.create(
                commande      = commande,
                transporteur  = transporteur,
                ville_depart  = validated_data.get('ville_depart', ''),
                ville_arrivee = validated_data.get('ville_arrivee', ''),
                tarif         = frais_livraison,
                statut        = MissionTransport.Statut.EN_ATTENTE,
            )

        return commande


class ConfirmerReceptionSerializer(serializers.Serializer):
    note        = serializers.IntegerField(min_value=1, max_value=5)
    commentaire = serializers.CharField(required=False, allow_blank=True, default='')


class LitigeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LitigeCommande
        fields = ['id', 'commande', 'description', 'statut', 'resolution', 'created_at']
        read_only_fields = ['id', 'commande', 'statut', 'resolution', 'created_at']


class LitigeDetailSerializer(serializers.ModelSerializer):
    commande_reference = serializers.CharField(source='commande.reference', read_only=True)
    commande_produit   = serializers.CharField(source='commande.produit.nom', read_only=True)
    commande_montant   = serializers.DecimalField(source='commande.montant_total', max_digits=12, decimal_places=2, read_only=True)
    plaignant_nom      = serializers.CharField(source='plaignant.nom_complet', read_only=True)
    vendeur_nom        = serializers.CharField(source='commande.vendeur.nom_complet', read_only=True)
    commande_id        = serializers.UUIDField(source='commande.id', read_only=True)

    class Meta:
        model  = LitigeCommande
        fields = [
            'id', 'commande_id', 'commande_reference', 'commande_produit',
            'commande_montant', 'plaignant_nom', 'vendeur_nom',
            'description', 'statut', 'resolution', 'date_resolution', 'created_at',
        ]
        read_only_fields = fields


# ===== PAYMENT & ESCROW SERIALIZERS =====

class PaiementSerializer(serializers.ModelSerializer):
    commande_reference = serializers.CharField(source='commande.reference', read_only=True)
    montant_str = serializers.SerializerMethodField()
    
    class Meta:
        model = Paiement
        fields = [
            'id', 'commande', 'commande_reference',
            'montant', 'montant_str', 'mode_paiement', 'statut',
            'reference_transaction', 'date_recu', 'date_en_escrow',
            'date_transfere', 'message_erreur', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'commande', 'date_recu', 'date_en_escrow',
            'date_transfere', 'created_at', 'updated_at'
        ]
    
    def get_montant_str(self, obj):
        return f"{obj.montant:.2f} XOF"


class InitiatePaiementSerializer(serializers.Serializer):
    commande_id = serializers.UUIDField()
    mode_paiement = serializers.ChoiceField(choices=Commande.ModePaiement.choices)
    
    def validate_commande_id(self, value):
        try:
            commande = Commande.objects.get(pk=value)
            self.context['commande'] = commande
            return value
        except Commande.DoesNotExist:
            raise serializers.ValidationError('Commande non trouvée.')
    
    def validate(self, data):
        commande = self.context.get('commande')
        if commande and commande.statut != Commande.Statut.PAIEMENT_EN_ATTENTE:
            raise serializers.ValidationError(
                'Commande non en attente de paiement.'
            )
        return data


class ConfirmPaiementSerializer(serializers.Serializer):
    paiement_id = serializers.UUIDField()
    transaction_id = serializers.CharField(max_length=100)
    
    def validate_paiement_id(self, value):
        try:
            paiement = Paiement.objects.get(pk=value)
            self.context['paiement'] = paiement
            return value
        except Paiement.DoesNotExist:
            raise serializers.ValidationError('Paiement non trouvé.')


# ===== SELLER WITHDRAWAL SERIALIZERS =====

class RetaitVendeurSerializer(serializers.ModelSerializer):
    vendeur_nom = serializers.CharField(source='vendeur.nom_complet', read_only=True)
    montant_str = serializers.SerializerMethodField()
    
    class Meta:
        model = RetaitVendeur
        fields = [
            'id', 'vendeur', 'vendeur_nom', 'montant', 'montant_str',
            'statut', 'compte_bancaire', 'nom_titulaire',
            'date_demande', 'date_approuvé', 'date_effectué',
            'reference_virement', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'vendeur', 'date_approuvé', 'date_effectué',
            'reference_virement', 'created_at', 'updated_at'
        ]
    
    def get_montant_str(self, obj):
        return f"{obj.montant:.2f} XOF"


class DemandedRetaitVendeurSerializer(serializers.Serializer):
    montant = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1000)
    compte_bancaire = serializers.CharField(max_length=50)
    nom_titulaire = serializers.CharField(max_length=200)
    
    def validate_montant(self, value):
        user = self.context['request'].user
        from django.db.models import Sum
        
        paiements_liberes = Paiement.objects.filter(
            commande__vendeur=user,
            statut=Paiement.Statut.PRET_VENDEUR
        ).aggregate(total=Sum('montant'))['total'] or 0
        
        if float(value) > float(paiements_liberes):
            raise serializers.ValidationError(
                f'Solde insuffisant. Disponible: {paiements_liberes:.2f} XOF'
            )
        return value


class AdminApproveWithdrawalSerializer(serializers.Serializer):
    retrait_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_retrait_id(self, value):
        try:
            retrait = RetaitVendeur.objects.get(pk=value)
            self.context['retrait'] = retrait
            return value
        except RetaitVendeur.DoesNotExist:
            raise serializers.ValidationError('Retrait non trouvé.')


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom  = serializers.CharField(source='expediteur.nom_complet', read_only=True)
    expediteur_role = serializers.CharField(source='expediteur.role',         read_only=True)

    class Meta:
        model  = Message
        fields = [
            'id', 'commande', 'expediteur', 'expediteur_nom', 'expediteur_role',
            'contenu', 'est_lu', 'created_at',
        ]
        read_only_fields = ['id', 'commande', 'expediteur', 'est_lu', 'created_at']