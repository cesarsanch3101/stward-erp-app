import React, { useState, useEffect } from 'react';
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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Error cargando Plan de Cuentas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const columns = [
    { field: 'code', headerName: 'Código', width: 130, renderCell: (p) => <b>{p.value}</b> },
    { field: 'name', headerName: 'Nombre Cuenta', flex: 1, minWidth: 250 },
    { 
      field: 'account_type', headerName: 'Tipo', width: 130,
      renderCell: (p) => <Chip label={p.value} color={ACCOUNT_TYPE_COLORS[p.value] || 'default'} size="small" variant="outlined" />
    },
    { 
      field: 'parent', headerName: 'Padre', width: 120,
      valueGetter: (val) => {
        const parent = accounts.find(a => a.id === val);
        return parent ? parent.code : '-';
      }
    },
    {
      field: 'actions', headerName: '', width: 80,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => {e.stopPropagation(); console.log(params.id)}}>
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
          <SmartButton icon={<AccountTreeIcon />} value={accounts.length} label="Cuentas" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/accounts/new')}>
          Nueva Cuenta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SmartTable rows={accounts} columns={columns} loading={loading} />
    </Box>
  );
};

export default AccountListPage;