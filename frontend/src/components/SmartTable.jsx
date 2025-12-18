import React, { useState } from 'react';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarFilterButton, 
  GridToolbarExport, 
  GridToolbarQuickFilter 
} from '@mui/x-data-grid';
import { Box, Paper, LinearProgress, Button, Menu, MenuItem, Typography, Divider } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Toolbar Personalizada Estilo Odoo/SAP
const EnterpriseToolbar = ({ onViewChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (view) => {
    setAnchorEl(null);
    if (view) onViewChange(view);
  };

  return (
    <GridToolbarContainer sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
      <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        
        {/* Botón de Vistas/Variantes */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Button 
          size="small" 
          startIcon={<ViewListIcon />} 
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleMenuClick}
          sx={{ color: 'text.secondary' }}
        >
          Vistas
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose()}>
          <MenuItem onClick={() => handleMenuClose('all')}>
            <Typography variant="body2">Todo (Predeterminado)</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose('active')}>
            <Typography variant="body2">Solo Activos</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose('my_records')}>
            <Typography variant="body2">Mis Registros</Typography>
          </MenuItem>
        </Menu>
      </Box>
      <GridToolbarQuickFilter variant="outlined" size="small" sx={{ width: 250 }} />
    </GridToolbarContainer>
  );
};

const SmartTable = ({ 
  rows = [], 
  columns, 
  loading, 
  onRowClick,
  // Props de Servidor
  rowCount = 0,
  paginationModel = { page: 0, pageSize: 25 },
  onPaginationModelChange,
  onFilterChange,
  checkboxSelection = true // Default Enterprise
}) => {
  
  return (
    <Paper sx={{ height: 650, width: '100%', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <DataGrid
        // Datos
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        
        // Modos de Servidor
        paginationMode="server"
        filterMode="server"
        
        // Paginación Controlada
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[25, 50, 100]}
        
        // Configuración Visual
        density="compact"
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick
        
        // Slots
        slots={{
          loadingOverlay: LinearProgress,
          toolbar: EnterpriseToolbar,
        }}
        
        slotProps={{
          toolbar: {
            onViewChange: (view) => onFilterChange && onFilterChange({ view }),
          }
        }}

        // Estilos
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F5F6F7', // Color Shell SAP
            color: '#1D2D3E',
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            borderBottom: '1px solid #e0e0e0'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            fontSize: '13px'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F0F7FF', // Azul muy suave al hover
            cursor: onRowClick ? 'pointer' : 'default',
          }
        }}

        onRowClick={onRowClick ? (params) => onRowClick(params.row.id) : undefined}
      />
    </Paper>
  );
};

export default SmartTable;