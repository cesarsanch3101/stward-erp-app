import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icono Banco
import SavingsIcon from '@mui/icons-material/Savings'; // Icono Dinero

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getBankAccounts } from '../api/treasuryService';
import { useNavigate } from 'react-router-dom';

const BankAccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getBankAccounts(); // Llamada segura sin token
      setAccounts(data || []);
    } catch (err) {
      setError('Error cargando cuentas bancarias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // Calcular saldo total
  const totalBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.current_balance), 0);

  const columns = [
    { field: 'name', headerName: 'Nombre Cuenta', flex: 1, minWidth: 200, renderCell: (p) => <b>{p.value}</b> },
    { field: 'bank_name', headerName: 'Banco', width: 150 },
    { field: 'account_number', headerName: 'Número', width: 180 },
    { 
      field: 'current_balance', 
      headerName: 'Saldo Actual', 
      width: 150, 
      align: 'right', 
      headerAlign: 'right',
      renderCell: (params) => (
        <Chip 
          label={`$${parseFloat(params.value).toFixed(2)}`} 
          color={params.value >= 0 ? 'success' : 'error'} 
          variant="outlined" 
          size="small" 
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); console.log('Edit', params.row.id); }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Tesorería</Typography>
          <SmartButton 
            icon={<SavingsIcon />} 
            value={`$${totalBalance.toFixed(2)}`} 
            label="Saldo Global" 
            onClick={() => {}} 
          />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/bank-accounts/new')}>
          Nueva Cuenta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={accounts}
        columns={columns}
        loading={loading}
      />
    </Box>
  );
};

export default BankAccountListPage;