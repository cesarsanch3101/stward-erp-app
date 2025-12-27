from django.contrib import admin
from .models import Company, Domain

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para el modelo Company.
    list_display define las columnas que se mostrarán en la lista de empresas.
    """
    list_display = ('name', 'schema_name', 'created_on')

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para el modelo Domain.
    """
    list_display = ('domain', 'tenant', 'is_primary')