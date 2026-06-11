from .base import *

DEBUG         = True
ALLOWED_HOSTS = ['*']

# En dev, accepter toutes les origines (frontend Vite peut tourner sur 5173/5174/etc.)
CORS_ALLOW_ALL_ORIGINS  = True
CORS_ALLOW_CREDENTIALS  = True

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache désactivé en dev — chaque requête relit les RSS (pratique pour tester)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}