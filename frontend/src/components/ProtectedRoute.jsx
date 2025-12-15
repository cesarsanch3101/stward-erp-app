import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  // Ahora usamos 'isAuthenticated' y 'loading' del nuevo AuthContext
  const { isAuthenticated, loading } = useAuth();

  // Esperamos a que la verificación de sesión termine
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado, al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si todo bien, mostramos la app
  return <Outlet />;
};

export default ProtectedRoute;