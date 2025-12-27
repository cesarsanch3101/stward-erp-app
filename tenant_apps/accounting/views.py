from rest_framework import viewsets
from .models import Account, JournalEntry
from .serializers import AccountSerializer, JournalEntrySerializer

class AccountViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar el Plan de Cuentas.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    # Opcional: Para optimizar, podríamos añadir .prefetch_related('children')
    # si a menudo necesitamos mostrar el árbol completo.

class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    Endpoint de la API que permite ver o editar Asientos Contables.
    Maneja la validación de partida doble a través del serializer.
    """
    # Optimizamos la consulta precargando los items y las cuentas relacionadas
    queryset = JournalEntry.objects.all().prefetch_related(
        'items', 'items__account'
    )
    serializer_class = JournalEntrySerializer

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado al crear el asiento
        serializer.save(created_by=self.request.user)