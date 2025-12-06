from rest_framework import serializers
from .models import Category, UnitOfMeasure, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # Añadimos 'income_account' a los campos
        fields = ['id', 'name', 'description', 'income_account']

# ... (El resto de serializers UnitOfMeasureSerializer y ProductSerializer siguen igual)
class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = ['id', 'name', 'abbreviation']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    unit_of_measure_name = serializers.CharField(source='unit_of_measure.name', read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'unit_of_measure', 'unit_of_measure_name', 'sku'
        ]
        extra_kwargs = {
            'category': {'write_only': True, 'required': False, 'allow_null': True},
            'unit_of_measure': {'write_only': True, 'required': True}
        }