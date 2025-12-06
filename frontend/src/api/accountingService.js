import apiClient from './axios';

// --- PLAN DE CUENTAS (CHART OF ACCOUNTS) ---

// Obtener todas las cuentas
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

// Obtener una cuenta por ID (para edición)
export const getAccountById = async (id, token) => {
  try {
    const response = await apiClient.get(`/accounts/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching account ${id}:`, error);
    throw error;
  }
};

// Crear una nueva cuenta
export const createAccount = async (data, token) => {
  try {
    const response = await apiClient.post('/accounts/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

// Actualizar una cuenta
export const updateAccount = async (id, data, token) => {
  try {
    const response = await apiClient.put(`/accounts/${id}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

// --- ASIENTOS DE DIARIO (JOURNAL ENTRIES) ---

// ¡ESTA ES LA FUNCIÓN QUE FALTABA!
export const getJournalEntries = async (token) => {
  try {
    const response = await apiClient.get('/journal-entries/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

// Crear un nuevo asiento
export const createJournalEntry = async (entryData, token) => {
  try {
    const response = await apiClient.post('/journal-entries/', entryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    // Extraer mensaje detallado del backend
    const errorMsg = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : error.message;
    throw new Error(errorMsg);
  }
};