import apiClient from './axios';

// Esta función será nuestra instrucción para "iniciar sesión".
const login = async (username, password) => {
  try {
    // Hacemos una petición POST al endpoint '/token/'.
    // Como ya configuramos la baseURL, no necesitamos escribir la URL completa.
    const response = await apiClient.post('/token/', {
      username: username,
      password: password,
    });

    // Si la petición es exitosa, devolvemos los datos (los tokens).
    return response.data;
  } catch (error) {
    // Si hay un error (ej: contraseña incorrecta), lo lanzamos para que
    // el componente que llamó a esta función sepa que algo salió mal.
    throw error;
  }
};

// Exportamos la función para poder usarla en otras partes de la aplicación.
export { login };