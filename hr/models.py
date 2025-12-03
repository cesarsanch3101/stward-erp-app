from django.db import models
from django.conf import settings

class Employee(models.Model):
    # Enlazamos cada empleado a una única cuenta de usuario de Django.
    # Esto es opcional; un empleado podría no tener acceso al sistema.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Si se borra el usuario, el perfil de empleado no se borra.
        null=True, 
        blank=True,
        related_name='employee_profile'
    )

    # Datos básicos del empleado
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True) # El email debe ser único
    phone_number = models.CharField(max_length=20, blank=True)
    position = models.CharField(max_length=100, blank=True)
    hire_date = models.DateField()

    def __str__(self):
        # Esto define cómo se verá el objeto en el panel de admin
        return f"{self.first_name} {self.last_name}"