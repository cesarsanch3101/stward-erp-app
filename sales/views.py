from rest_framework import viewsets
from .models import Customer, SalesOrder, SOItem
from .serializers import CustomerSerializer, SalesOrderSerializer, SOItemSerializer # Import SOItemSerializer too, though not used directly yet

class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows customers to be viewed or edited.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows sales orders to be viewed or edited.
    """
    # Optimize to fetch related customer and items efficiently
    queryset = SalesOrder.objects.all().select_related('customer').prefetch_related('items') 
    serializer_class = SalesOrderSerializer

    def perform_create(self, serializer):
        # Automatically set the 'created_by' field to the current user
        serializer.save(created_by=self.request.user)

    # We might add custom actions later for confirming orders, shipping, invoicing, etc.