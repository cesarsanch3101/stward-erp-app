from rest_framework import viewsets
from .models import Category, UnitOfMeasure, Product
from .serializers import CategorySerializer, UnitOfMeasureSerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class UnitOfMeasureViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows units of measure to be viewed or edited.
    """
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer

class ProductViewSet(viewsets.ModelViewSet):
    # ¡CAMBIO CLAVE! Usamos select_related para traer los datos relacionados
    # en una sola consulta a la base de datos.
    queryset = Product.objects.all().select_related('category', 'unit_of_measure')
    serializer_class = ProductSerializer