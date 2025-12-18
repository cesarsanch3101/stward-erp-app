import apiClient from './axios';

// --- PROVEEDORES ---
export const getSuppliers = async () => {
  const response = await apiClient.get('/suppliers/');
  return response.data.results || response.data;
};

export const createSupplier = async (data) => {
  try {
    const response = await apiClient.post('/suppliers/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const deleteSupplier = async (id) => {
  await apiClient.delete(`/suppliers/${id}/`);
};

export const updateSupplier = async (id, data) => {
  try {
    const response = await apiClient.put(`/suppliers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// --- ÓRDENES DE COMPRA ---

export const getPurchaseOrders = async (page = 1, pageSize = 25) => {
  const response = await apiClient.get(`/purchase-orders/?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const createPurchaseOrder = async (data) => {
  try {
    const response = await apiClient.post('/purchase-orders/', data);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(errorMsg);
  }
};

export const deletePurchaseOrder = async (id) => {
  try {
    await apiClient.delete(`/purchase-orders/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Error al eliminar orden.");
  }
};

export const receivePurchaseOrder = async (id) => {
  try {
    const response = await apiClient.post(`/purchase-orders/${id}/receive/`, {});
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Error al recibir mercadería.");
  }
};

// --- NUEVO: OCR ---
export const uploadInvoiceOCR = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/purchase-orders/upload-invoice/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Crucial para archivos
    },
  });
  return response.data;
};