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
    Login Seguro: Guarda Access Token y Refresh Token en Cookies HttpOnly.
    """
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            # Limpiamos el JSON (Seguridad: Frontend no necesita ver los tokens)
            if 'access' in response.data: del response.data['access']
            if 'refresh' in response.data: del response.data['refresh']
            
            # 1. Cookie de ACCESS TOKEN (Para peticiones rápidas)
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'], 
                value=access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )

            # 2. Cookie de REFRESH TOKEN (Para mantener sesión viva)
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'], 
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
        # Borrar ambas cookies
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        return response

class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]