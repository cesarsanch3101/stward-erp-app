from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Intentar autenticación estándar (Header)
        header_auth = super().authenticate(request)
        if header_auth is not None:
            return header_auth

        # 2. Si falla, buscar en la Cookie 'access_token'
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return None

        # 3. Validar el token encontrado en la cookie
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            return None