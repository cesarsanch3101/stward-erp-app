from rest_framework import serializers
from .models import Customer, SalesOrder, SOItem
# No necesitamos ProductSerializer aquí si no lo usamos explícitamente, 
# pero lo dejamos por si acaso.

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 
            'name', 
            'ruc', 
            'dv', 
            'taxpayer_type', 
            'contact_person', 
            'email', 
            'phone_number', 
            'address'
        ]

class SOItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    # --- CORRECCIÓN 1: Mapeo para el Frontend ---
    # Le decimos a Django: "Cuando el frontend pida 'total_price', 
    # dale el valor de 'total_line' del modelo".
    total_price = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True, 
        source='total_line'  # <--- CLAVE: Apunta a la propiedad real del modelo
    )

    class Meta:
        model = SOItem
        fields = [
            'id', 
            'product', 
            'product_name', 
            'quantity', 
            'unit_price',
            'total_price'
        ]

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SOItemSerializer(many=True) 

    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = SalesOrder
        fields = [
            'id', 
            'customer', 
            'customer_name', 
            'order_date', 
            'shipping_date', 
            'status', 
            'created_by', 
            'created_by_username', 
            'total_amount',
            'items' 
        ]
        read_only_fields = ['order_date', 'total_amount', 'created_by']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sales_order = SalesOrder.objects.create(**validated_data)
        
        total_order_amount = 0

        for item_data in items_data:
            item = SOItem.objects.create(sales_order=sales_order, **item_data)
            
            # --- CORRECCIÓN 2: Cálculo Interno ---
            # Aquí usamos el nombre REAL de la propiedad en el modelo (models.py)
            # El error ocurría porque aquí decía 'item.total_price'
            total_order_amount += item.total_line 

        sales_order.total_amount = total_order_amount
        sales_order.save()

        return sales_order