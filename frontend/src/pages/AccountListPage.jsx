import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getAccounts } from '../api/accountingService';
import { useNavigate } from 'react-router-dom';

const ACCOUNT_TYPE_COLORS = {
  ASSET: 'primary', LIABILITY: 'warning', EQUITY: 'success', REVENUE: 'info', EXPENSE: 'error',
};

const AccountListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 }); // Más denso para cuentas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getAccounts(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError("Error cargando Plan de Cuentas.");
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const columns = [
    { field: 'code', headerName: 'Código', width: 130, renderCell: (p) => <b>{p.value}</b> },
    { field: 'name', headerName: 'Nombre Cuenta', flex: 1, minWidth: 250 },
    { 
      field: 'account_type', headerName: 'Tipo', width: 130,
      renderCell: (p) => <Chip label={p.value} color={ACCOUNT_TYPE_COLORS[p.value] || 'default'} size="small" variant="outlined" />
    },
    { 
      field: 'parent', headerName: 'Padre', width: 100,
      valueGetter: (val, row) => row.parent ? row.parent : '-' // Simplificado, idealmente backend manda code
    },
    {
      field: 'actions', headerName: 'Acciones', width: 100,
      renderCell: (params) => (
        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/accounts/edit/${params.row.id}`); }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Contabilidad</Typography>
          <SmartButton icon={<AccountTreeIcon />} value={rowCount} label="Cuentas" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/accounts/new')}>
          Nueva Cuenta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <SmartTable 
        rows={rows} 
        columns={columns} 
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={(id) => navigate(`/accounts/edit/${id}`)}
      />
    </Box>
  );
};

export default AccountListPage;