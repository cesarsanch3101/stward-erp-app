from rest_framework import serializers
from .models import Supplier, PurchaseOrder, POItem
from inventory.serializers import ProductSerializer 

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone_number', 'address']

class POItemSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para mostrar nombres
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True) 

    class Meta:
        model = POItem
        fields = [
            'id', 
            # 'purchase_order', # Lo maneja el padre
            'product', # ID para escribir (enviado desde el frontend)
            'product_name', # Nombre para leer
            'quantity', 
            'unit_price',
            'total_price' 
        ]
        # OJO: Quitamos extra_kwargs conflictivos para permitir escritura directa

class PurchaseOrderSerializer(serializers.ModelSerializer):
    # CORRECCIÓN 1: Quitamos read_only=True para poder GUARDAR los items
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
            'total_amount', 
            'items' # Lista anidada
        ]
        read_only_fields = ['order_date', 'total_amount', 'created_by']

    # CORRECCIÓN 2: Método create para guardar Cabecera + Items
    def create(self, validated_data):
        # 1. Extraer los items del payload
        items_data = validated_data.pop('items')

        # 2. Crear la Orden de Compra (Cabecera)
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        total_order_amount = 0

        # 3. Recorrer y crear cada item
        for item_data in items_data:
            item = POItem.objects.create(purchase_order=purchase_order, **item_data)
            # Sumar al total (cantidad * costo unitario)
            total_order_amount += (item.quantity * item.unit_price)

        # 4. Actualizar el total de la orden
        purchase_order.total_amount = total_order_amount
        purchase_order.save()

        return purchase_order