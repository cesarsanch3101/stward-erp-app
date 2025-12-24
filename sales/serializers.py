from rest_framework import serializers
from .models import Customer, SalesOrder, SOItem

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
    
    # Mapeamos 'total_price' del frontend a la lógica del backend
    total_price = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True, 
        source='total_line' 
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
            
            # CÁLCULO EXPLÍCITO (A prueba de fallos)
            # Multiplicamos directamente los campos del objeto creado
            line_total = item.quantity * item.unit_price
            total_order_amount += line_total

        sales_order.total_amount = total_order_amount
        sales_order.save()

        return sales_order