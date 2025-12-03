from django.contrib import admin
from .models import Account, JournalEntry, JournalItem

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para el Plan de Cuentas.
    """
    list_display = ('code', 'name', 'account_type', 'parent')
    search_fields = ('code', 'name')
    list_filter = ('account_type', 'parent')
    # Hacemos que la jerarquía sea fácil de navegar
    autocomplete_fields = ['parent'] 

class JournalItemInline(admin.TabularInline):
    """
    Define el formato "inline" para las líneas del asiento.
    Esto nos permite ver y editar los items DENTRO del asiento.
    """
    model = JournalItem
    # Campos a mostrar en la línea
    fields = ('account', 'debit', 'credit', 'description')
    # Para que sea más rápido, le decimos a Django que no cargue la lista completa
    # de cuentas en un desplegable, sino que use un campo de búsqueda.
    autocomplete_fields = ['account']
    # Cuántas líneas vacías mostrar por defecto
    extra = 1 

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    """
    Configuración del Admin para el Asiento Contable.
    """
    list_display = ('id', 'date', 'description', 'created_by')
    list_filter = ('date', 'created_by')
    search_fields = ('description', 'id')
    readonly_fields = ('created_at',)

    # ¡La magia! Le decimos que incluya el editor de items inline
    inlines = [JournalItemInline]

    def save_model(self, request, obj, form, change):
        # Asigna automáticamente al usuario logueado al crear desde el admin
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def save_related(self, request, form, formsets, change):
        # Valida la partida doble ANTES de guardar
        total_debit = 0
        total_credit = 0
        for formset in formsets:
            if formset.model == JournalItem:
                for f in formset:
                    if not f.cleaned_data.get('DELETE', False):
                        total_debit += f.cleaned_data.get('debit', 0)
                        total_credit += f.cleaned_data.get('credit', 0)

        if total_debit != total_credit:
            # Si no balancea, no guardamos y mostramos un error
            from django.core.exceptions import ValidationError
            raise ValidationError("¡El asiento no está balanceado! (Debe != Haber)")

        # Si todo está bien, guardamos
        super().save_related(request, form, formsets, change)