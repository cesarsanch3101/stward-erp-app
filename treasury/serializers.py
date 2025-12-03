from rest_framework import serializers
from .models import BankAccount, CashRegister, TreasuryMovement

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        # Haremos que current_balance sea de solo lectura, ya que debería actualizarse con los movimientos.
        fields = ['id', 'name', 'bank_name', 'account_number', 'initial_balance', 'current_balance']
        read_only_fields = ['current_balance']

class CashRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashRegister
       # El saldo actual también es de solo lectura aquí.
        fields = ['id', 'name', 'initial_balance', 'current_balance']
        read_only_fields = ['current_balance']

class TreasuryMovementSerializer(serializers.ModelSerializer):
   # Campos de solo lectura para mostrar nombres por conveniencia
    from_bank_account_name = serializers.CharField(source='from_bank_account.name', read_only=True, allow_null=True)
    from_cash_register_name = serializers.CharField(source='from_cash_register.name', read_only=True, allow_null=True)
    to_bank_account_name = serializers.CharField(source='to_bank_account.name', read_only=True, allow_null=True)
    to_cash_register_name = serializers.CharField(source='to_cash_register.name', read_only=True, allow_null=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True, allow_null=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True, allow_null=True)

    class Meta:
        model = TreasuryMovement
        fields = [
            'id', 'date', 'movement_type', 'amount', 'description',
            # Teclas foráneas (para escribir)
            'from_bank_account', 'from_cash_register',
            'to_bank_account', 'to_cash_register',
            'customer', 'supplier', 'processed_by',
            # Nombres de solo lectura (para lectura)
            'from_bank_account_name', 'from_cash_register_name',
            'to_bank_account_name', 'to_cash_register_name',
            'customer_name', 'supplier_name', 'processed_by_username'
        ]
       # Los campos 'processed_by' y 'date' deberían configurarse automáticamente, no por el usuario.
        read_only_fields = ['date', 'processed_by']