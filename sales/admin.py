from django.contrib import admin
from .models import Customer, SalesOrder, SOItem

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone_number')
    search_fields = ('name', 'email', 'contact_person')

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'order_date', 'total_amount')
    search_fields = ('id', 'customer__name')
    list_filter = ('status', 'order_date')

@admin.register(SOItem)
class SOItemAdmin(admin.ModelAdmin):
    list_display = ('sales_order', 'product', 'quantity', 'unit_price')