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


def notifier_litige_signale(litige):
    """Notifie le vendeur + admin quand un problème est signalé."""
    commande = litige.commande
    envoyer_notification(
        user=commande.vendeur,
        titre='Problème signalé sur votre commande',
        message=(
            f'L\'acheteur {litige.plaignant.nom_complet} a signalé un problème '
            f'sur la commande {commande.reference}. Notre équipe va examiner la situation.'
        ),
        type_notif=Notification.Type.COMMANDE,
        lien=f'/seller/orders/{commande.id}',
        data={'litige_id': str(litige.id)},
    )
    # Notifier tous les admins
    from apps.authentication.models import User
    for admin in User.objects.filter(is_staff=True):
        envoyer_notification(
            user=admin,
            titre=f'Nouveau problème — Commande {commande.reference}',
            message=(
                f'{litige.plaignant.nom_complet} a signalé un problème avec '
                f'{commande.vendeur.nom_complet} : {litige.description[:120]}'
            ),
            type_notif=Notification.Type.COMMANDE,
            lien=f'/admin/orders/litigecommande/{litige.id}/change/',
            data={'litige_id': str(litige.id)},
        )


def notifier_litige_resolu(litige):
    """Notifie acheteur et vendeur quand un problème est résolu par l'admin."""
    commande = litige.commande
    label = 'résolu' if litige.statut == 'RESOLU' else 'fermé'
    for user, lien in [
        (commande.acheteur, f'/buyer/problemes'),
        (commande.vendeur,  f'/seller/orders/{commande.id}'),
    ]:
        envoyer_notification(
            user=user,
            titre=f'Problème {label} — Commande {commande.reference}',
            message=f'Le problème sur la commande {commande.reference} a été {label}. {litige.resolution[:120]}',
            type_notif=Notification.Type.COMMANDE,
            lien=lien,
            data={'litige_id': str(litige.id)},
        )


def notifier_demande_verification(user):
    """Notifie tous les admins qu'un vendeur/transporteur demande vérification."""
    from apps.authentication.models import User as UserModel
    role_label = 'Vendeur' if user.role == 'SELLER' else 'Transporteur'
    lien = '/admin/verifications'
    for admin in UserModel.objects.filter(is_staff=True):
        envoyer_notification(
            user=admin,
            titre=f'Demande de vérification — {role_label}',
            message=(
                f'{user.nom_complet} ({user.telephone or user.email}) '
                f'demande à être vérifié(e) avant sa première '
                f'{"publication de produit" if user.role == "SELLER" else "mission de transport"}.'
            ),
            type_notif=Notification.Type.SYSTEME,
            lien=lien,
            data={'user_id': str(user.id), 'role': user.role},
        )


def notifier_verification_approuvee(user):
    """Notifie l'utilisateur que son compte est vérifié et validé."""
    role_label = 'publier vos produits' if user.role == 'SELLER' else 'accepter des missions'
    lien = '/seller/dashboard' if user.role == 'SELLER' else '/transporter/dashboard'
    envoyer_notification(
        user=user,
        titre='Compte vérifié — Vous êtes prêt(e) !',
        message=(
            f'Félicitations ! Votre compte a été vérifié par l\'équipe AgroSaaNuu. '
            f'Vous pouvez maintenant {role_label} librement.'
        ),
        type_notif=Notification.Type.SYSTEME,
        lien=lien,
    )


def notifier_verification_rejetee(user, motif=''):
    """Notifie l'utilisateur que sa demande de vérification a été rejetée."""
    lien = '/seller/completer-profil' if user.role == 'SELLER' else '/transporter/completer-profil'
    motif_txt = f' Motif : {motif}' if motif else ''
    envoyer_notification(
        user=user,
        titre='Vérification refusée',
        message=(
            f'Votre demande de vérification a été refusée par l\'équipe AgroSaaNuu.{motif_txt} '
            f'Veuillez compléter vos documents et soumettre une nouvelle demande.'
        ),
        type_notif=Notification.Type.SYSTEME,
        lien=lien,
        data={'motif': motif},
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