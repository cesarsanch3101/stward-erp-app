import apiClient from './axios';

// --- LECTURA ---
export const getProducts = async () => {
  const response = await apiClient.get('/products/');
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  return response.data;
};

export const getUnitsOfMeasure = async () => {
  const response = await apiClient.get('/units/');
  return response.data;
};

export const getProductKardex = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}/kardex/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching kardex:", error);
    return [];
  }
};

// --- ESCRITURA ---
export const createProduct = async (data) => {
  try {
    const response = await apiClient.post('/products/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const deleteProduct = async (id) => {
  await apiClient.delete(`/products/${id}/`);
};