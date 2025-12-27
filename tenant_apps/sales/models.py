from django.db import models
from django.conf import settings
from decimal import Decimal
from .utils_panama import calculate_dv_panama  # Asegúrate de tener este archivo

class Customer(models.Model):
    TAXPAYER_TYPES = [
        ('Natural', 'Persona Natural'),
        ('Juridico', 'Persona Jurídica'),
        ('Exento', 'Exento / Zona Libre'),
        ('Extranjero', 'Extranjero / Pasaporte'),
    ]

    name = models.CharField(max_length=200, verbose_name="Razón Social / Nombre")
    ruc = models.CharField(max_length=20, unique=True, verbose_name="RUC/NT", help_text="Sin guiones para PJ")
    dv = models.CharField(max_length=2, verbose_name="DV", blank=True, null=True)
    taxpayer_type = models.CharField(max_length=15, choices=TAXPAYER_TYPES, default='Juridico')
    
    # ✅ CAMPO RECUPERADO: Útil para CRM y cobranza
    contact_person = models.CharField(max_length=100, blank=True, verbose_name="Contacto Principal")
    
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True, verbose_name="Dirección Física (DGI)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validación básica de RUC Panameño
        if self.taxpayer_type != 'Extranjero':
            is_valid, msg = calculate_dv_panama(self.ruc)
            if not is_valid:
                pass # Aquí podrías lanzar ValidationError si quieres ser estricto

    def __str__(self):
        return f"{self.name} | RUC: {self.ruc}-{self.dv}"

class SalesOrder(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Borrador'),
        ('Confirmed', 'Confirmado (Cotización)'),
        ('Invoiced', 'Facturado'),
        ('Cancelled', 'Anulado'),
    ]
    
    # --- Facturación Electrónica (DGI Panamá) ---
    DGI_STATUS_CHOICES = [
        ('NotSent', 'No Enviado'),
        ('Sent', 'Enviado al PAC'),
        ('Authorized', 'Autorizado (CUFE Generado)'),
        ('Rejected', 'Rechazado'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Campos Fiscales DGI
    dgi_status = models.CharField(max_length=20, choices=DGI_STATUS_CHOICES, default='NotSent')
    cufe = models.CharField(max_length=100, blank=True, null=True, verbose_name="CUFE", help_text="Código Único de Factura Electrónica")
    qr_data = models.TextField(blank=True, null=True, help_text="Cadena para generar el QR")
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # Totales (Se calculan automáticamente)
    subtotal_exempt = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Subtotal Exento")
    subtotal_taxable = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Subtotal Gravable")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="ITBMS")
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Descuento Total")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def calculate_totals(self):
        """
        Motor de Cálculo Fiscal (Panamá).
        """
        self.subtotal_taxable = Decimal(0)
        self.subtotal_exempt = Decimal(0)
        self.tax_amount = Decimal(0)
        self.discount_total = Decimal(0)

        for item in self.items.all():
            # Descuento comercial reduce la base imponible
            line_base = item.quantity * item.unit_price
            line_net = line_base - item.discount
            
            self.discount_total += item.discount

            if item.tax_rate > 0:
                self.subtotal_taxable += line_net
                self.tax_amount += (line_net * item.tax_rate)
            else:
                self.subtotal_exempt += line_net
        
        self.total_amount = self.subtotal_taxable + self.subtotal_exempt + self.tax_amount
        self.save()

    def __str__(self):
        return f"SO-{self.id} | {self.customer.name}"

class SOItem(models.Model):
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, related_name='sales_order_items')
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Unitario")
    
    # Descuento Comercial (Reduce la base del ITBMS)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Descuento")
    
    # Impuestos
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.07, help_text="0.07 para 7%")
    isc_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Tasa ISC")

    @property
    def net_total(self):
        return (self.quantity * self.unit_price) - self.discount

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"