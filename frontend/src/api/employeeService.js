import apiClient from './axios';

// Función para obtener la lista de todos los empleados
export const getEmployees = async (token) => {
  try {
    const response = await apiClient.get('/employees/', {
      // Adjuntamos el token en la cabecera de autorización
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
// Función para crear un nuevo empleado
export const createEmployee = async (employeeData, token) => {
  try {
    const response = await apiClient.post('/employees/', employeeData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Devuelve los datos del empleado creado
  } catch (error) {
    console.error("Error creating employee:", error.response?.data || error.message);
    // Lanza un error más específico si está disponible
    throw new Error(error.response?.data?.detail || error.message || 'Failed to create employee');
  }
};

export const deleteEmployee = async (id, token) => {
  try {
    await apiClient.delete(`/employees/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // No necesitamos devolver nada específico si el borrado es exitoso
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
};
// Obtener un solo empleado por ID
export const getEmployee = async (id, token) => {
  try {
    const response = await apiClient.get(`/employees/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

// Actualizar un empleado existente
export const updateEmployee = async (id, employeeData, token) => {
  try {
    const response = await apiClient.put(`/employees/${id}/`, employeeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
};