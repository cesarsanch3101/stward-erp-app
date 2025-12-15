import React from 'react';
import { AppBar, Toolbar, Box, IconButton, Avatar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SideNav from './SideNav';
import Omnibox from './Omnibox';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(true); // Estado del sidebar

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      
      {/* HEADER (APPBAR) */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#FFFFFF', 
          color: 'text.primary',
          boxShadow: '0px 1px 0px 0px #E0E0E0'
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: '48px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ mr: 4, fontWeight: 700, color: 'primary.main', fontSize: '16px' }}>
            Stward ERP
          </Typography>

          {/* OMNIBOX CENTRAL */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Omnibox />
          </Box>

          {/* ICONOS DERECHA */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small">
              <NotificationsNoneIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                {user?.username || 'Usuario'}
              </Typography>
              <Avatar 
                sx={{ width: 28, height: 28, fontSize: '14px', bgcolor: 'primary.main' }}
              >
                {(user?.username?.[0] || 'U').toUpperCase()}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <SideNav open={drawerOpen} />

      {/* MAIN CONTENT AREA */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: '48px', // Ajuste para no quedar debajo del header
          overflow: 'auto',
          backgroundColor: '#F5F6F7' 
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;