import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getSalesOrders } from '../api/salesService'; // Asegúrate que esta función exista
import { useNavigate } from 'react-router-dom';

const SalesOrderListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getSalesOrders(page, paginationModel.pageSize);
      
      if (data.results) {
         setRows(data.results);
         setRowCount(data.count);
      } else {
         setRows([]);
         setRowCount(0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando ventas.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'customer_name', headerName: 'Cliente', flex: 1, minWidth: 200,
      renderCell: (p) => <b>{p.value}</b> 
    },
    { field: 'order_date', headerName: 'Fecha', width: 120 },
    { 
      field: 'total_amount', headerName: 'Total', width: 130,
      renderCell: (p) => <b>${parseFloat(p.value).toFixed(2)}</b>
    },
    { 
      field: 'status', headerName: 'Estado', width: 120,
      renderCell: (p) => {
        const colors = { 'Draft': 'default', 'Confirmed': 'info', 'Invoiced': 'success', 'Cancelled': 'error' };
        return <Chip label={p.value} color={colors[p.value] || 'default'} size="small" variant="outlined" />;
      }
    },
    { 
      field: 'dgi_status', headerName: 'DGI (FE)', width: 140,
      renderCell: (p) => {
        const colors = { 'NotSent': 'default', 'Authorized': 'success', 'Rejected': 'error' };
        return <Chip label={p.value} color={colors[p.value] || 'default'} size="small" />;
      }
    },
    {
      field: 'actions', headerName: 'Ver', width: 80, sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/sales-orders/${params.row.id}`); }}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Órdenes de Venta</Typography>
          <SmartButton icon={<ReceiptIcon />} value={rowCount} label="Órdenes" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/sales-orders/new')}>
          Nueva Venta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={rows} columns={columns} rowCount={rowCount} loading={loading}
        paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
        onRowClick={(id) => navigate(`/sales-orders/${id}`)}
      />
    </Box>
  );
};

export default SalesOrderListPage;