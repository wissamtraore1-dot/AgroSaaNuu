import os
from pathlib import Path
import environ

# ===== CHEMINS =====
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# ===== SÉCURITÉ =====
SECRET_KEY    = env('SECRET_KEY')
DEBUG         = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# ===== APPLICATIONS =====
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'phonenumber_field',
    # Tâches asynchrones
    'django_celery_beat',
    'django_celery_results',
    # Stockage cloud
    'cloudinary',
    'cloudinary_storage',
]

LOCAL_APPS = [
    'apps.common.apps.CommonConfig',
    'apps.authentication.apps.AuthenticationConfig',
    'apps.products.apps.ProductsConfig',
    'apps.orders.apps.OrdersConfig',
    'apps.wallet.apps.WalletConfig',
'apps.transport.apps.TransportConfig',
    'apps.notifications.apps.NotificationsConfig',
    'apps.news.apps.NewsConfig',
    'apps.market_prices.apps.MarketPricesConfig',
    'apps.cart.apps.CartConfig',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ===== MIDDLEWARE =====
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ===== BASE DE DONNÉES =====
DATABASES = {
    'default': env.db('DATABASE_URL', default='sqlite:///db.sqlite3')
}

# ===== AUTH USER =====
AUTH_USER_MODEL = 'authentication.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===== INTERNATIONALISATION =====
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE     = 'Africa/Porto-Novo'
USE_I18N      = True
USE_TZ        = True

# ===== FICHIERS =====
STATIC_URL   = '/static/'
STATIC_ROOT  = BASE_DIR / 'staticfiles'
MEDIA_URL    = '/media/'
MEDIA_ROOT   = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===== PHONENUMBER =====
PHONENUMBER_DEFAULT_REGION = 'BJ'

# ===== REST FRAMEWORK =====
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'apps.common.pagination.StandardPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'EXCEPTION_HANDLER': 'apps.common.exceptions.custom_exception_handler',
}

# ===== JWT =====
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES':        ('Bearer',),
}

# ===== CORS =====
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
])
CORS_ALLOW_CREDENTIALS = True

# ===== SPECTACULAR =====
SPECTACULAR_SETTINGS = {
    'TITLE':       'AgroConnect API',
    'DESCRIPTION': 'API AgroConnect — Bénin',
    'VERSION':     '1.0.0',
}

# ===== CONSTANTES MÉTIER =====
COMMISSION_RATE      = 0.02
MTN_FRAIS_RATE       = 0.01
MOOV_FRAIS_RATE      = 0.01
CELTIS_FRAIS_RATE    = 0.005
# ═══════════════════════════════════════════════════════════════════════════════
# APIS EXTERNES GRATUITS
# ═══════════════════════════════════════════════════════════════════════════════

# ── Africa's Talking (SMS — Sandbox gratuit) ──────────────────────────────────
# Créer un compte sur https://africastalking.com/ → Sandbox gratuit
# Passer en LIVE quand prêt (acheter des crédits SMS)
AFRICASTALKING_USERNAME = env('AFRICASTALKING_USERNAME', default='sandbox')
AFRICASTALKING_API_KEY  = env('AFRICASTALKING_API_KEY',  default='')
AFRICASTALKING_SANDBOX  = env.bool('AFRICASTALKING_SANDBOX', default=True)

# ── FedaPay (Mobile Money Bénin — MTN, Moov, Celtis) ─────────────────────────
# Dashboard : https://app.fedapay.com → API Keys
FEDAPAY_PUBLIC_KEY = env('FEDAPAY_PUBLIC_KEY', default='')
FEDAPAY_SECRET_KEY = env('FEDAPAY_SECRET_KEY', default='')
FEDAPAY_SANDBOX    = env.bool('FEDAPAY_SANDBOX', default=False)

# URL publique du backend (mettre l'URL Render en production)
SITE_URL = env('SITE_URL', default='http://localhost:8000')

# ── Twilio (SMS fallback — si Africa's Talking indisponible) ──────────────────
TWILIO_ACCOUNT_SID  = env('TWILIO_ACCOUNT_SID',  default='')
TWILIO_AUTH_TOKEN   = env('TWILIO_AUTH_TOKEN',   default='')
TWILIO_PHONE_NUMBER = env('TWILIO_PHONE_NUMBER', default='')

# ── Cloudinary (stockage images — 25 GB gratuit) ─────────────────────────────
# Créer un compte sur https://cloudinary.com/ → Plan gratuit
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY':    env('CLOUDINARY_API_KEY',    default=''),
    'API_SECRET': env('CLOUDINARY_API_SECRET', default=''),
}
# Activer Cloudinary seulement si configuré
if env('CLOUDINARY_CLOUD_NAME', default=''):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# ── Cache (LocMemCache par défaut — Redis en production) ──────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# ── Celery (tâches asynchrones — avec Redis) ──────────────────────────────────
# Redis doit tourner en local : https://redis.io/
# Windows : utiliser Redis via WSL ou Docker
CELERY_BROKER_URL        = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND    = 'django-db'   # Stockage résultats dans Django DB
CELERY_CACHE_BACKEND     = 'default'
CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE          = 'Africa/Porto-Novo'
CELERY_BEAT_SCHEDULER    = 'django_celery_beat.schedulers:DatabaseScheduler'

# ── Email (Gmail SMTP — gratuit) ──────────────────────────────────────────────
# Activer dans Gmail : Paramètres → Sécurité → Mots de passe des applications
EMAIL_BACKEND       = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST          = env('EMAIL_HOST',    default='smtp.gmail.com')
EMAIL_PORT          = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS       = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER     = env('EMAIL_HOST_USER',     default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL  = env('DEFAULT_FROM_EMAIL',  default='AgroSaaNuu <noreply@agrosaanuu.com>')

# ═══════════════════════════════════════════════════════════════════════════════
# SQLITE — ACTIVER CONTRAINTES DE CLÉS ÉTRANGÈRES
# ═══════════════════════════════════════════════════════════════════════════════
# SQLite désactive les contraintes FK par défaut. Ce signal les réactive.
# En production (PostgreSQL), c'est activé nativement.
from django.db.backends.signals import connection_created
from django.dispatch import receiver

@receiver(connection_created)
def activate_foreign_keys(sender, connection, **kwargs):
    """Active les contraintes de clés étrangères pour SQLite."""
    if connection.settings_dict['ENGINE'] == 'django.db.backends.sqlite3':
        cursor = connection.cursor()
        cursor.execute('PRAGMA foreign_keys=ON;')