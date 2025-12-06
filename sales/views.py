from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, SalesOrder, SOItem
from .serializers import CustomerSerializer, SalesOrderSerializer
from .services import invoice_sales_order # Importamos nuestro servicio

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all().select_related('customer').prefetch_related('items__product__category') # Optimizamos query
    serializer_class = SalesOrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # --- NUEVA ACCIÓN: FACTURAR ---
    @action(detail=True, methods=['post'], url_path='invoice')
    def invoice(self, request, pk=None):
        """
        Acción personalizada para convertir una Orden en Factura
        y generar su asiento contable automáticamente.
        """
        sales_order = self.get_object()
        
        try:
            # Delegamos la lógica compleja al servicio
            invoice_sales_order(sales_order, request.user)
            
            # Serializamos la orden actualizada para devolverla al frontend
            serializer = self.get_serializer(sales_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Manejamos errores de negocio (ej: cuentas no configuradas)
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)