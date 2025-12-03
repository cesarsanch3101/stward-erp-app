from django.contrib import admin
from django.urls import path, include

# Vistas de drf-spectacular
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Vistas de JWT
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView

# ¡Importamos nuestra nueva vista de reporte!
from reports.views import ProfitAndLossAPIView
from reports.views import ProfitAndLossAPIView, BalanceSheetAPIView
# Agrupamos todas las rutas de la API v1
api_v1_patterns = [
    # Incluye /companies, /products, /customers, /accounts, etc.
    path('', include('tenants.urls')), 

    # Rutas de autenticación
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ¡NUEVA RUTA DE REPORTE!
    path('reports/profit-and-loss/', ProfitAndLossAPIView.as_view(), name='profit-and-loss'),
    # Ruta de Reporte de Balance
    path('reports/balance-sheet/', BalanceSheetAPIView.as_view(), name='balance-sheet'),
]


urlpatterns = [
    path('admin/', admin.site.urls),

    # Ruta principal de la API
    path('api/v1/', include(api_v1_patterns)),

    # Rutas de la documentación (se quedan igual)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]