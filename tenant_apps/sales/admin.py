from django.contrib import admin
from .models import Customer, SalesOrder, SOItem

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    # ✅ AGREGO 'contact_person' a la lista
    list_display = ('name', 'ruc', 'taxpayer_type', 'contact_person', 'email', 'phone_number')
    search_fields = ('name', 'ruc', 'email', 'contact_person')
    list_filter = ('taxpayer_type',)

class SOItemInline(admin.TabularInline):
    """Permite editar líneas de productos dentro de la orden"""
    model = SOItem
    extra = 1
    readonly_fields = ('net_total',)

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'order_date', 'total_amount', 'dgi_status')
    list_filter = ('status', 'dgi_status', 'order_date')
    search_fields = ('id', 'customer__name', 'cufe')
    
    readonly_fields = ('subtotal_taxable', 'subtotal_exempt', 'tax_amount', 'discount_total', 'total_amount')
    inlines = [SOItemInline]

@admin.register(SOItem)
class SOItemAdmin(admin.ModelAdmin):
    list_display = ('sales_order', 'product', 'quantity', 'unit_price', 'net_total')