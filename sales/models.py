from django.db import models
from django.conf import settings
from inventory.models import Product
from django.core.exceptions import ValidationError
from .utils_panama import calculate_dv_panama, calculate_tax_amount

class Customer(models.Model):
    TAXPAYER_TYPES = [
        ('Natural', 'Persona Natural'),
        ('Juridico', 'Persona Jurídica'),
        ('Exento', 'Exento / Gobierno'),
        ('Extranjero', 'Extranjero'),
    ]

    name = models.CharField(max_length=200, verbose_name="Razón Social / Nombre")
    ruc = models.CharField(max_length=20, unique=True, verbose_name="RUC", help_text="Registro Único de Contribuyente")
    dv = models.CharField(max_length=2, verbose_name="DV", help_text="Dígito Verificador")
    taxpayer_type = models.CharField(max_length=15, choices=TAXPAYER_TYPES, default='Juridico')
    
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True, verbose_name="Dirección Física")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validar RUC antes de guardar (usando la lógica flexible)
        is_valid, msg = calculate_dv_panama(self.ruc)
        if not is_valid and self.taxpayer_type != 'Extranjero':
            raise ValidationError({'ruc': msg})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} | RUC: {self.ruc}-{self.dv}"

class SalesOrder(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Borrador'),
        ('Confirmed', 'Confirmado'),
        ('Shipped', 'Enviado'),
        ('Invoiced', 'Facturado'),
        ('Cancelled', 'Anulado'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateField(auto_now_add=True)
    shipping_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_sales_orders')
    
    # --- TOTALES FINANCIEROS ---
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="ITBMS Total")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"SO-{self.id} ({self.customer.name})"

    def calculate_totals(self):
        """
        Recalcula subtotal, impuestos y total basado en las líneas.
        """
        # CORRECCIÓN: Usamos 'item.total_price' en lugar de 'item.total_line'
        self.subtotal = sum(item.total_price for item in self.items.all())
        self.tax_amount = sum(item.tax_line for item in self.items.all())
        self.total_amount = self.subtotal + self.tax_amount
        self.save()

class SOItem(models.Model):
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='sales_order_items')
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Impuesto (7% por defecto)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.07, help_text="0.07 para 7%")

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    # CORRECCIÓN: Renombramos la propiedad a 'total_price' para que coincida con el Serializer
    @property
    def total_price(self):
        return self.quantity * self.unit_price

    @property
    def tax_line(self):
        # Actualizamos la referencia interna también
        return calculate_tax_amount(self.total_price, float(self.tax_rate))