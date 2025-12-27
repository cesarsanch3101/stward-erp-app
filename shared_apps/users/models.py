from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Modelo de Usuario Personalizado para Stward ERP.
    Centraliza la autenticación para todos los inquilinos (Shared App).
    """
    
    # Identificación Global (para sincronización futura entre barcos/tierra)
    global_id = models.UUIDField(null=True, blank=True, unique=True, help_text="ID único para sincronización offline.")

    # Roles de Alto Nivel
    is_maritime_crew = models.BooleanField(
        default=False, 
        verbose_name=_("Es Tripulante"),
        help_text=_("Marca si el usuario pertenece a la nómina marítima (Gente de Mar).")
    )
    
    # Firma Digital (Simple referencia o PIN para aprobaciones)
    signature_pin = models.CharField(max_length=6, blank=True, null=True, help_text="PIN para firma electrónica simple.")

    class Meta:
        db_table = 'auth_user' # Mantenemos nombre estándar para facilitar compatibilidad
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')

    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"