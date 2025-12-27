from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, UnitOfMeasure, Product
from .serializers import CategorySerializer, UnitOfMeasureSerializer, ProductSerializer
from accounting.models import JournalItem 

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class UnitOfMeasureViewSet(viewsets.ModelViewSet):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category', 'unit_of_measure')
    serializer_class = ProductSerializer

# --- VISTA DE KARDEX (HISTORIAL DE MOVIMIENTOS) ---
class ProductKardexView(APIView):
    """
    Devuelve los movimientos contables (Entradas/Salidas) de un producto.
    """
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            
            # Validación
            if not product.category or not product.category.asset_account:
                return Response(
                    {'detail': 'Este producto no tiene cuenta de activo configurada en su categoría.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Buscamos movimientos en la cuenta de activo que mencionen al producto
            movements = JournalItem.objects.filter(
                account=product.category.asset_account,
                description__icontains=product.name 
            ).select_related('journal_entry').order_by('-journal_entry__date', '-id')

            data = []
            
            for mov in movements:
                # Débito = Entrada, Crédito = Salida
                mov_type = "ENTRADA" if mov.debit > 0 else "SALIDA"
                
                data.append({
                    'date': mov.journal_entry.date,
                    'type': mov_type,
                    'description': mov.description,
                    'amount': mov.debit if mov.debit > 0 else mov.credit,
                    'journal_id': mov.journal_entry.id
                })

            return Response(data, status=status.HTTP_200_OK)

        except Product.DoesNotExist:
            return Response({'detail': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)