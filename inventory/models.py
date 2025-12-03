from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        # Optional: Makes the admin panel display the plural correctly
        verbose_name_plural = "Categories"


class UnitOfMeasure(models.Model):
    name = models.CharField(max_length=50, unique=True) # e.g., "Piece", "Kilogram"
    abbreviation = models.CharField(max_length=10, unique=True) # e.g., "pc", "kg"

    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL, # If category deleted, don't delete product
        null=True,
        blank=True,
        related_name='products'
    )
    unit_of_measure = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT, # Prevent deleting a unit if products use it
        related_name='products'
    )
    # We'll add price and stock fields later in more advanced models
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True) # Stock Keeping Unit

    def __str__(self):
        return self.name