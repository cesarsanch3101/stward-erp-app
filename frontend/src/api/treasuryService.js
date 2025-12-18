import apiClient from './axios';

export const getBankAccounts = async (page = 1, pageSize = 25) => {
  // Manejo dual: si se llama sin args (ej: modal) o con args (ej: lista paginada)
  const query = page ? `?page=${page}&page_size=${pageSize}` : '';
  const response = await apiClient.get(`/bank-accounts/${query}`);
  return response.data;
};

export const getCashRegisters = async () => {
  const response = await apiClient.get('/cash-registers/');
  return response.data.results || response.data;
};

export const createBankAccount = async (data) => {
  const response = await apiClient.post('/bank-accounts/', data);
  return response.data;
};

export const getTreasuryMovements = async (page = 1, pageSize = 25) => {
  const response = await apiClient.get(`/treasury-movements/?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const createTreasuryMovement = async (data) => {
  const response = await apiClient.post('/treasury-movements/', data);
  return response.data;
};