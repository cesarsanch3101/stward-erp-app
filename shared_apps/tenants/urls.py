from rest_framework.routers import DefaultRouter
# Tenant App Views
from .views import CompanyViewSet, DomainViewSet
# User App Views
from users.views import UserViewSet
# Inventory App Views
from inventory.views import CategoryViewSet, UnitOfMeasureViewSet, ProductViewSet
# Purchasing App Views
from purchasing.views import SupplierViewSet, PurchaseOrderViewSet
# Sales App Views
from sales.views import CustomerViewSet, SalesOrderViewSet
# Treasury App Views
from treasury.views import BankAccountViewSet, CashRegisterViewSet, TreasuryMovementViewSet
# Accounting App Views
from accounting.views import AccountViewSet, JournalEntryViewSet
# HR App Views (¡LA QUE FALTABA!)
from hr.views import EmployeeViewSet 

router = DefaultRouter()

router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'users', UserViewSet, basename='user')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'units', UnitOfMeasureViewSet, basename='unitofmeasure')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'sales-orders', SalesOrderViewSet, basename='salesorder')
router.register(r'bank-accounts', BankAccountViewSet, basename='bankaccount')
router.register(r'cash-registers', CashRegisterViewSet, basename='cashregister')
router.register(r'treasury-movements', TreasuryMovementViewSet, basename='treasurymovement')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'journal-entries', JournalEntryViewSet, basename='journalentry')
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = router.urls