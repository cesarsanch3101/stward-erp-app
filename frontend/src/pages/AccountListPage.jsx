import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, Chip, IconButton, Tooltip 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio y contexto
import { getAccounts } from '../api/accountingService';
import { useAuth } from '../context/AuthContext';

// Mapeo de colores para los tipos de cuenta
const ACCOUNT_TYPE_COLORS = {
  ASSET: 'primary',      // Activo: Azul
  LIABILITY: 'warning',  // Pasivo: Naranja
  EQUITY: 'success',     // Patrimonio: Verde
  REVENUE: 'info',       // Ingresos: Celeste
  EXPENSE: 'error',      // Gastos: Rojo
};

const AccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts(tokens.access);
      // DataGrid necesita un array plano. Si tu API pagina, ajusta aquí.
      const rows = Array.isArray(data) ? data : (data.results || []);
      setAccounts(rows);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el Plan de Cuentas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [tokens]);

  const columns = [
    { 
      field: 'code', 
      headerName: 'Código', 
      width: 130, 
      sortable: true 
    },
    { 
      field: 'name', 
      headerName: 'Nombre de la Cuenta', 
      flex: 1, 
      minWidth: 250 
    },
    { 
      field: 'account_type', 
      headerName: 'Clasificación', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={ACCOUNT_TYPE_COLORS[params.value] || 'default'} 
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { 
      field: 'parent', 
      headerName: 'Cuenta Padre', 
      width: 150,
      valueGetter: (value, row) => {
        if (!value) return '— (Raíz)';
        // Intentamos buscar el nombre del padre en la lista cargada
        const parent = accounts.find(a => a.id === value);
        return parent ? `${parent.code}` : value;
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Editar">
          <IconButton 
            onClick={() => console.log("Editar", params.id)} 
            size="small" 
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon fontSize="large" color="action" />
          Plan de Cuentas
        </Typography>
        <Box>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={fetchAccounts} 
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => navigate('/accounts/new')}
            >
              Nueva Cuenta
            </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={accounts}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'code', sort: 'asc' }] },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AccountListPage;