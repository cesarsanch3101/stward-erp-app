import apiClient from './axios';

// --- PLAN DE CUENTAS (CHART OF ACCOUNTS) ---

export const getAccounts = async (token) => {
  try {
    const response = await apiClient.get('/accounts/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const createAccount = async (data, token) => {
  try {
    const response = await apiClient.post('/accounts/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error; // Propagar error para manejarlo en la UI
  }
};

// --- ASIENTOS DE DIARIO (JOURNAL ENTRIES) ---

export const createJournalEntry = async (entryData, token) => {
  try {
    const response = await apiClient.post('/journal-entries/', entryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    // Extraer mensaje detallado del backend (ej: "El asiento no cuadra")
    const errorMsg = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : error.message;
    throw new Error(errorMsg);
  }
};