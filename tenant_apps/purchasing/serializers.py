from rest_framework import serializers
from .models import Supplier, PurchaseOrder, POItem

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 
            'name', 
            'supplier_type', # Local vs Extranjero
            'ruc', 
            'dv', 
            'contact_person', 
            'email', 
            'phone_number', 
            'address'
        ]

class POItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    # Calculado en el modelo
    total_line = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = POItem
        fields = [
            'id', 
            'product', 
            'product_name', 
            'quantity', 
            'unit_price',
            'tax_rate', # Nuevo: Tasa de impuesto por línea
            'total_line'
        ]

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = POItemSerializer(many=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 
            'supplier',
            'supplier_name', 
            'order_date', 
            'expected_delivery_date', 
            'status', 
            'created_by', 
            'created_by_username',
            
            # --- Campos Fiscales ---
            'apply_retention',
            'is_gross_up',
            
            # --- Totales Financieros (Solo Lectura) ---
            'subtotal',
            'tax_amount',
            'retention_amount',
            'total_amount',
            'payable_amount', # Lo que realmente se paga (Total - Retención)
            
            'items'
        ]
        read_only_fields = [
            'order_date', 'created_by',
            'subtotal', 'tax_amount', 'retention_amount', 
            'total_amount', 'payable_amount'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        # 1. Crear la Orden de Compra (Cabecera)
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        # 2. Recorrer y crear cada item
        for item_data in items_data:
            POItem.objects.create(purchase_order=purchase_order, **item_data)

        # 3. Calcular Totales y Retenciones (Lógica de Negocio)
        purchase_order.calculate_totals()

        return purchase_order