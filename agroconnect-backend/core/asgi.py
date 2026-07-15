"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# Pointait vers core.settings (fichier plat, DEBUG=True, SECRET_KEY en dur).
# Corrigé pour utiliser le package sécurisé, identique à manage.py.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')

application = get_asgi_application()
