from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.exceptions import ValidationError

class Supplier(models.Model):
    SUPPLIER_TYPES = [
        ('Local', 'Local (Panamá)'),
        ('Foreign', 'Extranjero (Internacional)'),
    ]

    name = models.CharField(max_length=200, unique=True, verbose_name="Razón Social")
    supplier_type = models.CharField(max_length=10, choices=SUPPLIER_TYPES, default='Local')
    
    # Datos Fiscales
    ruc = models.CharField(max_length=20, blank=True, verbose_name="RUC/Tax ID")
    dv = models.CharField(max_length=2, blank=True, verbose_name="DV")
    
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_supplier_type_display()})"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Borrador'),
        ('Submitted', 'Confirmado'),
        ('Received', 'Recibido (Parcial/Total)'),
        ('Completed', 'Cerrado/Pagado'),
        ('Cancelled', 'Anulado'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # --- Motor Fiscal (Retenciones) ---
    apply_retention = models.BooleanField(default=True, help_text="Aplica retención según tipo de proveedor (50% Local / 100% Extranjero)")
    is_gross_up = models.BooleanField(default=False, verbose_name="Grossing Up", help_text="Solo Extranjeros: La empresa asume el impuesto. El precio unitario se considera neto.")

    # --- Totales Financieros ---
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="ITBMS Total")
    retention_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="ITBMS Retenido")
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Total Factura")
    payable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Total a Pagar (Neto)")

    def calculate_totals(self):
        """
        Calcula impuestos y retenciones según reglas DGI Panamá.
        """
        self.subtotal = Decimal(0)
        self.tax_amount = Decimal(0)
        self.retention_amount = Decimal(0)

        for item in self.items.all():
            line_total = item.quantity * item.unit_price
            self.subtotal += line_total
            
            # Cálculo de Impuesto
            if item.tax_rate > 0:
                tax = line_total * item.tax_rate
                
                # Lógica de Grossing Up (Impuesto Asumido)
                if self.supplier.supplier_type == 'Foreign' and self.is_gross_up:
                    # Si es Gross Up, el impuesto se suma "por encima" para efectos contables,
                    # pero el proveedor recibe el valor original.
                    pass 
                
                self.tax_amount += tax

        self.total_amount = self.subtotal + self.tax_amount

        # Cálculo de Retención
        if self.apply_retention and self.tax_amount > 0:
            if self.supplier.supplier_type == 'Local':
                # Agente de Retención Local: Retiene 50% del ITBMS
                # (Asumiendo que la empresa tenant es agente designado)
                self.retention_amount = self.tax_amount * Decimal('0.50')
            elif self.supplier.supplier_type == 'Foreign':
                # Parámetro 4: Pagos al Exterior -> Retiene 100% del ITBMS
                self.retention_amount = self.tax_amount

        # Lo que realmente sale de caja al proveedor
        self.payable_amount = self.total_amount - self.retention_amount
        
        self.save()

    def __str__(self):
        return f"PO-{self.id} | {self.supplier.name}"

class POItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    # Usamos string reference para evitar importación circular
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, related_name='purchase_order_items')
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Impuestos por línea
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.07, help_text="0.00 para Exento, 0.07 para ITBMS estándar")

    @property
    def total_line(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"