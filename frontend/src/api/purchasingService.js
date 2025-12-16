import apiClient from './axios';

// --- PROVEEDORES ---

// Obtener proveedores (Limpio)
export const getSuppliers = async () => {
  const response = await apiClient.get('/suppliers/');
  return response.data;
};

// Crear proveedor (Limpio)
export const createSupplier = async (data) => {
  try {
    const response = await apiClient.post('/suppliers/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// Eliminar proveedor (Limpio)
export const deleteSupplier = async (id) => {
  await apiClient.delete(`/suppliers/${id}/`);
};

// Obtener detalles de un proveedor (Para la edición futura)
export const getSupplierDetails = async (id) => {
  const response = await apiClient.get(`/suppliers/${id}/`);
  return response.data;
};

// Actualizar proveedor
export const updateSupplier = async (id, data) => {
  try {
    const response = await apiClient.put(`/suppliers/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// --- ÓRDENES DE COMPRA ---

export const getPurchaseOrders = async () => {
  const response = await apiClient.get('/purchase-orders/');
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