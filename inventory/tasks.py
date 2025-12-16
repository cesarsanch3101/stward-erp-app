from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from .models import Product, ProductDemand
from sales.models import SOItem
import numpy as np
# from sklearn.linear_model import LinearRegression (Asumimos instalado)

@shared_task
def predict_stock_demand():
    """
    Tarea programada (Celery Beat) para predecir la demanda del próximo mes.
    Ejecuta un modelo simple de series de tiempo.
    """
    print("🧠 Iniciando Motor de IA: Predicción de Demanda...")
    
    products = Product.objects.all()
    today = timezone.now().date()
    next_month = today + timedelta(days=30)

    for product in products:
        # 1. Obtener datos históricos (últimos 6 meses)
        # En un sistema real, agruparíamos por mes.
        history = SOItem.objects.filter(
            product=product,
            sales_order__status__in=['Confirmed', 'Invoiced', 'Shipped'],
            sales_order__order_date__gte=today - timedelta(days=180)
        ).values('sales_order__order_date').annotate(qty=Sum('quantity')).order_by('sales_order__order_date')

        if not history:
            continue

        # 2. Preprocesamiento (Mockup de lógica ML)
        # Transformar fechas a ordinales para regresión
        dates = []
        quantities = []
        for entry in history:
            dates.append(entry['sales_order__order_date'].toordinal())
            quantities.append(float(entry['qty']))

        if len(dates) < 5:
            # Datos insuficientes para IA
            continue

        # 3. Inferencia (Simulada sin libs pesadas para no romper el build si no están instaladas)
        # Aquí usarías: model.fit(X, y) -> model.predict(next_month)
        avg_daily_sales = np.mean(quantities) if quantities else 0
        predicted_qty = avg_daily_sales * 30 # Proyección lineal simple

        # Lógica de negocio sobre la predicción
        action = 'Mantener'
        if predicted_qty > float(product.current_stock):
            action = 'Restock'
        elif predicted_qty < (float(product.current_stock) * 0.2):
            action = 'Overstock'

        # 4. Guardar Predicción
        ProductDemand.objects.create(
            product=product,
            forecast_period_start=today,
            forecast_period_end=next_month,
            predicted_quantity=predicted_qty,
            confidence_score=0.85, # Mock score
            recommended_action=action
        )
        
    print("✅ Predicción Finalizada.")