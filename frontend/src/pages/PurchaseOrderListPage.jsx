import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory'; // Icono para recibir

import { getPurchaseOrders, receivePurchaseOrder } from '../api/purchasingService';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);
      const data = await getPurchaseOrders(tokens.access);
      setOrders(data || []);
    } catch (err) {
      setError('Error al cargar órdenes de compra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tokens]);

  const handleReceive = async (orderId) => {
    if (!window.confirm('¿Confirmar recepción de mercadería? Esto aumentará el stock y generará la deuda.')) return;
    
    setActionLoading(true);
    try {
      await receivePurchaseOrder(orderId, tokens.access);
      setNotification({ open: true, message: '¡Mercadería recibida y Stock actualizado!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      'Draft': 'warning',
      'Submitted': 'info',
      'Completed': 'success',
      'Cancelled': 'error'
    };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize="large" /> Compras
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/purchase-orders/new')}
        >
          Nueva Compra
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell># Orden</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No hay compras registradas.</TableCell></TableRow>
            ) : (
                orders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>PO-{po.id}</TableCell>
                    <TableCell>{po.supplier_name}</TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">${parseFloat(po.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell align="center">{getStatusChip(po.status)}</TableCell>
                    <TableCell align="center">
                        {po.status === 'Draft' && (
                            <Button 
                                size="small" 
                                color="success"
                                variant="outlined"
                                startIcon={<InventoryIcon />}
                                onClick={() => handleReceive(po.id)}
                                disabled={actionLoading}
                            >
                                Recibir
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
        open={notification.open} autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseOrderListPage;