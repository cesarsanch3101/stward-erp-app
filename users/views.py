from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.contrib.auth.models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista de Login Segura: Inyecta el refresh token en una Cookie HttpOnly.
    """
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # 1. Autenticación estándar
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # 2. Extraer token
            refresh_token = response.data.get('refresh')
            
            # 3. Quitarlo del JSON (para que JS no lo vea)
            if 'refresh' in response.data:
                del response.data['refresh']
            
            # 4. Meterlo en la Cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=refresh_token,
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
        
        return response

class LogoutView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        response = Response({"message": "Logout exitoso"}, status=status.HTTP_200_OK)
        # Borrar cookie al salir
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        return response

class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]