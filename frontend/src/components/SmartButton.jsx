import React from 'react';
import { ButtonBase, Box, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const SmartButton = ({ icon, label, value, onClick }) => {
  const theme = useTheme();

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1, // Bordes sutiles (Enterprise)
        bgcolor: 'background.paper',
        height: 45, // Altura fija estilo Odoo
        minWidth: 130,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', mr: 1.5 }}>
        {icon}
      </Box>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '60%', alignSelf: 'center' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ lineHeight: 1, mb: 0.3, fontSize: '15px' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '11px' }}>
          {label}
        </Typography>
      </Box>
    </ButtonBase>
  );
};

export default SmartButton;