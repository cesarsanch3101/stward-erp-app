import apiClient from './axios';

// Function to get the list of all suppliers
export const getSuppliers = async (token) => {
  try {
    const response = await apiClient.get('/suppliers/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error; // Re-throw to be caught by the component
  }
};

export const createSupplier = async (supplierData, token) => {
  try {
    const response = await apiClient.post('/suppliers/', supplierData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Devuelve los datos del proveedor creado
  } catch (error) {
    console.error("Error creating supplier:", error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Failed to create supplier');
    throw new Error(errorDetail);
  }
};
// Función para obtener los detalles de UN proveedor específico
export const getSupplierDetails = async (id, token) => {
  try {
    const response = await apiClient.get(`/suppliers/${id}/`, { // Note the URL change
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    throw error;
  }
};

// Función para actualizar un proveedor existente
export const updateSupplier = async (id, supplierData, token) => {
  try {
    // Use PUT for full updates or PATCH for partial updates
    const response = await apiClient.put(`/suppliers/${id}/`, supplierData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Failed to update supplier ${id}`);
    throw new Error(errorDetail);
  }
};

// Función para borrar un proveedor
export const deleteSupplier = async (id, token) => {
  try {
    // DELETE request doesn't usually return content on success (status 204)
    await apiClient.delete(`/suppliers/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // No explicit return needed for success (or return true/status)
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || `Failed to delete supplier ${id}`);
    throw new Error(errorDetail);
  }
};
// --- NUEVA FUNCION: Recibir Mercadería ---
export const receivePurchaseOrder = async (id, token) => {
  try {
    const response = await apiClient.post(`/purchase-orders/${id}/receive/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error receiving PO ${id}:`, error);
    const errorMsg = error.response?.data?.detail || error.message || 'Error al recibir mercadería.';
    throw new Error(errorMsg);
  }
};
// --- ÓRDENES DE COMPRA (PURCHASE ORDERS) ---

export const getPurchaseOrders = async (token) => {
  try {
    const response = await apiClient.get('/purchase-orders/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
};

export const createPurchaseOrder = async (orderData, token) => {
  try {
    const response = await apiClient.post('/purchase-orders/', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating purchase order:", error);
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(errorMsg);
  }
};