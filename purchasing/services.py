from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from accounting.models import JournalEntry, JournalItem, Account

def receive_purchase_order(purchase_order, user):
    """
    Enterprise Logic:
    1. Valida estado.
    2. Aumenta Stock Físico (Inventario).
    3. Genera Asiento Contable (Débito Inventario / Crédito Proveedores).
    """
    if purchase_order.status == 'Completed':
        raise ValidationError("Esta orden ya ha sido recibida.")
    
    if purchase_order.total_amount <= 0:
        raise ValidationError("Monto inválido para recepción.")

    # 1. Buscar Cuenta de Pasivo (Proveedores - 2205)
    try:
        payable_account = Account.objects.get(code='2205') 
    except Account.DoesNotExist:
        raise ValidationError("Error Configuración: Falta cuenta '2205' (Proveedores).")

    with transaction.atomic():
        # 2. Crear Asiento (Cabecera)
        entry = JournalEntry.objects.create(
            date=timezone.now().date(),
            description=f"Recepción PO-{purchase_order.id} | Prov: {purchase_order.supplier.name}",
            created_by=user
        )

        # 3. Registrar Deuda (Crédito a Proveedores)
        JournalItem.objects.create(
            journal_entry=entry,
            account=payable_account,
            debit=0,
            credit=purchase_order.total_amount,
            description=f"CxP - Orden #{purchase_order.id}"
        )

        # 4. Procesar cada producto
        for item in purchase_order.items.all():
            product = item.product
            
            # Validar configuración contable del producto
            if not product.category or not product.category.asset_account:
                raise ValidationError(
                    f"El producto '{product.name}' no tiene cuenta de Activo configurada en su Categoría."
                )
            
            # A. AUMENTAR STOCK
            product.current_stock += item.quantity
            product.save()

            # B. REGISTRAR ACTIVO (Débito a Inventario)
            JournalItem.objects.create(
                journal_entry=entry,
                account=product.category.asset_account,
                debit=item.total_price,
                credit=0,
                description=f"Entrada: {product.name} (+{item.quantity})"
            )

        # 5. Cerrar Orden
        purchase_order.status = 'Completed'
        purchase_order.save()

    return entry