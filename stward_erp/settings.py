import os
from pathlib import Path
from datetime import timedelta 
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Secretos y Hosts ---
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')

# --- Aplicaciones ---
SHARED_APPS = [
    'django_tenants',
    'drf_spectacular',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'tenants',
]
TENANT_APPS = [
    'django.contrib.messages',
    'users', # Esta es la app de la creacion de usuarios
    'hr', # Esta es la app de recurso humano 
    'inventory', # Esta es la app de inventario 
    'purchasing', # Esta es la app de compras
    'sales', # Esta es la app de ventas
    'treasury', # Esta es la app de tesoreria 
    'accounting', # Esta es la app de contabilidad
    'reports', # Esta es la app para reportes
]
INSTALLED_APPS = list(SHARED_APPS) + list(TENANT_APPS)

# --- Middleware ---
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'stward_erp.urls'

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

# --- Base de Datos ---
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}
DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)

# --- Validadores de Contraseña ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# --- Internacionalización ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- Archivos Estáticos ---
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- CONFIGURACIÓN DE DJANGO-TENANTS ---
TENANT_MODEL = "tenants.Company" 
TENANT_DOMAIN_MODEL = "tenants.Domain"

# --- CONFIGURACIÓN DE CORS ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# --- CONFIGURACIÓN DE DRF Y SWAGGER ---
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Stward ERP API',
    'DESCRIPTION': 'Documentación de la API para el proyecto Stward ERP',
    'VERSION': '1.0.0',
}

# --- ¡LA CONFIGURACIÓN DE JWT QUE FALTABA! ---
SIMPLE_JWT = {
    'SIGNING_KEY': SECRET_KEY, # Le dice a JWT qué llave usar
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), # Aumentamos a 60 min
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}