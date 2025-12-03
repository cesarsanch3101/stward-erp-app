from rest_framework import viewsets
from .models import BankAccount, CashRegister, TreasuryMovement
from .serializers import BankAccountSerializer, CashRegisterSerializer, TreasuryMovementSerializer

class BankAccountViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar cuentas bancarias.
    """
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer

class CashRegisterViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar cajas chicas.
    """
    queryset = CashRegister.objects.all()
    serializer_class = CashRegisterSerializer

class TreasuryMovementViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar movimientos de tesorería.
    """
    # Optimizamos la consulta precargando los nombres relacionados
    queryset = TreasuryMovement.objects.all().select_related(
        'from_bank_account', 'from_cash_register',
        'to_bank_account', 'to_cash_register',
        'customer', 'supplier', 'processed_by'
    )
    serializer_class = TreasuryMovementSerializer

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado al crear un movimiento
        serializer.save(processed_by=self.request.user)

        # NOTA AVANZADA: Aquí es donde, en el futuro, añadiríamos
        # la lógica para actualizar el 'current_balance' de
        # las cuentas bancarias o cajas afectadas por este movimiento.