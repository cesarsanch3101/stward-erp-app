from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from accounting.models import JournalEntry, JournalItem, Account

def receive_purchase_order(purchase_order, user):
    """
    1. Valida que la orden no esté ya recibida.
    2. Aumenta el stock físico en el modelo Product.
    3. Genera el asiento contable (Débito a Inventario / Crédito a Proveedores).
    """
    if purchase_order.status == 'Completed':
        raise ValidationError("Esta orden ya ha sido recibida anteriormente.")
    
    if purchase_order.total_amount <= 0:
        raise ValidationError("No se puede recibir una orden con monto cero.")

    # Busca la cuenta de Pasivo (Proveedores - 2205)
    try:
        payable_account = Account.objects.get(code='2205') 
    except Account.DoesNotExist:
        raise ValidationError("Falta configurar la cuenta '2205' (Proveedores) en el Plan de Cuentas.")

    with transaction.atomic():
        # A. Crear Cabecera del Asiento
        entry = JournalEntry.objects.create(
            date=timezone.now().date(),
            description=f"Recepción PO-{purchase_order.id} | Prov: {purchase_order.supplier.name}",
            created_by=user
        )

        # B. Registrar Deuda (Haber/Crédito a Proveedores)
        JournalItem.objects.create(
            journal_entry=entry,
            account=payable_account,
            debit=0,
            credit=purchase_order.total_amount,
            description=f"CxP - Orden Compra #{purchase_order.id}"
        )

        # C. Procesar cada producto (Aumentar Stock y Registrar Activo)
        for item in purchase_order.items.all():
            product = item.product
            
            # Validar que el producto tenga cuenta de activo asignada en su categoría
            if not product.category or not product.category.asset_account:
                raise ValidationError(
                    f"El producto '{product.name}' (Categoría: {product.category}) no tiene 'Cuenta de Activo' configurada."
                )
            
            # 1. AUMENTAR STOCK FÍSICO
            product.current_stock += item.quantity
            product.save()

            # 2. REGISTRAR VALOR EN LIBROS (Debe/Débito a Inventario)
            JournalItem.objects.create(
                journal_entry=entry,
                account=product.category.asset_account,
                debit=item.total_price, # Cantidad * Costo
                credit=0,
                description=f"Entrada Almacén: {product.name} (+{item.quantity})"
            )

        # D. Cerrar la Orden
        purchase_order.status = 'Completed'
        purchase_order.save()

    return entry