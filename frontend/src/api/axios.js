import axios from 'axios';

// Creamos una "instancia" de Axios con una configuración por defecto.
const apiClient = axios.create({
  // Esta es la dirección base de nuestra API de Django.
  // ¡Asegúrate de que el puerto (8000 o 8001) sea el correcto para ti!
  baseURL: 'http://localhost:8000/api/v1/',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;