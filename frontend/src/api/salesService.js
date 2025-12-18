import apiClient from './axios';

// --- CLIENTES ---

export const getCustomers = async (page = 1, pageSize = 25) => {
  // Ahora soportamos paginación opcional para clientes también
  const response = await apiClient.get(`/customers/?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  try {
    const response = await apiClient.post('/customers/', customerData);
    return response.data;
  } catch (error) {
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error al crear cliente');
    throw new Error(errorDetail);
  }
};

export const getCustomerDetails = async (id) => {
  const response = await apiClient.get(`/customers/${id}/`);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await apiClient.put(`/customers/${id}/`, customerData);
    return response.data;
  } catch (error) {
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Error al actualizar cliente`);
    throw new Error(errorDetail);
  }
};

export const deleteCustomer = async (id) => {
  try {
    await apiClient.delete(`/customers/${id}/`);
  } catch (error) {
    throw new Error("No se pudo eliminar el cliente.");
  }
};

// --- ÓRDENES DE VENTA ---

// ACTUALIZADO: Paginación
export const getSalesOrders = async (page = 1, pageSize = 25) => {
  const response = await apiClient.get(`/sales-orders/?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const getSalesOrder = async (id) => {
  const response = await apiClient.get(`/sales-orders/${id}/`);
  return response.data;
};

export const createSalesOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/sales-orders/', orderData);
    return response.data;
  } catch (error) {
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error al crear orden');
    throw new Error(errorDetail);
  }
};

export const invoiceSalesOrder = async (id) => {
  try {
    const response = await apiClient.post(`/sales-orders/${id}/invoice/`, {});
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message || 'Error al facturar.';
    throw new Error(errorMsg);
  }
};