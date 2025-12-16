from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Supplier, PurchaseOrder, POItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, POItemSerializer
from .services import receive_purchase_order 

# Importaciones para OCR (Simulado si no hay librerías)
try:
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('supplier').prefetch_related('items__product__category')
    serializer_class = PurchaseOrderSerializer
    parser_classes = (MultiPartParser, FormParser) # Permitir subida de archivos

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status != 'Draft':
            return Response(
                {'detail': 'No se puede eliminar una orden procesada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

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

    # --- NUEVO: ENDPOINT OCR ---
    @action(detail=False, methods=['post'], url_path='upload-invoice')
    def upload_invoice(self, request):
        """
        Recibe un PDF/Imagen, extrae texto y sugiere una Orden de Compra.
        """
        if 'file' not in request.data:
            return Response({'detail': 'No se envió ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.data['file']
        
        # Validación de IA
        if not OCR_AVAILABLE:
            return Response({'detail': 'Motor OCR no instalado en el servidor.'}, status=status.HTTP_501_NOT_IMPLEMENTED)

        # Simulación de extracción (En producción usarías una tarea de Celery aquí)
        # text = pytesseract.image_to_string(image)
        
        # Respuesta simulada de la IA
        extracted_data = {
            'detected_supplier': 'Proveedor Detectado S.A.',
            'detected_date': '2025-12-15',
            'detected_total': 1500.00,
            'confidence': 0.92,
            'items_found': [
                {'description': 'Servicio de Hosting', 'amount': 1000},
                {'description': 'Mantenimiento', 'amount': 500}
            ]
        }

        return Response(extracted_data, status=status.HTTP_200_OK)