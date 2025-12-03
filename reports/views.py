from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, DecimalField, Value
from django.db.models.functions import Coalesce
from accounting.models import Account, JournalItem
from decimal import Decimal # <-- IMPORTAR Decimal


class ProfitAndLossAPIView(APIView):
    """
    API endpoint para generar un reporte de Estado de Resultados
    (Ganancias y Pérdidas) simple.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date = '2025-01-01'
        end_date = '2025-12-31'

        # Definimos un valor Decimal(0) explícito
        zero_decimal = Value(Decimal('0.0'), output_field=DecimalField())

        # 2. Calcular el total de Ingresos (son Créditos)
        total_revenue = JournalItem.objects.filter(
            account__account_type='REVENUE',
            journal_entry__date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('credit'), zero_decimal) # <-- CORREGIDO
        )['total']

        # 3. Calcular el total de Gastos (son Débitos)
        total_expense = JournalItem.objects.filter(
            account__account_type='EXPENSE',
            journal_entry__date__range=[start_date, end_date]
        ).aggregate(
            total=Coalesce(Sum('debit'), zero_decimal) # <-- CORREGIDO
        )['total']

        net_profit = total_revenue - total_expense

        report_data = {
            'start_date': start_date,
            'end_date': end_date,
            'total_revenue': total_revenue,
            'total_expense': total_expense,
            'net_profit': net_profit,
        }
        return Response(report_data)

class BalanceSheetAPIView(APIView):
    """
    API endpoint para generar un reporte de Balance General
    (Estado de Situación Financiera).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        as_of_date = '2025-12-31'

        # Definimos un valor Decimal(0) explícito
        zero_decimal = Value(Decimal('0.0'), output_field=DecimalField())

        # 2. Calcular saldos
        assets_balance = JournalItem.objects.filter(
            account__account_type='ASSET',
            journal_entry__date__lte=as_of_date
        ).aggregate(
            total=Coalesce(Sum('debit'), zero_decimal) - Coalesce(Sum('credit'), zero_decimal) # <-- CORREGIDO
        )['total']

        liabilities_balance = JournalItem.objects.filter(
            account__account_type='LIABILITY',
            journal_entry__date__lte=as_of_date
        ).aggregate(
            total=Coalesce(Sum('credit'), zero_decimal) - Coalesce(Sum('debit'), zero_decimal) # <-- CORREGIDO
        )['total']

        equity_base_balance = JournalItem.objects.filter(
            account__account_type='EQUITY',
            journal_entry__date__lte=as_of_date
        ).aggregate(
            total=Coalesce(Sum('credit'), zero_decimal) - Coalesce(Sum('debit'), zero_decimal) # <-- CORREGIDO
        )['total']

        # 3. Calcular Ganancia/Pérdida Neta
        total_revenue = JournalItem.objects.filter(
            account__account_type='REVENUE',
            journal_entry__date__lte=as_of_date
        ).aggregate(total=Coalesce(Sum('credit'), zero_decimal) - Coalesce(Sum('debit'), zero_decimal))['total'] # <-- CORREGIDO

        total_expense = JournalItem.objects.filter(
            account__account_type='EXPENSE',
            journal_entry__date__lte=as_of_date
        ).aggregate(total=Coalesce(Sum('debit'), zero_decimal) - Coalesce(Sum('credit'), zero_decimal))['total'] # <-- CORREGIDO

        net_profit = total_revenue - total_expense

        # 4. Calcular Patrimonio Total
        total_equity = equity_base_balance + net_profit

        # 5. Preparar la respuesta
        report_data = {
            'as_of_date': as_of_date,
            'assets': assets_balance,
            'liabilities': liabilities_balance,
            'equity': total_equity,
            'check': {
                'total_assets': assets_balance,
                'total_liabilities_plus_equity': liabilities_balance + total_equity,
                'is_balanced': assets_balance == (liabilities_balance + total_equity)
            }
        }

        return Response(report_data)