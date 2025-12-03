from django.contrib.auth.models import User
from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
# Importamos los dos serializers que tenemos ahora
from .serializers import UserSerializer, MyTokenObtainPairSerializer
# ¡Importamos la herramienta que nos faltaba!
from rest_framework_simplejwt.views import TokenObtainPairView

class UserViewSet(mixins.CreateModelMixin,
                  viewsets.GenericViewSet):
    """
    Endpoint de la API que permite la creación de nuevos usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener el token, usando nuestro serializer.
    """
    serializer_class = MyTokenObtainPairSerializer