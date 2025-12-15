import apiClient from './axios';

// Obtener empleados (Sin token manual)
export const getEmployees = async () => {
  const response = await apiClient.get('/employees/');
  return response.data;
};

// Crear empleado
export const createEmployee = async (employeeData) => {
  const response = await apiClient.post('/employees/', employeeData);
  return response.data;
};

// Borrar empleado
export const deleteEmployee = async (id) => {
  await apiClient.delete(`/employees/${id}/`);
};

// Obtener uno
export const getEmployee = async (id) => {
  const response = await apiClient.get(`/employees/${id}/`);
  return response.data;
};

// Actualizar
export const updateEmployee = async (id, employeeData) => {
  const response = await apiClient.put(`/employees/${id}/`, employeeData);
  return response.data;
};