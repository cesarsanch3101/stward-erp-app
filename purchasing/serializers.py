from rest_framework import serializers
from .models import Supplier, PurchaseOrder, POItem
from inventory.serializers import ProductSerializer # To potentially show product details

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone_number', 'address']

class POItemSerializer(serializers.ModelSerializer):
    # Read-only fields to show names for convenience
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True) # Use the @property

    class Meta:
        model = POItem
        fields = [
            'id', 
            'purchase_order', 
            'product', # ID for writing
            'product_name', # Name for reading
            'quantity', 
            'unit_price',
            'total_price' # Calculated property
        ]
        # Product ID is required when creating an item, but don't show it when reading the item list within a PO
        extra_kwargs = {
            'product': {'write_only': True},
            'purchase_order': {'read_only': True} # Usually set automatically when creating items within a PO
        }

class PurchaseOrderSerializer(serializers.ModelSerializer):
    # Nested serializer to show items when viewing a PO
    items = POItemSerializer(many=True, read_only=True) 
    # Read-only fields for related names
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 
            'supplier', # ID for writing
            'supplier_name', # Name for reading
            'order_date', 
            'expected_delivery_date', 
            'status', 
            'created_by', # ID (usually set automatically based on logged-in user)
            'created_by_username', # Name for reading
            'total_amount', # This will be read-only for now
            'items' # The nested list of items
        ]
        read_only_fields = ['order_date', 'total_amount', 'created_by'] # Fields not set directly via API