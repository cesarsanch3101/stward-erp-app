from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from accounting.models import JournalEntry, JournalItem, Account

def receive_purchase_order(purchase_order, user):
    """
    Procesa la recepción de una Orden de Compra:
    1. Aumenta el stock de los productos.
    2. Genera el asiento contable (Activo vs Pasivo).
    """
    if purchase_order.status == 'Completed':
        raise ValidationError("Esta orden ya ha sido recibida y completada.")
    
    if purchase_order.total_amount <= 0:
        raise ValidationError("No se puede recibir una orden con monto cero.")

    # Buscar Cuenta de Pasivo (Proveedores / Cuentas por Pagar)
    # Ej: 2205 - Proveedores Nacionales
    try:
        payable_account = Account.objects.get(code='2205') 
    except Account.DoesNotExist:
        raise ValidationError("Falta configurar la cuenta '2205' (Proveedores) en el Plan de Cuentas.")

    with transaction.atomic():
        # 1. Crear Cabecera del Asiento
        entry = JournalEntry.objects.create(
            date=timezone.now().date(),
            description=f"Recepción Compra PO #{purchase_order.id} - Prov: {purchase_order.supplier.name}",
            created_by=user
        )

        # 2. Asiento: CRÉDITO a Proveedores (Pasivo aumenta)
        JournalItem.objects.create(
            journal_entry=entry,
            account=payable_account,
            debit=0,
            credit=purchase_order.total_amount,
            description=f"CxP Proveedor: {purchase_order.supplier.name}"
        )

        # 3. Procesar Items: Aumentar Stock y DÉBITO a Inventario
        for item in purchase_order.items.all():
            product = item.product
            
            # Validación de cuenta de activo
            if not product.category or not product.category.asset_account:
                raise ValidationError(
                    f"El producto '{product.name}' no tiene configurada una Cuenta de Activo (Inventario) en su Categoría."
                )
            
            # A. Aumentar Stock Físico
            product.current_stock += item.quantity
            product.save()

            # B. Asiento: DÉBITO a Inventario (Activo aumenta)
            JournalItem.objects.create(
                journal_entry=entry,
                account=product.category.asset_account,
                debit=item.total_price, # Costo total del item
                credit=0,
                description=f"Entrada Almacén: {product.name} (x{item.quantity})"
            )

        # 4. Actualizar estado de la Orden
        purchase_order.status = 'Completed'
        purchase_order.save()

    return entry