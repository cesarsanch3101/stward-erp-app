import apiClient from './axios';

// --- PROVEEDORES ---
export const getSuppliers = async (token) => {
  const response = await apiClient.get('/suppliers/', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const createSupplier = async (data, token) => {
  try {
    const response = await apiClient.post('/suppliers/', data, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const deleteSupplier = async (id, token) => {
  await apiClient.delete(`/suppliers/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
};

// --- ÓRDENES DE COMPRA ---
export const getPurchaseOrders = async (token) => {
  const response = await apiClient.get('/purchase-orders/', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const createPurchaseOrder = async (data, token) => {
  try {
    const response = await apiClient.post('/purchase-orders/', data, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(errorMsg);
  }
};

// NUEVO: Eliminar Orden
export const deletePurchaseOrder = async (id, token) => {
  try {
    await apiClient.delete(`/purchase-orders/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Error al eliminar orden.");
  }
};

// NUEVO: Recibir Orden
export const receivePurchaseOrder = async (id, token) => {
  try {
    const response = await apiClient.post(`/purchase-orders/${id}/receive/`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Error al recibir mercadería.");
  }
};