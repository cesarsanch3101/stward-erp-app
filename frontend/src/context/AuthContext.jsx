import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app
  useEffect(() => {
    // Aquí idealmente verificaríamos la sesión contra el backend (/users/me)
    // Por ahora, asumimos que no hay usuario hasta que haga login explícito
    setLoading(false);
  }, []);

  const loginAction = async (userData) => {
    // Recibimos datos del usuario, NO tokens. La cookie ya se guardó sola.
    setUser(userData); 
    return true;
  };

  const logOut = async () => {
    try {
      await apiClient.post('/auth/logout/'); // El backend borrará la cookie
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user, // Booleano simple
    loginAction,
    logOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};