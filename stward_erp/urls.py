from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView
# Importamos nuestras vistas seguras
from users.views import CustomTokenObtainPairView, LogoutView
from reports.views import ProfitAndLossAPIView, BalanceSheetAPIView
from inventory.views import ProductKardexView 

api_v1_patterns = [
    # Rutas de Inquilinos y Negocio (Tenants, HR, Sales, etc.)
    path('', include('tenants.urls')), 
    
    # --- AUTENTICACIÓN SEGURA ---
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # El refresh usa la cookie automáticamente si se configura, 
    # pero mantenemos el endpoint estándar por compatibilidad DRF
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view({'post': 'create'}), name='auth_logout'),
    
    # --- REPORTES Y KARDEX ---
    path('reports/profit-and-loss/', ProfitAndLossAPIView.as_view(), name='profit-and-loss'),
    path('reports/balance-sheet/', BalanceSheetAPIView.as_view(), name='balance-sheet'),
    path('products/<int:product_id>/kardex/', ProductKardexView.as_view(), name='product-kardex'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
    
    # Documentación API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]