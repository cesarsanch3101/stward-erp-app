import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
// ¡Importamos nuestro nuevo menú lateral!
import SideNav from './SideNav';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>

      {/* Barra de Navegación Superior (AppBar) */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stward ERP
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ¡Añadimos el Menú Lateral (SideNav)! */}
      <SideNav />

      {/* Contenido Principal de la Página */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* El {children} aquí es el <Outlet /> de App.jsx */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;