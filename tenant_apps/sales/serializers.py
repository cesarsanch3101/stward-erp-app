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
            'contact_person', # ✅ Campo disponible en la API
            'email', 
            'phone_number', 
            'address'
        ]

class SOItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    net_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SOItem
        fields = [
            'id', 
            'product', 
            'product_name', 
            'quantity', 
            'unit_price',
            'discount',
            'tax_rate',
            'isc_rate',
            'net_total'
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
            'status', 
            'dgi_status',
            'cufe',
            'qr_data',
            'subtotal_taxable',
            'subtotal_exempt',
            'discount_total',
            'tax_amount',
            'total_amount',
            'created_by_username', 
            'items'
        ]
        read_only_fields = [
            'order_date', 'total_amount', 'tax_amount', 
            'subtotal_taxable', 'subtotal_exempt', 'discount_total',
            'dgi_status', 'cufe', 'qr_data'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sales_order = SalesOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            SOItem.objects.create(sales_order=sales_order, **item_data)

        sales_order.calculate_totals()
        return sales_order