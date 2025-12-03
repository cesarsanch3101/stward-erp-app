from django.db import models
from django.conf import settings # Para enlazar al usuario
from inventory.models import Product # Para enlazar los items al producto

class Customer(models.Model):
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    # Podríamos añadir RUC/ID fiscal, términos de pago, etc. más adelante

    def __str__(self):
        return self.name

class SalesOrder(models.Model):
    # Estados básicos de una orden de venta
    STATUS_CHOICES = [
        ('Draft', 'Borrador'),
        ('Confirmed', 'Confirmado'),
        ('Shipped', 'Enviado'),
        ('Invoiced', 'Facturado'),
        ('Completed', 'Completado'),
        ('Cancelled', 'Cancelado'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateField(auto_now_add=True)
    shipping_date = models.DateField(null=True, blank=True) # Fecha estimada de envío
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    # Quién creó esta orden (vendedor)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_sales_orders')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # Se calculará después

    def __str__(self):
        return f"SO-{self.id} ({self.customer.name})"

    # Añadiremos métodos para calcular el total después

class SOItem(models.Model):
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='sales_order_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Precio al que se vendió
    # Podríamos añadir impuestos, descuentos, etc. después

    def __str__(self):
        return f"{self.quantity} x {self.product.name} @ {self.unit_price}"

    @property
    def total_price(self):
        return self.quantity * self.unit_price