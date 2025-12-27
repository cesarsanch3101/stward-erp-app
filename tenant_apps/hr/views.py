from rest_framework import viewsets
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar empleados.
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer