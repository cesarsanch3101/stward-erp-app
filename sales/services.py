from django.db import transaction
from django.utils import timezone
from accounting.models import JournalEntry, JournalItem, Account
from rest_framework.exceptions import ValidationError

def invoice_sales_order(sales_order, user):
    """
    Transforma una Orden de Venta en una Factura (Asiento Contable).
    Realiza validaciones de negocio y contables.
    """
    if sales_order.status == 'Invoiced':
        raise ValidationError("Esta orden ya ha sido facturada.")
    
    if sales_order.total_amount <= 0:
        raise ValidationError("No se puede facturar una orden con monto cero.")

    # Buscamos la cuenta de "Cuentas por Cobrar" (Clientes)
    # En un sistema real, esto vendría de la configuración del Cliente o de la Compañía
    try:
        receivable_account = Account.objects.get(code='110505') # Ej: Clientes Nacionales
    except Account.DoesNotExist:
        raise ValidationError("No existe la cuenta contable '110505' para Cuentas por Cobrar. Configure el Plan de Cuentas.")

    with transaction.atomic():
        # 1. Crear la Cabecera del Asiento
        journal_entry = JournalEntry.objects.create(
            date=timezone.now().date(),
            description=f"Factura de Venta - Orden #{sales_order.id} - Cliente: {sales_order.customer.name}",
            created_by=user
        )

        # 2. Crear Línea de Débito (Cuentas por Cobrar - Activo aumenta)
        JournalItem.objects.create(
            journal_entry=journal_entry,
            account=receivable_account,
            debit=sales_order.total_amount,
            credit=0,
            description=f"CXC - {sales_order.customer.name}"
        )

        # 3. Crear Líneas de Crédito (Ingresos por cada producto)
        # Agrupamos por producto/categoría para buscar sus cuentas
        for item in sales_order.items.all():
            product = item.product
            # Buscamos la cuenta en la categoría del producto
            income_account = product.category.income_account if product.category else None
            
            if not income_account:
                raise ValidationError(
                    f"El producto '{product.name}' (Categoría: {product.category}) no tiene configurada una Cuenta de Ingresos."
                )

            JournalItem.objects.create(
                journal_entry=journal_entry,
                account=income_account,
                debit=0,
                credit=item.total_price, # Usamos la propiedad calculada
                description=f"Venta {product.name} (x{item.quantity})"
            )

        # 4. Actualizar Estado de la Orden
        sales_order.status = 'Invoiced'
        sales_order.save()

    return journal_entry