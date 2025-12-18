import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SavingsIcon from '@mui/icons-material/Savings';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getBankAccounts } from '../api/treasuryService';
import { useNavigate } from 'react-router-dom';

const BankAccountListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getBankAccounts(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando cuentas bancarias.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const columns = [
    { field: 'name', headerName: 'Nombre Cuenta', flex: 1, minWidth: 200, renderCell: (p) => <b>{p.value}</b> },
    { field: 'bank_name', headerName: 'Banco', width: 150 },
    { field: 'account_number', headerName: 'Número', width: 180 },
    { 
      field: 'current_balance', headerName: 'Saldo Actual', width: 150, align: 'right', headerAlign: 'right',
      renderCell: (params) => (
        <Chip 
          label={`$${parseFloat(params.value).toFixed(2)}`} 
          color={parseFloat(params.value) >= 0 ? 'success' : 'error'} 
          variant="outlined" size="small" sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      field: 'actions', headerName: 'Acciones', width: 100,
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
          <SmartButton icon={<SavingsIcon />} value={rowCount} label="Cuentas" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/bank-accounts/new')}>
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
      />
    </Box>
  );
};

export default BankAccountListPage;