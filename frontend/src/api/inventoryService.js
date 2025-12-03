import apiClient from './axios';

// Function to get the list of all products
export const getProducts = async (token) => {
  try {
    const response = await apiClient.get('/products/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // Re-throw to be caught by the component
  }
};

// Función para obtener la lista de todas las Categorías
export const getCategories = async (token) => {
  try {
    const response = await apiClient.get('/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Función para obtener la lista de todas las Unidades de Medida
export const getUnitsOfMeasure = async (token) => {
  try {
    const response = await apiClient.get('/units/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching units of measure:", error);
    throw error;
  }
};
export const createProduct = async (productData, token) => {
  try {
    const response = await apiClient.post('/products/', productData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Return the created product data
  } catch (error) {
    console.error("Error creating product:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to create product');
  }
};
// Función para eliminar un producto
export const deleteProduct = async (id, token) => {
  try {
    await apiClient.delete(`/products/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};