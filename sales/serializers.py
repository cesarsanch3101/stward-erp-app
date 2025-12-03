from rest_framework import serializers
from .models import Customer, SalesOrder, SOItem
from inventory.serializers import ProductSerializer 

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'contact_person', 'email', 'phone_number', 'address']

class SOItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SOItem
        fields = [
            'id', 
            # 'sales_order', # Se maneja automáticamente por el serializer padre
            'product', # ID para escribir
            'product_name', # Nombre para leer
            'quantity', 
            'unit_price',
            'total_price'
        ]
        # Ya no necesitamos 'extra_kwargs' aquí, 'product' es un campo de escritura normal

class SalesOrderSerializer(serializers.ModelSerializer):
    # ¡CAMBIO CLAVE! 'items' ahora es de escritura/lectura.
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
            'items' # La lista anidada de items
        ]
        read_only_fields = ['order_date', 'total_amount', 'created_by']

    # --- ¡NUEVO MÉTODO! ---
    def create(self, validated_data):
        # 1. Extraer los datos de los items anidados
        items_data = validated_data.pop('items')

        # 2. Crear la Orden de Venta (la cabecera)
        # El 'created_by' se añadirá en el ViewSet (paso que ya hicimos)
        sales_order = SalesOrder.objects.create(**validated_data)

        total_order_amount = 0

        # 3. Crear cada Item de la Orden y calcular el total
        for item_data in items_data:
            item = SOItem.objects.create(sales_order=sales_order, **item_data)
            # Usamos la propiedad .total_price que ya calcula (cantidad * precio)
            total_order_amount += item.total_price 

        # 4. Actualizar el total de la orden y guardarla
        sales_order.total_amount = total_order_amount
        sales_order.save()

        return sales_order