# apps/orders/fedapay_service.py
# Intégration FedaPay — Mobile Money Bénin (MTN, Moov, Celtis)
# API REST officielle : https://docs.fedapay.com/
# Sandbox gratuit : https://app.fedapay.com/

import requests
from django.conf import settings

SANDBOX_URL = 'https://sandbox-api.fedapay.com/v1'
LIVE_URL    = 'https://api.fedapay.com/v1'

MODE_TO_FEDAPAY = {
    'MTN':    'mtn',
    'MOOV':   'moov',
    'CELTIS': 'celtis',
}


def _base_url():
    return SANDBOX_URL if settings.FEDAPAY_SANDBOX else LIVE_URL


def _headers():
    return {
        'Authorization': f'Bearer {settings.FEDAPAY_SECRET_KEY}',
        'Content-Type':  'application/json',
    }


def initier_paiement_mobile(commande, numero_telephone):
    """
    Crée une transaction FedaPay et déclenche le paiement Mobile Money.

    Returns:
        dict: { success, transaction_id, payment_url, token }
    """
    if not settings.FEDAPAY_SECRET_KEY:
        return {'success': False, 'message': 'FEDAPAY_SECRET_KEY non configuré dans .env'}

    mode    = commande.mode_paiement
    methode = MODE_TO_FEDAPAY.get(mode, 'mtn')
    tel     = str(numero_telephone or commande.telephone_livraison or '')

    # 1. Créer la transaction
    payload = {
        'description':   f'Commande AgroSaaNuu {commande.reference}',
        'amount':        int(commande.montant_total),
        'currency':      {'iso': 'XOF'},
        'callback_url':  f'{settings.SITE_URL}/api/v1/orders/payment/callback/',
        'customer': {
            'firstname': commande.acheteur.prenom or 'Client',
            'lastname':  commande.acheteur.nom    or 'Inconnu',
            'email':     commande.acheteur.email,
            'phone_number': {
                'number':  tel,
                'country': 'BJ',
            },
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

    except requests.exceptions.RequestException as e:
        return {'success': False, 'message': f'Erreur connexion FedaPay : {e}'}

    # 2. Déclencher le paiement Mobile Money
    pay_payload = {
        'currency': {'iso': 'XOF'},
        'mode':     methode,
        'customer': {
            'phone_number': {
                'number':  tel,
                'country': 'BJ',
            },
        },
    }

    try:
        pay_resp = requests.post(
            f'{_base_url()}/transactions/{transaction_id}/pay',
            json=pay_payload,
            headers=_headers(),
            timeout=15,
        )
        pay_resp.raise_for_status()
        pay_data = pay_resp.json()

    except requests.exceptions.RequestException as e:
        # Transaction créée mais paiement non déclenché — on retourne le transaction_id quand même
        return {
            'success':        True,
            'transaction_id': str(transaction_id),
            'payment_url':    transaction.get('url', ''),
            'token':          None,
            'reference':      str(transaction_id),
            'warning':        f'Paiement non déclenché : {e}',
        }

    return {
        'success':        True,
        'transaction_id': str(transaction_id),
        'payment_url':    transaction.get('url', ''),
        'token':          pay_data,
        'reference':      str(transaction_id),
    }


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
