import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, Chip,
  Snackbar
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { getSalesOrders, invoiceSalesOrder } from '../api/salesService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const SalesOrderListPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const fetchSalesOrders = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);
      const data = await getSalesOrders(tokens.access);
      setSalesOrders(data || []);
    } catch (err) {
      setError('Error al cargar órdenes de venta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, [tokens]);

  const handleInvoice = async (orderId) => {
    if (!window.confirm('¿Confirmar facturación? Esto generará el asiento contable automáticamente.')) return;

    setActionLoading(true);
    try {
      await invoiceSalesOrder(orderId, tokens.access);
      setNotification({ open: true, message: '¡Factura y Asiento Contable generados con éxito!', severity: 'success' });
      fetchSalesOrders(); 
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Función placeholder para borrar (requiere implementar deleteSalesOrder en salesService)
  const handleDelete = (orderId) => {
    if(window.confirm("¿Estás seguro de borrar esta orden?")) {
        console.log("Borrar orden", orderId);
        // Aquí llamarías a: await deleteSalesOrder(orderId, tokens.access);
        // fetchSalesOrders();
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      'Draft': 'warning',
      'Confirmed': 'info',
      'Invoiced': 'success',
      'Cancelled': 'error'
    };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Órdenes de Venta</Typography>
        <Button variant="contained" onClick={() => navigate('/sales-orders/new')}>
          Nueva Orden
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell># Orden</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : salesOrders.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No hay órdenes registradas.</TableCell></TableRow>
            ) : (
              salesOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>SO-{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell align="center">{getStatusChip(order.status)}</TableCell>
                  <TableCell align="center">
                    
                    {/* BOTÓN FACTURAR */}
                    {order.status === 'Draft' && (
                      <Button 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => handleInvoice(order.id)}
                        disabled={actionLoading}
                        sx={{ mr: 1 }}
                      >
                        Facturar
                      </Button>
                    )}

                    {/* BOTÓN VER (CORREGIDO) */}
                    <Button 
                        size="small" 
                        startIcon={<VisibilityIcon/>} 
                        sx={{ mr: 1 }}
                        onClick={() => navigate(`/sales-orders/${order.id}`)}
                    >
                        Ver
                    </Button>

                    {/* BOTÓN BORRAR (CORREGIDO) */}
                    {order.status === 'Draft' && (
                        <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon/>}
                            onClick={() => handleDelete(order.id)}
                        >
                            Borrar
                        </Button>
                    )}
                  
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesOrderListPage;