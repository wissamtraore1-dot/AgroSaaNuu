# apps/orders/fedapay_service.py
# Intégration FedaPay — Mobile Money Bénin (MTN, Moov, Celtis)
# API REST officielle : https://docs.fedapay.com/
# Sandbox gratuit : https://app.fedapay.com/

import requests
from django.conf import settings

SANDBOX_URL = 'https://sandbox-api.fedapay.com/v1'
LIVE_URL    = 'https://api.fedapay.com/v1'


def _base_url():
    return SANDBOX_URL if settings.FEDAPAY_SANDBOX else LIVE_URL


def _headers():
    return {
        'Authorization': f'Bearer {settings.FEDAPAY_SECRET_KEY}',
        'Content-Type':  'application/json',
    }


def creer_transaction(commande):
    """
    Crée une transaction FedaPay. Le paiement lui-même est ensuite géré côté
    frontend par le widget Checkout.js (l'acheteur y choisit son opérateur
    Mobile Money et son numéro), pas par cet appel serveur.

    Returns:
        dict: { success, transaction_id } ou { success: False, message }
    """
    if not settings.FEDAPAY_SECRET_KEY:
        return {'success': False, 'message': 'FEDAPAY_SECRET_KEY non configuré dans .env'}

    payload = {
        'description':  f'Commande AgroSaaNuu {commande.reference}',
        'amount':       int(commande.montant_total),
        'currency':     {'iso': 'XOF'},
        'callback_url': f'{settings.SITE_URL}/api/v1/orders/payment/webhook/',
        'customer': {
            'firstname': commande.acheteur.prenom or 'Client',
            'lastname':  commande.acheteur.nom    or 'Inconnu',
            'email':     commande.acheteur.email,
        },
    }

    try:
        resp = requests.post(
            f'{_base_url()}/transactions',
            json=payload,
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        data           = resp.json()
        transaction    = data.get('v1/transaction', data)
        transaction_id = transaction.get('id')

        if not transaction_id:
            return {'success': False, 'message': f'Réponse FedaPay inattendue : {data}'}

        return {'success': True, 'transaction_id': transaction_id}

    except requests.exceptions.RequestException as e:
        return {'success': False, 'message': f'Erreur connexion FedaPay : {e}'}


def verifier_statut_paiement(transaction_id):
    """
    Vérifie le statut d'une transaction FedaPay.

    Returns:
        dict: { success, statut, montant }
    """
    if not settings.FEDAPAY_SECRET_KEY:
        return {'success': False, 'message': 'FEDAPAY_SECRET_KEY non configuré'}

    try:
        resp = requests.get(
            f'{_base_url()}/transactions/{transaction_id}',
            headers=_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        data        = resp.json()
        transaction = data.get('v1/transaction', data)
        statut_map  = {
            'approved':  'EFFECTUE',
            'pending':   'EN_ATTENTE',
            'declined':  'ECHOUE',
            'cancelled': 'ECHOUE',
            'refunded':  'REMBOURSÉ',
        }
        return {
            'success': True,
            'statut':  statut_map.get(transaction.get('status', ''), 'EN_ATTENTE'),
            'montant': transaction.get('amount', 0),
        }
    except requests.exceptions.RequestException as e:
        return {'success': False, 'message': str(e)}
