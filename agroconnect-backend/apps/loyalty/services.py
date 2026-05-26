from apps.common.utils import calculer_points
from .models import PointsFidelite, HistoriquePoints


def obtenir_ou_creer_points(user):
    pts, _ = PointsFidelite.objects.get_or_create(user=user)
    return pts


def ajouter_points(user, montant_fcfa, commande_id=None):
    points = calculer_points(montant_fcfa)
    if points <= 0:
        return None
    pts = obtenir_ou_creer_points(user)
    pts.points_actuels += points
    pts.points_totaux  += points
    pts.save(update_fields=['points_actuels', 'points_totaux'])
    pts.mettre_a_jour_niveau()

    HistoriquePoints.objects.create(
        points_fidelite=pts,
        type=HistoriquePoints.Type.GAIN,
        points=points,
        description=f'Achat — {montant_fcfa:,.0f} FCFA',
        commande_id=commande_id,
    )
    return pts


def utiliser_points(user, points_a_utiliser):
    pts = obtenir_ou_creer_points(user)
    if pts.points_actuels < points_a_utiliser:
        raise ValueError('Points insuffisants.')
    pts.points_actuels  -= points_a_utiliser
    pts.points_utilises += points_a_utiliser
    pts.save(update_fields=['points_actuels', 'points_utilises'])

    HistoriquePoints.objects.create(
        points_fidelite=pts,
        type=HistoriquePoints.Type.UTILISATION,
        points=-points_a_utiliser,
        description='Utilisation de points fidélité',
    )
    return pts