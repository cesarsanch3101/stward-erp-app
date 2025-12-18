import apiClient from './axios';

// --- CLIENTES ---

// Obtener lista de clientes
export const getCustomers = async () => {
  const response = await apiClient.get('/customers/');
  return response.data;
};

// Crear cliente
export const createCustomer = async (customerData) => {
  try {
    const response = await apiClient.post('/customers/', customerData);
    return response.data;
  } catch (error) {
    console.error("Error creating customer:", error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error al crear cliente');
    throw new Error(errorDetail);
  }
};

// Obtener detalles de un cliente
export const getCustomerDetails = async (id) => {
  const response = await apiClient.get(`/customers/${id}/`);
  return response.data;
};

// Actualizar cliente
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await apiClient.put(`/customers/${id}/`, customerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Error al actualizar cliente`);
    throw new Error(errorDetail);
  }
};

// Borrar cliente
export const deleteCustomer = async (id) => {
  try {
    await apiClient.delete(`/customers/${id}/`);
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error.response?.data || error.message);
    throw new Error("No se pudo eliminar el cliente.");
  }
};

// --- ÓRDENES DE VENTA ---

export const getSalesOrders = async () => {
  const response = await apiClient.get('/sales-orders/');
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
    console.error("Error creating sales order:", error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Error al crear orden');
    throw new Error(errorDetail);
  }
};

// Facturar Orden (Generar Asiento)
export const invoiceSalesOrder = async (id) => {
  try {
    const response = await apiClient.post(`/sales-orders/${id}/invoice/`, {});
    return response.data;
  } catch (error) {
    console.error(`Error facturando orden ${id}:`, error);
    const errorMsg = error.response?.data?.detail || error.message || 'Error al facturar.';
    throw new Error(errorMsg);
  }
};