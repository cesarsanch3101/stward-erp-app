import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = () => {
  // 1. Revisa la "cartera" para ver si tenemos un token
  const { tokens } = useAuth();

  // 2. Comprueba si el usuario está autenticado
  if (!tokens) {
    // 3. Si no hay token, redirige al usuario a la página de login
    return <Navigate to="/login" />;
  }

  // 4. Si hay un token, permite el acceso a la ruta solicitada (Dashboard, Empleados, etc.)
  return <Outlet />;
};

export default ProtectedRoute;