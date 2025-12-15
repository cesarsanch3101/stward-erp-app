import apiClient from './axios';

export const getBankAccounts = async () => {
  const response = await apiClient.get('/bank-accounts/');
  return response.data;
};

export const getCashRegisters = async () => {
  const response = await apiClient.get('/cash-registers/');
  return response.data;
};

export const createBankAccount = async (data) => {
  const response = await apiClient.post('/bank-accounts/', data);
  return response.data;
};

export const getTreasuryMovements = async () => {
  const response = await apiClient.get('/treasury-movements/');
  return response.data;
};

export const createTreasuryMovement = async (data) => {
  const response = await apiClient.post('/treasury-movements/', data);
  return response.data;
};