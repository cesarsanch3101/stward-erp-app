import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, Chip, IconButton, Tooltip, Snackbar } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getSalesOrders, invoiceSalesOrder } from '../api/salesService';
import { useNavigate } from 'react-router-dom';

const SalesOrderListPage = () => {
  const navigate = useNavigate();

  // Estados para SmartTable Server-Side
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getSalesOrders(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando órdenes.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleInvoice = async (id) => {
    if (!window.confirm('¿Confirmar facturación y generar asiento contable?')) return;
    try {
      await invoiceSalesOrder(id);
      setNotification({ open: true, message: 'Factura generada con éxito.', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const map = { 'Draft': 'warning', 'Confirmed': 'info', 'Invoiced': 'success', 'Cancelled': 'error' };
    return map[status] || 'default';
  };

  const columns = [
    { field: 'id', headerName: 'Orden #', width: 90, renderCell: (p) => <b>SO-{p.value}</b> },
    { field: 'customer_name', headerName: 'Cliente', flex: 1, minWidth: 180 },
    { field: 'order_date', headerName: 'Fecha', width: 120, valueGetter: (val) => new Date(val).toLocaleDateString() },
    { 
      field: 'total_amount', headerName: 'Total', width: 120, align: 'right', headerAlign: 'right',
      valueFormatter: (val) => `$${parseFloat(val).toFixed(2)}`
    },
    { 
      field: 'status', headerName: 'Estado', width: 120,
      renderCell: (p) => <Chip label={p.value} color={getStatusColor(p.value)} size="small" variant="outlined" />
    },
    {
      field: 'actions', headerName: 'Acciones', width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver Detalle">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/sales-orders/${params.row.id}`); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {params.row.status === 'Draft' && (
            <Tooltip title="Facturar">
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleInvoice(params.row.id); }}>
                <ReceiptLongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Ventas</Typography>
          <SmartButton icon={<AttachMoneyIcon />} value={rowCount} label="Total Órdenes" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/sales-orders/new')}>
          Nueva Orden
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
        onRowClick={(id) => navigate(`/sales-orders/${id}`)} 
      />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesOrderListPage;