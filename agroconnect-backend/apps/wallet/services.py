from decimal import Decimal
from django.db import transaction
from .models import Wallet, Transaction, PlatformWallet, PlatformTransaction


def obtenir_ou_creer_wallet(user):
    wallet, _ = Wallet.objects.get_or_create(user=user)
    return wallet


def crediter_wallet(user, montant, description=''):
    wallet = obtenir_ou_creer_wallet(user)
    Transaction.objects.create(
        wallet=wallet,
        type=Transaction.Type.RECEPTION,
        mode=Transaction.Mode.INTERNE,
        montant=montant,
        frais=0,
        montant_net=montant,
        statut=Transaction.Statut.SUCCES,
        description=description,
    )
    wallet.solde      += montant
    wallet.total_recu += montant
    wallet.save(update_fields=['solde', 'total_recu'])


@transaction.atomic
def deposer(user, montant, mode, numero_mobile=''):
    from apps.common.utils import calculer_frais
    montant = Decimal(str(montant))
    wallet  = obtenir_ou_creer_wallet(user)
    frais   = Decimal(str(calculer_frais(float(montant), mode)))
    net     = montant - frais

    txn = Transaction.objects.create(
        wallet=wallet, type=Transaction.Type.DEPOT,
        mode=mode, montant=montant, frais=frais,
        montant_net=net, statut=Transaction.Statut.SUCCES,
        description=f'Dépôt via {mode}',
        numero_mobile=numero_mobile,
    )
    wallet.solde      += net
    wallet.total_recu += net
    wallet.save(update_fields=['solde', 'total_recu'])
    return txn


@transaction.atomic
def retirer(user, montant, mode, numero_mobile=''):
    from apps.common.utils import calculer_frais
    montant = Decimal(str(montant))
    wallet  = obtenir_ou_creer_wallet(user)
    frais   = Decimal(str(calculer_frais(float(montant), mode)))
    net     = montant - frais

    if wallet.solde_disponible < montant:
        raise ValueError('Solde insuffisant.')

    txn = Transaction.objects.create(
        wallet=wallet, type=Transaction.Type.RETRAIT,
        mode=mode, montant=montant, frais=frais,
        montant_net=net, statut=Transaction.Statut.SUCCES,
        description=f'Retrait vers {mode}',
        numero_mobile=numero_mobile,
    )
    wallet.solde        -= montant
    wallet.total_retire += montant
    wallet.save(update_fields=['solde', 'total_retire'])
    return txn


@transaction.atomic
def bloquer_sequestre(commande):
    wallet = obtenir_ou_creer_wallet(commande.acheteur)
    Transaction.objects.create(
        wallet=wallet, type=Transaction.Type.BLOCAGE,
        mode=Transaction.Mode.INTERNE,
        montant=commande.montant_total,
        frais=0, montant_net=commande.montant_total,
        statut=Transaction.Statut.SUCCES,
        description=f'Séquestre commande {commande.reference}',
        commande_id=commande.id,
    )
    wallet.solde_bloque += commande.montant_total
    wallet.save(update_fields=['solde_bloque'])


@transaction.atomic
def liberer_paiement_vendeur(commande):
    wallet_acheteur = obtenir_ou_creer_wallet(commande.acheteur)
    wallet_vendeur  = obtenir_ou_creer_wallet(commande.vendeur)

    # Débiter l'acheteur
    wallet_acheteur.solde        -= commande.montant_total
    wallet_acheteur.solde_bloque -= commande.montant_total
    wallet_acheteur.save(update_fields=['solde', 'solde_bloque'])

    Transaction.objects.create(
        wallet=wallet_acheteur, type=Transaction.Type.PAIEMENT,
        mode=commande.mode_paiement,
        montant=commande.montant_total, frais=0,
        montant_net=commande.montant_total,
        statut=Transaction.Statut.SUCCES,
        description=f'Paiement commande {commande.reference}',
        commande_id=commande.id,
    )

    # Créditer le vendeur
    wallet_vendeur.solde      += commande.montant_vendeur
    wallet_vendeur.total_recu += commande.montant_vendeur
    wallet_vendeur.save(update_fields=['solde', 'total_recu'])

    Transaction.objects.create(
        wallet=wallet_vendeur, type=Transaction.Type.RECEPTION,
        mode=Transaction.Mode.INTERNE,
        montant=commande.montant_vendeur, frais=0,
        montant_net=commande.montant_vendeur,
        statut=Transaction.Statut.SUCCES,
        description=f'Réception paiement commande {commande.reference}',
        commande_id=commande.id,
    )

    # Créditer le transporteur si assigné
    if commande.transporteur and commande.frais_livraison > 0:
        crediter_transporteur(commande)

    # Créditer le wallet AgroSaaNuu de la commission
    _crediter_commission_plateforme(
        montant=commande.commission,
        commande_id=commande.id,
        reference=commande.reference,
    )


@transaction.atomic
def crediter_transporteur(commande):
    """Crédite le wallet du transporteur avec les frais de livraison."""
    if not commande.transporteur:
        return
    wallet_transporteur = obtenir_ou_creer_wallet(commande.transporteur)
    montant = float(commande.frais_livraison)

    Transaction.objects.create(
        wallet=wallet_transporteur, type=Transaction.Type.RECEPTION,
        mode=Transaction.Mode.INTERNE,
        montant=montant, frais=0, montant_net=montant,
        statut=Transaction.Statut.SUCCES,
        description=f'Frais de livraison commande {commande.reference}',
        commande_id=commande.id,
    )
    wallet_transporteur.solde      += montant
    wallet_transporteur.total_recu += montant
    wallet_transporteur.save(update_fields=['solde', 'total_recu'])


def _crediter_commission_plateforme(montant, commande_id, reference):
    """Crédite la commission de la transaction sur le wallet entreprise."""
    if not montant or montant <= 0:
        return
    platform = PlatformWallet.get()
    PlatformTransaction.objects.create(
        wallet=platform,
        type=PlatformTransaction.Type.COMMISSION,
        montant=montant,
        description=f'Commission 2% — commande {reference}',
        commande_id=commande_id,
    )
    platform.solde             += montant
    platform.total_commissions += montant
    platform.save(update_fields=['solde', 'total_commissions'])


@transaction.atomic
def retirer_plateforme(montant, description='Retrait entreprise'):
    """Retrait depuis le wallet AgroSaaNuu (admin uniquement)."""
    platform = PlatformWallet.get()
    if platform.solde < montant:
        raise ValueError(f'Solde insuffisant. Disponible : {platform.solde} FCFA')
    PlatformTransaction.objects.create(
        wallet=platform,
        type=PlatformTransaction.Type.RETRAIT,
        montant=montant,
        description=description,
    )
    platform.solde        -= montant
    platform.total_retire += montant
    platform.save(update_fields=['solde', 'total_retire'])