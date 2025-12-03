from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Account(models.Model):
    """
    Representa una cuenta en el Plan de Cuentas (Chart of Accounts).
    Es una estructura de árbol (una cuenta puede tener una cuenta 'padre').
    """
    ACCOUNT_TYPE_CHOICES = [
        ('ASSET', 'Activo'),
        ('LIABILITY', 'Pasivo'),
        ('EQUITY', 'Patrimonio'),
        ('REVENUE', 'Ingreso'),
        ('EXPENSE', 'Gasto'),
    ]

    name = models.CharField(max_length=100)
    # El código contable (ej: "110-001" para Bancos)
    code = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES)
    # El enlace 'self' permite crear la jerarquía (árbol)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['code'] # Ordena las cuentas por su código


class JournalEntry(models.Model):
    """
    La cabecera de un Asiento Contable (Libro Diario).
    Representa una única transacción.
    """
    date = models.DateField()
    description = models.CharField(max_length=255)
    # Enlace al usuario que creó el asiento
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='journal_entries'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Asiento #{self.id} - {self.date} - {self.description}"

    


class JournalItem(models.Model):
    """
    Una línea (Debe o Haber) dentro de un Asiento Contable.
    """
    journal_entry = models.ForeignKey(
        JournalEntry, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    account = models.ForeignKey(
        Account, 
        on_delete=models.PROTECT, # No permitir borrar cuentas con movimientos
        related_name='journal_items'
    )
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        if self.debit > 0:
            return f"{self.account.name} | Debe: {self.debit}"
        return f"{self.account.name} | Haber: {self.credit}"

    # Validación para asegurar que una línea no sea Débito Y Crédito a la vez
    def clean(self):
        if self.debit > 0 and self.credit > 0:
            raise ValidationError("Una línea de asiento no puede tener Débito y Crédito a la vez.")
        if self.debit == 0 and self.credit == 0:
            raise ValidationError("Una línea de asiento debe tener un valor de Débito o Crédito.")