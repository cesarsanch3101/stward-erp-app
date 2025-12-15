import apiClient from './axios';

export const getAccounts = async () => {
  const response = await apiClient.get('/accounts/');
  return response.data;
};

export const getAccountById = async (id) => {
  const response = await apiClient.get(`/accounts/${id}/`);
  return response.data;
};

export const createAccount = async (data) => {
  const response = await apiClient.post('/accounts/', data);
  return response.data;
};

export const updateAccount = async (id, data) => {
  const response = await apiClient.put(`/accounts/${id}/`, data);
  return response.data;
};

export const getJournalEntries = async () => {
  const response = await apiClient.get('/journal-entries/');
  return response.data;
};

export const createJournalEntry = async (entryData) => {
  const response = await apiClient.post('/journal-entries/', entryData);
  return response.data;
};