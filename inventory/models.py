from django.db import models
# Importamos el modelo de cuenta para la relación
# Usamos string 'accounting.Account' para evitar importaciones circulares
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # --- NUEVO: Configuración Contable ---
    # Esto permite que todos los productos de esta categoría sepan dónde registrar sus ventas
    income_account = models.ForeignKey(
        'accounting.Account', 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='categories_income',
        verbose_name="Cuenta de Ingresos (Ventas)"
    )
    # Podríamos añadir expense_account (Costo de Ventas) y asset_account (Inventario) aquí también

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

# ... (El resto de modelos UnitOfMeasure y Product se mantienen igual)
class UnitOfMeasure(models.Model):
    name = models.CharField(max_length=50, unique=True) 
    abbreviation = models.CharField(max_length=10, unique=True) 

    def __str__(self):
        return f"{self.name} ({self.abbreviation})"

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='products'
    )
    unit_of_measure = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT, 
        related_name='products'
    )
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True) 

    def __str__(self):
        return self.name