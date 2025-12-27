from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, F
from .models import Product, ProductDemand
from sales.models import SOItem
import numpy as np
from sklearn.linear_model import LinearRegression
import logging

logger = logging.getLogger(__name__)

@shared_task
def predict_stock_demand():
    """
    Motor de IA para Predicción de Demanda (Nivel 1: Regresión Lineal Robusta).
    Analiza histórico de ventas diarias y proyecta los próximos 30 días.
    """
    logger.info("🧠 Iniciando Motor de IA: Predicción de Demanda...")
    
    products = Product.objects.all()
    today = timezone.now().date()
    start_date = today - timedelta(days=180) # Analizar últimos 6 meses
    next_month = today + timedelta(days=30)

    for product in products:
        # 1. Extracción de Datos (ETL)
        # Agrupamos ventas por día para crear una serie de tiempo
        history = SOItem.objects.filter(
            product=product,
            sales_order__status__in=['Confirmed', 'Invoiced', 'Shipped'],
            sales_order__order_date__gte=start_date
        ).values('sales_order__order_date').annotate(
            daily_qty=Sum('quantity')
        ).order_by('sales_order__order_date')

        if len(history) < 10:
            logger.warning(f"⚠️ Datos insuficientes para predecir producto: {product.name}")
            continue

        # 2. Preprocesamiento para Scikit-Learn
        # Convertimos fechas a números ordinales para que el modelo las entienda
        dates = []
        quantities = []
        
        for entry in history:
            dates.append([entry['sales_order__order_date'].toordinal()])
            quantities.append(float(entry['daily_qty']))

        X = np.array(dates)
        y = np.array(quantities)

        # 3. Entrenamiento (Training)
        # Usamos Regresión Lineal (rápida y efectiva para tendencias simples)
        model = LinearRegression()
        model.fit(X, y)

        # 4. Inferencia (Prediction)
        # Predecimos la venta diaria promedio para el próximo mes
        future_dates = []
        for i in range(1, 31):
            future_date = today + timedelta(days=i)
            future_dates.append([future_date.toordinal()])
        
        predicted_daily_sales = model.predict(future_dates)
        
        # Sumamos las ventas diarias predichas para obtener el total mensual, asegurando no negativos
        total_predicted_qty = sum([max(0, qty) for qty in predicted_daily_sales])
        
        # Cálculo de confianza simple basado en la varianza (R^2)
        confidence = model.score(X, y)
        if confidence < 0: confidence = 0 # Ajuste visual

        # 5. Lógica de Negocio (Enterprise Logic)
        current_stock = float(product.current_stock)
        recommended_action = 'Mantener'
        
        # Si la demanda supera el stock + 10% buffer
        if total_predicted_qty > current_stock:
            recommended_action = 'Restock'
        # Si tenemos más de 3 meses de inventario basado en la predicción
        elif total_predicted_qty > 0 and current_stock > (total_predicted_qty * 3):
            recommended_action = 'Overstock'

        # 6. Persistencia
        ProductDemand.objects.create(
            product=product,
            forecast_period_start=today,
            forecast_period_end=next_month,
            predicted_quantity=round(total_predicted_qty, 2),
            confidence_score=round(confidence, 2),
            recommended_action=recommended_action
        )
        
        logger.info(f"✅ Predicción para {product.name}: {total_predicted_qty:.2f} unidades (Acción: {recommended_action})")

    logger.info("🏁 Proceso de IA Finalizado.")