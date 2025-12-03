import apiClient from './axios';

// Función para obtener el reporte de Ganancias y Pérdidas
export const getProfitAndLoss = async (token) => {
  try {
    const response = await apiClient.get('/reports/profit-and-loss/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching P&L report:", error);
    throw error;
  }
};

// Más adelante podríamos añadir getBalanceSheet aquí