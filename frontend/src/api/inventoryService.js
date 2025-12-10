import apiClient from './axios';

export const getProducts = async (token) => {
  const response = await apiClient.get('/products/', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const getCategories = async (token) => {
  const response = await apiClient.get('/categories/', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const getUnitsOfMeasure = async (token) => {
  const response = await apiClient.get('/units/', { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const createProduct = async (data, token) => {
  try {
    const response = await apiClient.post('/products/', data, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const deleteProduct = async (id, token) => {
  await apiClient.delete(`/products/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
};

// NUEVO: Obtener Kardex
export const getProductKardex = async (productId, token) => {
  try {
    const response = await apiClient.get(`/products/${productId}/kardex/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching kardex:", error);
    return [];
  }
};