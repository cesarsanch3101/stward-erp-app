from django.db import models

# ... (Mantén Category, UnitOfMeasure, Product como están) ...

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    income_account = models.ForeignKey('accounting.Account', on_delete=models.PROTECT, null=True, blank=True, related_name='categories_income', verbose_name="Cuenta de Ingresos (Ventas)")
    asset_account = models.ForeignKey('accounting.Account', on_delete=models.PROTECT, null=True, blank=True, related_name='categories_asset', verbose_name="Cuenta de Activo (Inventario)")

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
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} ({self.sku})"

# --- NUEVO MODELO DE IA ---
class ProductDemand(models.Model):
    """
    Almacena las predicciones de demanda generadas por la IA.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='demand_forecasts')
    date_calculated = models.DateField(auto_now_add=True)
    
    # Periodo pronosticado (ej: próximo mes)
    forecast_period_start = models.DateField()
    forecast_period_end = models.DateField()
    
    predicted_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_score = models.FloatField(help_text="0 a 1. Confianza del modelo")
    
    # Campo para recomendación de acción
    recommended_action = models.CharField(max_length=50, default='Mantener', choices=[
        ('Restock', 'Reabastecer Urgente'),
        ('Mantener', 'Nivel Óptimo'),
        ('Overstock', 'Exceso de Inventario')
    ])

    def __str__(self):
        return f"Forecast {self.product.name}: {self.predicted_quantity}"