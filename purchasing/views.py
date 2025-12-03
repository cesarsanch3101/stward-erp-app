from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Supplier, PurchaseOrder, POItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, POItemSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows suppliers to be viewed or edited.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows purchase orders to be viewed or edited.
    It also handles the creation of associated POItems.
    """
    queryset = PurchaseOrder.objects.all().prefetch_related('items') # Optimize to fetch items too
    serializer_class = PurchaseOrderSerializer

    def perform_create(self, serializer):
        # Automatically set the 'created_by' field to the current user
        serializer.save(created_by=self.request.user)

    # We might add custom actions later to handle status changes (e.g., submit order)
    # or receiving goods.

# Note: We don't typically need a separate ViewSet for POItem, 
# as items are usually managed *through* the PurchaseOrder. 
# If we needed to update individual items later, we might create one.