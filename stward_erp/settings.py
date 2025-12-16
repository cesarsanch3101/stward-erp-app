import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD CRÍTICA ---
# En producción, SECRET_KEY debe venir de .env
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-prod-key-stward-erp')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.localhost').split(',')

# --- APLICACIONES (ARQUITECTURA MULTI-TENANT) ---
# SHARED_APPS: Tablas que viven en el esquema 'public' (Usuarios globales, Clientes SaaS)
SHARED_APPS = [
    'django_tenants',  # OBLIGATORIO: Debe ser la primera
    'tenants',         # Gestión de inquilinos (Empresas/Dominios)
    'users',           # Usuarios globales y autenticación
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist', # Para logout seguro
    'corsheaders',
    'drf_spectacular', # Documentación API
]

# TENANT_APPS: Tablas que se crean en CADA esquema de cliente (tesla, cocacola, etc.)
TENANT_APPS = [
    #'django.contrib.auth',  Necesario para permisos locales
    'django.contrib.contenttypes',
    'django.contrib.messages',
    # --- APPS DE NEGOCIO STWARD ---
    'hr',
    'inventory',
    'purchasing',
    'sales',
    'treasury',
    'accounting',
    'reports',
    # 'ai_core', # Descomentar cuando creemos la app separada, por ahora está en inventory
]

# INSTALLED_APPS final combina ambas listas
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    # 1. CORS PRIMERO: Para que responda a OPTIONS antes de buscar inquilinos
    'corsheaders.middleware.CorsMiddleware', 
    
    # 2. Tenants Segundo: Ahora sí, resolvemos el esquema
    'django_tenants.middleware.main.TenantMainMiddleware', 
    
    # 3. Resto de Middlewares estándar
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'stward_erp.urls'

# Configuración del modelo de Inquilinos
TENANT_MODEL = "tenants.Company"
TENANT_DOMAIN_MODEL = "tenants.Domain"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'stward_erp.wsgi.application'

# --- BASE DE DATOS (POSTGRESQL + DOCKER) ---
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': os.getenv('DB_NAME', 'stward_db'),
        'USER': os.getenv('DB_USER', 'stward_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'stward_password'),
        'HOST': os.getenv('DB_HOST', 'db'), # Nombre del servicio en docker-compose
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Router de base de datos para separar inquilinos
DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)

# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- LOCALIZACIÓN (CUMPLIMIENTO PANAMÁ) ---
LANGUAGE_CODE = 'es-pa'
TIME_ZONE = 'America/Panama'
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS ---
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- DRF & SEGURIDAD JWT ---
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # Usamos NUESTRA clase personalizada primero
        'users.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DATETIME_FORMAT': "%d/%m/%Y %H:%M:%S",
    'DATE_FORMAT': "%d/%m/%Y",
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), # Aumentamos tiempo para desarrollo
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    
    # --- CONFIGURACIÓN DE COOKIES ---
    'AUTH_COOKIE': 'access_token',          # Nombre de la cookie de acceso
    'AUTH_COOKIE_REFRESH': 'refresh_token', # Nombre de la cookie de refresco
    'AUTH_COOKIE_SECURE': not DEBUG,        # False en dev (http), True en prod (https)
    'AUTH_COOKIE_HTTP_ONLY': True,          # JavaScript no la ve (Seguridad)
    'AUTH_COOKIE_PATH': '/',                # Disponible en todo el sitio
    'AUTH_COOKIE_SAMESITE': 'Lax',          # Protección CSRF básica
}

# --- DOCUMENTACIÓN API ---
SPECTACULAR_SETTINGS = {
    'TITLE': 'Stward ERP API',
    'DESCRIPTION': 'API Empresarial Multi-Tenant (SaaS)',
    'VERSION': '1.0.0',
}

# --- CORS (FRONTEND ACCESS) ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://172.16.1.18:5173",
    "http://tesla.localhost:5173", # <--- ¡AGREGADO!
]
CORS_ALLOW_CREDENTIALS = True # Necesario para enviar cookies

# --- CELERY & REDIS (TAREAS ASÍNCRONAS & IA) ---
CELERY_BROKER_URL = os.getenv("CELERY_BROKER", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_BACKEND", "redis://redis:6379/0")
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE