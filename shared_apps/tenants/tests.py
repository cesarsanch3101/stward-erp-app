from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DomainViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'domains', DomainViewSet, basename='domain')

urlpatterns = router.urls