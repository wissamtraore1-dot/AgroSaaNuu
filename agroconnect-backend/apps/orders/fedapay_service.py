# apps/orders/fedapay_service.py
# Intégration FedaPay — Mobile Money Bénin (MTN, Moov, Celtis)
# Sandbox GRATUIT : https://fedapay.com/
# Documentation : https://docs.fedapay.com/

import fedapay
from fedapay import Transaction, Customer
from django.conf import settings


def _init_fedapay():
    """Configure le SDK FedaPay avec la clé API."""
    fedapay.api_key = settings.FEDAPAY_SECRET_KEY
    fedapay.environment = 'sandbox' if settings.FEDAPAY_SANDBOX else 'live'


MODE_TO_FEDAPAY = {
    'MTN':    'mtn',
    'MOOV':   'moov',
    'CELTIS': 'celtis',
}


def initier_paiement_mobile(commande, numero_telephone):
    """
    Crée une transaction FedaPay et retourne l'URL de paiement.

    Returns:
        dict: { success, transaction_id, payment_url, token }
    """
    _init_fedapay()

    mode    = commande.mode_paiement
    methode = MODE_TO_FEDAPAY.get(mode, 'mtn')

    try:
        transaction = Transaction.create({
            'description': f'Commande AgroSaaNuu {commande.reference}',
            'amount':      int(commande.montant_total),
            'currency':    {'iso': 'XOF'},
            'callback_url': f'{settings.SITE_URL}/api/v1/orders/payment/callback/',
            'customer': {
                'firstname': commande.acheteur.prenom or 'Client',
                'lastname':  commande.acheteur.nom,
                'email':     commande.acheteur.email,
                'phone_number': {
                    'number':  str(numero_telephone or commande.telephone_livraison),
                    'country': 'BJ',
                },
            },
        })

        # Initier le paiement Mobile Money
        token = transaction.sendNow(methode, str(numero_telephone or commande.telephone_livraison))

        return {
            'success':        True,
            'transaction_id': transaction.id,
            'payment_url':    getattr(transaction, 'url', ''),
            'token':          token,
            'reference':      str(transaction.id),
        }

    except Exception as e:
        return {
            'success': False,
            'message': str(e),
        }


def verifier_statut_paiement(transaction_id):
    """
    Vérifie le statut d'une transaction FedaPay.

    Returns:
        dict: { success, statut, montant }
    """
    _init_fedapay()
    try:
        transaction = Transaction.retrieve(transaction_id)
        statut_map  = {
            'approved':  'EFFECTUE',
            'pending':   'EN_ATTENTE',
            'declined':  'ECHOUE',
            'cancelled': 'ECHOUE',
            'refunded':  'REMBOURSÉ',
        }
        return {
            'success': True,
            'statut':  statut_map.get(transaction.status, 'EN_ATTENTE'),
            'montant': transaction.amount,
        }
    except Exception as e:
        return {'success': False, 'message': str(e)}
