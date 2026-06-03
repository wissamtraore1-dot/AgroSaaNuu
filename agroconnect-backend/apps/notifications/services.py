from .models import Notification


def envoyer_notification(user, titre, message, type_notif=Notification.Type.SYSTEME, lien='', data=None):
    return Notification.objects.create(
        user=user,
        titre=titre,
        message=message,
        type=type_notif,
        lien=lien,
        data=data or {},
    )


def notifier_nouvelle_commande(commande):
    envoyer_notification(
        user=commande.vendeur,
        titre='Nouvelle commande reçue',
        message=f'Vous avez reçu une commande de {commande.acheteur.nom_complet} — {commande.reference}',
        type_notif=Notification.Type.COMMANDE,
        lien=f'/seller/orders/{commande.id}',
    )


def notifier_commande_confirmee(commande):
    envoyer_notification(
        user=commande.acheteur,
        titre='Commande confirmée',
        message=f'Votre commande {commande.reference} a été confirmée par le vendeur.',
        type_notif=Notification.Type.COMMANDE,
        lien=f'/buyer/orders/{commande.id}',
    )


def notifier_paiement_recu(commande):
    envoyer_notification(
        user=commande.vendeur,
        titre='Paiement reçu',
        message=f'Vous avez reçu {commande.montant_vendeur:,.0f} FCFA pour la commande {commande.reference}.',
        type_notif=Notification.Type.PAIEMENT,
        lien=f'/finance/wallet',
    )


# ─── Notifications transport ──────────────────────────────────────────────────

def notifier_mission_assignee(mission):
    """Transporter assigned to an order — notify them."""
    envoyer_notification(
        user=mission.transporteur,
        titre='Nouvelle mission de transport',
        message=(
            f'Vous avez une nouvelle mission : {mission.ville_depart} → {mission.ville_arrivee} '
            f'(commande {mission.commande.reference}). Tarif : {mission.tarif:,.0f} FCFA.'
        ),
        type_notif=Notification.Type.LIVRAISON,
        lien=f'/transporter/missions',
        data={'mission_id': str(mission.id)},
    )
    # Notifier aussi acheteur + vendeur
    for user in [mission.commande.acheteur, mission.commande.vendeur]:
        envoyer_notification(
            user=user,
            titre='Transporteur assigné',
            message=f'Un transporteur a été assigné à votre commande {mission.commande.reference}.',
            type_notif=Notification.Type.LIVRAISON,
            lien=f'/buyer/orders/{mission.commande.id}' if user == mission.commande.acheteur else f'/seller/orders/{mission.commande.id}',
        )


def notifier_transport_demarre(mission):
    """Notify buyer + seller that transport has started."""
    for user, lien in [
        (mission.commande.acheteur, f'/buyer/orders/{mission.commande.id}'),
        (mission.commande.vendeur,  f'/seller/orders/{mission.commande.id}'),
    ]:
        envoyer_notification(
            user=user,
            titre='Transport en cours',
            message=f'Votre commande {mission.commande.reference} est en route ! ({mission.ville_depart} → {mission.ville_arrivee})',
            type_notif=Notification.Type.LIVRAISON,
            lien=lien,
            data={'mission_id': str(mission.id)},
        )


def notifier_livraison_effectuee(mission):
    """Notify buyer + seller that delivery is done — buyer must confirm."""
    envoyer_notification(
        user=mission.commande.acheteur,
        titre='Livraison effectuée — confirmation requise',
        message=(
            f'Votre commande {mission.commande.reference} a été livrée. '
            f'Confirmez la réception pour libérer le paiement au vendeur.'
        ),
        type_notif=Notification.Type.LIVRAISON,
        lien=f'/buyer/orders/{mission.commande.id}',
        data={'mission_id': str(mission.id)},
    )
    envoyer_notification(
        user=mission.commande.vendeur,
        titre='Livraison terminée',
        message=f'La commande {mission.commande.reference} a été livrée. En attente de confirmation acheteur.',
        type_notif=Notification.Type.LIVRAISON,
        lien=f'/seller/orders/{mission.commande.id}',
    )


def notifier_nouveau_message(message):
    """Notify all participants of a new message (except sender)."""
    commande      = message.commande
    expediteur    = message.expediteur
    participants  = [commande.acheteur, commande.vendeur]
    if hasattr(commande, 'mission_transport'):
        participants.append(commande.mission_transport.transporteur)

    for user in participants:
        if user == expediteur:
            continue
        role_lien = {
            'BUYER':       f'/buyer/orders/{commande.id}',
            'SELLER':      f'/seller/orders/{commande.id}',
            'TRANSPORTER': f'/transporter/missions',
        }.get(user.role, '/')
        envoyer_notification(
            user=user,
            titre=f'Nouveau message — Commande {commande.reference}',
            message=f'{expediteur.nom_complet} : {message.contenu[:100]}',
            type_notif=Notification.Type.SYSTEME,
            lien=role_lien,
            data={'commande_id': str(commande.id)},
        )