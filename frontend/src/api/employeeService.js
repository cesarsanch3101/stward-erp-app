import apiClient from './axios';

// ACTUALIZADO: Soporte para paginación
export const getEmployees = async (page = 1, pageSize = 25) => {
  const response = await apiClient.get(`/employees/?page=${page}&page_size=${pageSize}`);
  return response.data; // Retorna { count, results }
};

export const createEmployee = async (employeeData) => {
  const response = await apiClient.post('/employees/', employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  await apiClient.delete(`/employees/${id}/`);
};

export const getEmployee = async (id) => {
  const response = await apiClient.get(`/employees/${id}/`);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await apiClient.put(`/employees/${id}/`, employeeData);
  return response.data;
};