from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supplier, PurchaseOrder, POItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, POItemSerializer
from .services import receive_purchase_order # <-- Importamos la lógica

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().prefetch_related('items__product__category')
    serializer_class = PurchaseOrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # --- ACCIÓN PERSONALIZADA: RECIBIR ---
    @action(detail=True, methods=['post'], url_path='receive')
    def receive(self, request, pk=None):
        order = self.get_object()
        try:
            entry = receive_purchase_order(order, request.user)
            return Response({
                'status': 'success',
                'message': f'Recepción exitosa. Asiento #{entry.id} creado.',
                'new_status': order.status
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)