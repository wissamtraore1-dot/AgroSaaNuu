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