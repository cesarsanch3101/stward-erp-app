import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. CAMBIO: Al iniciar, intentamos leer los tokens desde la "caja fuerte" (localStorage)
  const [tokens, setTokens] = useState(() => {
    const storedTokens = localStorage.getItem('tokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  // 2. CAMBIO: Al iniciar sesión, guardamos en el estado Y en la "caja fuerte"
  const loginAction = (data) => {
    setTokens(data);
    localStorage.setItem('tokens', JSON.stringify(data));
  };

  // 3. CAMBIO: Al cerrar sesión, limpiamos el estado Y la "caja fuerte"
  const logOut = () => {
    setTokens(null);
    localStorage.removeItem('tokens');
  };

  // El 'value' que compartimos es el mismo
  const value = {
    tokens,
    loginAction,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};