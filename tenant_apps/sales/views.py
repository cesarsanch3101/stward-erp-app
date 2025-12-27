from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, SalesOrder, SOItem
from .serializers import CustomerSerializer, SalesOrderSerializer
from .services import invoice_sales_order 

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all().select_related('customer').prefetch_related('items__product__category') 
    serializer_class = SalesOrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # --- NUEVO: RESTRICCIÓN DE BORRADO ---
    def destroy(self, request, *args, **kwargs):
        """
        Solo permite eliminar órdenes en estado 'Borrador' (Draft).
        """
        instance = self.get_object()
        if instance.status != 'Draft':
            return Response(
                {'detail': 'No se puede eliminar una orden que ya ha sido confirmada o facturada. Anúlala en su lugar.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='invoice')
    def invoice(self, request, pk=None):
        sales_order = self.get_object()
        try:
            invoice_sales_order(sales_order, request.user)
            serializer = self.get_serializer(sales_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)