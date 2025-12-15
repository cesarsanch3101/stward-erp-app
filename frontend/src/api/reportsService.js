import apiClient from './axios';

// Función para obtener el reporte de Ganancias y Pérdidas
// NOTA: Ya no recibe 'token' como argumento
export const getProfitAndLoss = async () => {
  try {
    // La cookie viaja sola gracias a withCredentials: true en axios.js
    const response = await apiClient.get('/reports/profit-and-loss/');
    return response.data;
  } catch (error) {
    console.error("Error fetching P&L report:", error);
    throw error;
  }
};

// Más adelante podríamos añadir getBalanceSheet aquí