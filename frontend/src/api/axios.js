import axios from 'axios';

// 1. Detectar en qué dominio está el usuario (ej: tesla.localhost)
const currentHost = window.location.hostname;

// 2. Construir la URL base dinámicamente
// Si estoy en "tesla.localhost", la API también será "tesla.localhost:8000"
const baseURL = `http://${currentHost}:8000/api/v1/`;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;