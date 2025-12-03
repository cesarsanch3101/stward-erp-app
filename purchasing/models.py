from django.db import models
from django.conf import settings # To link to the User model
from inventory.models import Product # To link purchase items to products

class Supplier(models.Model):
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    # Basic PO statuses
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    order_date = models.DateField(auto_now_add=True) # Automatically set when created
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    # Who created this order? Links to the user who placed it.
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_purchase_orders')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00) # Calculated later

    def __str__(self):
        return f"PO-{self.id} ({self.supplier.name})"

    # We'll add methods to calculate total later

class POItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='purchase_order_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # We can add taxes, discounts later

    def __str__(self):
        return f"{self.quantity} x {self.product.name} @ {self.unit_price}"

    @property # Makes this act like a field
    def total_price(self):
        return self.quantity * self.unit_price