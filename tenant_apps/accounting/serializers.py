from rest_framework import serializers
from .models import Account, JournalEntry, JournalItem
from django.db import transaction

class AccountSerializer(serializers.ModelSerializer):
    """
    Serializer para el Plan de Cuentas (Chart of Accounts).
    """
    class Meta:
        model = Account
        fields = ['id', 'name', 'code', 'account_type', 'parent', 'description']

class JournalItemSerializer(serializers.ModelSerializer):
    """
    Serializer para una línea de un asiento contable (Debe/Haber).
    """
    # Campo de solo lectura para mostrar el nombre de la cuenta
    account_name = serializers.CharField(source='account.name', read_only=True, allow_null=True)

    class Meta:
        model = JournalItem
        # Excluimos 'journal_entry' porque será manejado por el serializer padre
        exclude = ['journal_entry']

    def validate(self, data):
        # Llama a la validación del modelo que escribimos
        # (ej: no débito Y crédito a la vez)
        instance = JournalItem(**data)
        instance.clean()
        return data

class JournalEntrySerializer(serializers.ModelSerializer):
    """
    Serializer para el Asiento Contable (cabecera + items).
    Maneja la creación anidada de los items.
    """
    # Serializer anidado para recibir y mostrar los items
    items = JournalItemSerializer(many=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'date', 'description', 'created_at', 
            'created_by', 'created_by_username', 'items'
        ]
        read_only_fields = ['created_at', 'created_by']

    def validate_items(self, items):
        """
        Valida la lista de items.
        """
        if not items:
            raise serializers.ValidationError("Un asiento debe tener al menos una línea de item.")
        if len(items) < 2:
            raise serializers.ValidationError("Un asiento de partida doble debe tener al menos dos líneas (Debe y Haber).")
        return items

    def validate(self, data):
        """
        Valida la regla de oro de la partida doble: Debe == Haber.
        """
        items = data.get('items')
        if items:
            debits = sum(item.get('debit', 0) for item in items)
            credits = sum(item.get('credit', 0) for item in items)

            if debits == 0 or credits == 0:
                raise serializers.ValidationError("El total de Débitos y Créditos debe ser mayor que cero.")

            if debits != credits:
                raise serializers.ValidationError(
                    f"El asiento no está balanceado: Débitos ({debits}) != Créditos ({credits})"
                )
        return data

    @transaction.atomic
    def create(self, validated_data):
        """
        Sobrescribe el método 'create' para manejar la creación anidada.
        """
        # 1. Extraer los datos de los items
        items_data = validated_data.pop('items')

        # 2. Crear la cabecera del Asiento (JournalEntry)
        # El 'created_by' se añadirá en el ViewSet
        entry = JournalEntry.objects.create(**validated_data)

        # 3. Crear cada línea de Item enlazada al Asiento
        for item_data in items_data:
            JournalItem.objects.create(journal_entry=entry, **item_data)

        return entry