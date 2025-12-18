import apiClient from './axios';

// --- LECTURA ---

// ACTUALIZADO: Soporte para paginación
export const getProducts = async (page = 1, pageSize = 25) => {
  const response = await apiClient.get(`/products/?page=${page}&page_size=${pageSize}`);
  return response.data; // Devuelve { count, results }
};

export const getCategories = async () => {
  const response = await apiClient.get('/categories/');
  // Manejo robusto por si activamos paginación en categorías a futuro
  return Array.isArray(response.data) ? response.data : (response.data.results || []);
};

export const getUnitsOfMeasure = async () => {
  const response = await apiClient.get('/units/');
  return Array.isArray(response.data) ? response.data : (response.data.results || []);
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