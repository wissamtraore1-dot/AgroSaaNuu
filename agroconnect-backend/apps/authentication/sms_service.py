# apps/authentication/sms_service.py
# Service SMS unifié — Africa's Talking (principal) + Twilio (fallback)
# Africa's Talking Sandbox GRATUIT : https://africastalking.com/
# Bien meilleur pour l'Afrique de l'Ouest que Twilio (moins cher, meilleure couverture)

import random
from django.conf import settings


def generate_otp():
    """Génère un code OTP à 6 chiffres."""
    return str(random.randint(100000, 999999))


def send_sms_africastalking(phone_number: str, message: str) -> tuple[bool, str]:
    """
    Envoie un SMS via Africa's Talking.
    Sandbox : aucun SMS réel envoyé, logs dans le dashboard AT.
    """
    try:
        import africastalking
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY,
        )
        sms = africastalking.SMS
        response = sms.send(message, [phone_number])
        recipients = response.get('SMSMessageData', {}).get('Recipients', [])
        if recipients and recipients[0].get('status') == 'Success':
            return True, recipients[0].get('messageId', '')
        return False, str(response)
    except Exception as e:
        return False, str(e)


def send_sms_twilio(phone_number: str, message: str) -> tuple[bool, str]:
    """Fallback Twilio si Africa's Talking non configuré."""
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number,
        )
        return True, msg.sid
    except Exception as e:
        return False, str(e)


def send_otp_sms(phone_number: str, otp_code: str) -> tuple[bool, str]:
    """
    Envoie le code OTP par SMS.
    Essaie Africa's Talking en premier, puis Twilio en fallback.
    En DEV (sandbox=True) : affiche dans les logs, pas de SMS réel.
    """
    message = f"Votre code AgroSaaNuu : {otp_code}. Valable 5 minutes. Ne le partagez pas."

    # 1. Africa's Talking (priorité — meilleur pour le Bénin)
    if settings.AFRICASTALKING_API_KEY:
        ok, result = send_sms_africastalking(phone_number, message)
        if ok:
            return True, result
        print(f"[AT-SMS] Échec: {result}")

    # 2. Twilio (fallback)
    if settings.TWILIO_ACCOUNT_SID:
        ok, result = send_sms_twilio(phone_number, message)
        if ok:
            return True, result
        print(f"[TWILIO-SMS] Échec: {result}")

    # 3. Mode développement : log en console
    print(f"[DEV-SMS] Code OTP pour {phone_number}: {otp_code}")
    return False, otp_code  # Retourne le code pour affichage en dev
