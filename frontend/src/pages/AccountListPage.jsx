import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, Chip, IconButton, Tooltip 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // GridToolbar añade buscador y exportar
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';

// Importamos el servicio y contexto
import { getAccounts } from '../api/accountingService';
import { useAuth } from '../context/AuthContext';

// Mapeo de colores para los tipos de cuenta (Estándar visual ERP)
const ACCOUNT_TYPE_COLORS = {
  ASSET: 'primary',      // Activo: Azul (Corporativo)
  LIABILITY: 'warning',  // Pasivo: Naranja (Precaución)
  EQUITY: 'success',     // Patrimonio: Verde (Positivo)
  REVENUE: 'info',       // Ingresos: Celeste (Flujo)
  EXPENSE: 'error',      // Gastos: Rojo (Salida)
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
      // El DataGrid requiere un array. Si la API pagina (results), extraemos el array.
      const rows = Array.isArray(data) ? data : (data.results || []);
      setAccounts(rows);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el Plan de Cuentas. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [tokens]);

  // Definición de Columnas "Enterprise"
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
      headerName: 'Jerarquía (Padre)', 
      width: 150,
      valueGetter: (value, row) => {
        if (!value) return '— (Raíz)';
        // Buscamos el código del padre en la lista cargada para mostrar algo útil
        const parent = accounts.find(a => a.id === value);
        return parent ? `${parent.code} - ${parent.name}` : `ID: ${value}`;
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Editar Cuenta">
          <IconButton 
            onClick={() => navigate(`/accounts/${params.row.id}/edit`)} // Asumiendo que crearás la ruta de edición
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
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%', p: 1 }}>
      {/* Cabecera de Página */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalanceIcon fontSize="large" color="action" />
          Plan de Cuentas
        </Typography>
        <Box>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={fetchAccounts} 
              sx={{ mr: 1 }} 
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => navigate('/accounts/new')}
              disableElevation
            >
              Nueva Cuenta
            </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* DataGrid Profesional */}
      <Paper elevation={2} sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={accounts}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'code', sort: 'asc' }] }, // Orden contable natural
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          density="compact" // Alta densidad de datos (estilo Excel)
          slots={{ toolbar: GridToolbar }} // Barra de herramientas avanzada (Filtros, Exportar)
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