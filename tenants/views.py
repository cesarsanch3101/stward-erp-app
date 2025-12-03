from rest_framework import viewsets
from .models import Company, Domain
from .serializers import CompanySerializer, DomainSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    """
    Este es el punto de atención (endpoint) de la API que permite
    ver o editar las Empresas (Companies).
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class DomainViewSet(viewsets.ModelViewSet):
    """
    Este es el punto de atención (endpoint) de la API que permite
    ver o editar los Dominios (Domains).
    """
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer