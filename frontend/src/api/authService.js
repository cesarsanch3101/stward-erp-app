import apiClient from './axios';

const login = async (username, password) => {
  // El backend seteará la cookie HttpOnly automáticamente en la respuesta
  const response = await apiClient.post('/auth/login/', {
    username,
    password,
  });
  // Devolvemos los datos del usuario (username, email, etc.)
  return response.data;
};

export { login };