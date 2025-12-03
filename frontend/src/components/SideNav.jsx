import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
// 1. Importamos 'useNavigate' y AHORA TAMBIÉN 'useLocation'
import { useNavigate, useLocation } from 'react-router-dom';

// Importamos los iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Icono para Órdenes de Compra
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'; // Icono para Órdenes de Venta

const drawerWidth = 240;

// Expandimos la lista de items del menú para incluir todo
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Empleados', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Proveedores', icon: <BusinessIcon />, path: '/suppliers' },
  { text: 'Productos', icon: <InventoryIcon />, path: '/products' },
  // Añadimos rutas para los módulos que faltaban
  { text: 'Órdenes de Venta', icon: <PointOfSaleIcon />, path: '/sales-orders' },
  { text: 'Órdenes de Compra', icon: <ShoppingCartIcon />, path: '/purchase-orders' },
  { text: 'Cuentas (Plan)', icon: <AccountBalanceIcon />, path: '/accounts' },
  { text: 'Asientos (Diario)', icon: <RequestQuoteIcon />, path: '/journal-entries' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports' },
];

const SideNav = () => {
  const navigate = useNavigate();
  // 2. Obtenemos nuestra ubicación actual
  const location = useLocation();
  const currentPath = location.pathname; // Esto nos dará la URL actual (ej: "/employees")

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              {/* 3. Añadimos la propiedad "selected" */}
              {/* El botón estará "seleccionado" si su ruta (item.path)
                  es igual a la ruta actual (currentPath) */}
              <ListItemButton 
                onClick={() => handleNavigate(item.path)}
                selected={currentPath === item.path} 
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNav;