from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Cuenta 4100 (Ingresos - Ventas)
    income_account = models.ForeignKey(
        'accounting.Account', 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='categories_income',
        verbose_name="Cuenta de Ingresos (Ventas)"
    )
    
    # --- NUEVO: Cuenta 1435 (Activo - Inventario) ---
    asset_account = models.ForeignKey(
        'accounting.Account', 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='categories_asset',
        verbose_name="Cuenta de Activo (Inventario)"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class UnitOfMeasure(models.Model):
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return f"{self.name} ({self.abbreviation})"

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    unit_of_measure = models.ForeignKey(UnitOfMeasure, on_delete=models.PROTECT, related_name='products')
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    # --- NUEVO: Control de Stock Físico ---
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} ({self.sku})"