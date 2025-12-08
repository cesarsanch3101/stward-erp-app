import apiClient from './axios';

// Función para obtener la lista de todos los clientes
export const getCustomers = async (token) => {
  try {
    const response = await apiClient.get('/customers/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error; // Re-throw to be caught by the component
  }
};
// Función para crear un nuevo cliente
export const createCustomer = async (customerData, token) => {
  try {
    const response = await apiClient.post('/customers/', customerData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Devuelve los datos del cliente creado
  } catch (error) {
    console.error("Error creating customer:", error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Failed to create customer');
    throw new Error(errorDetail);
  }
};
// Función para obtener los detalles de UN cliente específico
export const getCustomerDetails = async (id, token) => {
  try {
    const response = await apiClient.get(`/customers/${id}/`, { // Nota el cambio en la URL
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};
// Función para actualizar un cliente existente
export const updateCustomer = async (id, customerData, token) => {
  try {
    const response = await apiClient.put(`/customers/${id}/`, customerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Failed to update customer ${id}`);
    throw new Error(errorDetail);
  }
};

// Función para borrar un cliente
export const deleteCustomer = async (id, token) => {
  try {
    await apiClient.delete(`/customers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Failed to delete customer ${id}`);
    throw new Error(errorDetail);
  }
};
// Función para obtener la lista de todas las Órdenes de Venta
export const getSalesOrders = async (token) => {
  try {
    const response = await apiClient.get('/sales-orders/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    throw error; // Re-throw to be caught by the component
  }
};
// Función para crear una nueva Orden de Venta (con sus items)
export const createSalesOrder = async (orderData, token) => {
  try {
    const response = await apiClient.post('/sales-orders/', orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Devuelve la orden de venta creada
  } catch (error) {
    console.error("Error creating sales order:", error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Failed to create sales order');
    throw new Error(errorDetail);
  }
};
// FUNCIÓN: Facturar Orden (Generar Asiento) ---
export const invoiceSalesOrder = async (id, token) => {
  try {
    // Llamamos al endpoint personalizado que creamos en Django
    const response = await apiClient.post(`/sales-orders/${id}/invoice/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error facturando orden ${id}:`, error);
    // Extraemos el mensaje de error limpio del backend (ej: "Falta cuenta contable")
    const errorMsg = error.response?.data?.detail || error.message || 'Error al facturar.';
    throw new Error(errorMsg);
  }
};
// Obtener detalles de una orden específica
export const getSalesOrder = async (id, token) => {
  try {
    const response = await apiClient.get(`/sales-orders/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};