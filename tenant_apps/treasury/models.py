from django.db import models, transaction # ¡Importamos transaction!
from django.conf import settings
from sales.models import Customer
from purchasing.models import Supplier
from django.core.exceptions import ValidationError # Para validaciones

class BankAccount(models.Model):
    name = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50, unique=True)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    # Hacemos que el saldo actual se inicialice con el saldo inicial
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} ({self.bank_name})"

    # Al guardar una cuenta por primera vez, igualamos el saldo actual al inicial
    def save(self, *args, **kwargs):
        if not self.pk: # Si es la primera vez que se guarda
            self.current_balance = self.initial_balance
        super().save(*args, **kwargs)

class CashRegister(models.Model):
    name = models.CharField(max_length=100, unique=True)
    initial_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return self.name

    # Igual que con la cuenta bancaria
    def save(self, *args, **kwargs):
        if not self.pk:
            self.current_balance = self.initial_balance
        super().save(*args, **kwargs)

class TreasuryMovement(models.Model):
    TYPE_CHOICES = [
        ('Income', 'Ingreso'),
        ('Expense', 'Egreso'),
        ('Transfer', 'Transferencia'),
    ]

    date = models.DateField(auto_now_add=True)
    movement_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)

    from_bank_account = models.ForeignKey(BankAccount, on_delete=models.PROTECT, related_name='movements_out', null=True, blank=True)
    from_cash_register = models.ForeignKey(CashRegister, on_delete=models.PROTECT, related_name='movements_out', null=True, blank=True)

    to_bank_account = models.ForeignKey(BankAccount, on_delete=models.PROTECT, related_name='movements_in', null=True, blank=True)
    to_cash_register = models.ForeignKey(CashRegister, on_delete=models.PROTECT, related_name='movements_in', null=True, blank=True)

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')

    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.movement_type} - ${self.amount} on {self.date}"

    # --- ¡INICIA LA LÓGICA DE LA MEJORA! ---

    # Validación para asegurar que los movimientos sean lógicos
    def clean(self):
        super().clean()
        if self.movement_type == 'Income' and not self.to_bank_account and not self.to_cash_register:
            raise ValidationError("Un Ingreso debe tener una cuenta bancaria o caja de destino.")
        if self.movement_type == 'Expense' and not self.from_bank_account and not self.from_cash_register:
            raise ValidationError("Un Egreso debe tener una cuenta bancaria o caja de origen.")
        if self.movement_type == 'Transfer' and (not self.from_bank_account and not self.from_cash_register or not self.to_bank_account and not self.to_cash_register):
            raise ValidationError("Una Transferencia debe tener un origen y un destino.")
        if self.amount <= 0:
            raise ValidationError("El monto debe ser positivo.")

    # Sobrescribimos el método .save()
    def save(self, *args, **kwargs):
        # Nos aseguramos de que el movimiento sea válido antes de intentar guardarlo
        self.clean() 

        # Usamos transaction.atomic para asegurar que todas las operaciones 
        # de base de datos (guardar movimiento Y actualizar saldos)
        # ocurran exitosamente, o ninguna de ellas ocurra.
        # ¡Esto previene la corrupción de datos!

        # Nota: Esta lógica solo maneja la CREACIÓN. Manejar la ACTUALIZACIÓN
        # (que requiere revertir el movimiento antiguo) es mucho más complejo.
        is_new = self.pk is None 

        with transaction.atomic():
            # Primero, guarda el movimiento en sí
            super().save(*args, **kwargs) 

            if is_new: # Solo actualiza saldos si es un movimiento nuevo
                # Lógica de Ingreso
                if self.movement_type == 'Income':
                    if self.to_bank_account:
                        self.to_bank_account.current_balance += self.amount
                        self.to_bank_account.save()
                    elif self.to_cash_register:
                        self.to_cash_register.current_balance += self.amount
                        self.to_cash_register.save()

                # Lógica de Egreso
                elif self.movement_type == 'Expense':
                    if self.from_bank_account:
                        self.from_bank_account.current_balance -= self.amount
                        self.from_bank_account.save()
                    elif self.from_cash_register:
                        self.from_cash_register.current_balance -= self.amount
                        self.from_cash_register.save()

                # Lógica de Transferencia
                elif self.movement_type == 'Transfer':
                    # Resta del origen
                    if self.from_bank_account:
                        self.from_bank_account.current_balance -= self.amount
                        self.from_bank_account.save()
                    elif self.from_cash_register:
                        self.from_cash_register.current_balance -= self.amount
                        self.from_cash_register.save()
                    # Suma al destino
                    if self.to_bank_account:
                        self.to_bank_account.current_balance += self.amount
                        self.to_bank_account.save()
                    elif self.to_cash_register:
                        self.to_cash_register.current_balance += self.amount
                        self.to_cash_register.save()