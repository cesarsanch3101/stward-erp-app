import axios from 'axios';

// Detectar entorno para la URL base
const currentHost = window.location.hostname;

// En desarrollo con Vite proxy, la base es relativa. En producción, apuntaría al dominio real.
const baseURL = import.meta.env.PROD 
  ? `https://${currentHost}/api/v1/` 
  : `http://${currentHost}:8000/api/v1/`;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  // ¡CRÍTICO! Esto permite enviar/recibir cookies (HttpOnly Refresh Token)
  withCredentials: true 
});

// Interceptor para manejar errores globales (ej: sesión expirada)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autorizada.");
      // Opcional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;