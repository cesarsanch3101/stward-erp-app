from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
# CORRECCIÓN: Importamos JSONParser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Supplier, PurchaseOrder, POItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, POItemSerializer
from .services import receive_purchase_order 
import re
from datetime import datetime

# Importaciones para OCR
try:
    import pytesseract
    from pdf2image import convert_from_bytes
    from PIL import Image
    import io
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('supplier')
    serializer_class = PurchaseOrderSerializer
    # CORRECCIÓN CRÍTICA: Agregamos JSONParser al inicio
    # Esto permite que la API acepte tanto JSON (crear orden) como Archivos (subir factura)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='receive')
    def receive(self, request, pk=None):
        order = self.get_object()
        try:
            entry = receive_purchase_order(order, request.user)
            return Response({'status': 'success', 'message': f'Recepción exitosa. Asiento #{entry.id}.'}, status=200)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)

    @action(detail=False, methods=['post'], url_path='upload-invoice')
    def upload_invoice(self, request):
        """
        Procesa PDF/Imagen -> Texto -> JSON Estructurado
        """
        if 'file' not in request.data:
            return Response({'detail': 'Archivo no proporcionado.'}, status=400)

        uploaded_file = request.data['file']
        
        if not OCR_AVAILABLE:
            return Response({'detail': 'Librerías OCR no instaladas.'}, status=501)

        try:
            text = ""
            # 1. Procesamiento de Imagen/PDF
            if uploaded_file.name.endswith('.pdf'):
                images = convert_from_bytes(uploaded_file.read())
                for img in images:
                    text += pytesseract.image_to_string(img) + "\n"
            else:
                image = Image.open(uploaded_file)
                text = pytesseract.image_to_string(image)

            # 2. Extracción con RegEx (Heurística simple)
            date_match = re.search(r'(\d{2}/\d{2}/\d{4})|(\d{4}-\d{2}-\d{2})', text)
            detected_date = date_match.group(0) if date_match else datetime.now().strftime('%Y-%m-%d')

            prices = re.findall(r'\$?\s?(\d{1,3}(?:,\d{3})*\.\d{2})', text)
            detected_total = 0.0
            if prices:
                clean_prices = [float(p.replace(',', '')) for p in prices]
                detected_total = max(clean_prices)

            detected_supplier = "Proveedor Desconocido"
            
            return Response({
                'detected_date': detected_date,
                'detected_total': detected_total,
                'detected_supplier': detected_supplier,
                'confidence': 0.85
            })

        except Exception as e:
            return Response({'detail': f'Error procesando OCR: {str(e)}'}, status=500)