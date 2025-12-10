from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView
from reports.views import ProfitAndLossAPIView, BalanceSheetAPIView
# Importamos la vista del Kardex
from inventory.views import ProductKardexView 

api_v1_patterns = [
    path('', include('tenants.urls')), 
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reports/profit-and-loss/', ProfitAndLossAPIView.as_view(), name='profit-and-loss'),
    path('reports/balance-sheet/', BalanceSheetAPIView.as_view(), name='balance-sheet'),

    # --- RUTA DEL KARDEX ---
    path('products/<int:product_id>/kardex/', ProductKardexView.as_view(), name='product-kardex'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]