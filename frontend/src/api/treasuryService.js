import apiClient from './axios';

// --- CUENTAS BANCARIAS ---

// Obtener todas las cuentas bancarias
export const getBankAccounts = async (token) => {
  try {
    const response = await apiClient.get('/bank-accounts/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    throw error;
  }
};

// Crear una nueva cuenta bancaria
export const createBankAccount = async (data, token) => {
  try {
    const response = await apiClient.post('/bank-accounts/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw error;
  }
};

// --- MOVIMIENTOS DE TESORERÍA ---

// Obtener todos los movimientos
export const getTreasuryMovements = async (token) => {
  try {
    const response = await apiClient.get('/treasury-movements/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching movements:", error);
    throw error;
  }
};

// Registrar un nuevo movimiento (Ingreso/Egreso/Transferencia)
export const createTreasuryMovement = async (data, token) => {
  try {
    const response = await apiClient.post('/treasury-movements/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating movement:", error);
    // Extraemos el mensaje de error detallado si existe
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(errorMsg);
  }
};