import random
import string
from django.conf import settings

def generer_reference(prefix='AGR', longueur=10):
    chars = string.ascii_uppercase + string.digits
    code  = ''.join(random.choices(chars, k=longueur))
    return f"{prefix}-{code}"

def calculer_frais(montant, mode):
    taux = {
        'MTN':    settings.MTN_FRAIS_RATE,
        'MOOV':   settings.MOOV_FRAIS_RATE,
        'CELTIS': settings.CELTIS_FRAIS_RATE,
        'BANK':   0,
    }
    return round(montant * taux.get(mode, 0))

def calculer_commission(montant):
    return round(montant * settings.COMMISSION_RATE)

def calculer_points(montant_fcfa):
    return int(montant_fcfa // 1000) * settings.POINTS_PER_1000_FCFA