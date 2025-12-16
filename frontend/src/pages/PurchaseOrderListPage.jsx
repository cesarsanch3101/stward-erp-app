import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip, IconButton,
  Tooltip, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { getPurchaseOrders, deletePurchaseOrder, receivePurchaseOrder } from '../api/purchasingService';
// Eliminamos useAuth
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const PurchaseOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  // CORRECCIÓN: Eliminamos la dependencia de tokens
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders(); 
      setOrders(data || []);
    } catch (err) {
      setError('Error al cargar órdenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;
    try {
      await deletePurchaseOrder(id);
      setNotification({ open: true, message: 'Orden eliminada.', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm("¿Confirmar recepción? Esto aumentará el stock y generará deuda.")) return;
    setActionLoading(true);
    try {
      await receivePurchaseOrder(id);
      setNotification({ open: true, message: '¡Mercadería recibida exitosamente!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPayment = (order) => {
    setSelectedOrder(order);
    setPaymentModalOpen(true);
  };

  const getStatusChip = (status) => {
    const colors = { 'Draft': 'warning', 'Completed': 'success', 'Cancelled': 'error' };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize="large" /> Órdenes de Compra
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/purchase-orders/new')}>
          Nueva Compra
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress/></TableCell></TableRow> :
             orders.length === 0 ? <TableRow><TableCell colSpan={6} align="center">Sin registros.</TableCell></TableRow> :
             orders.map((po) => (
              <TableRow key={po.id}>
                <TableCell>PO-{po.id}</TableCell>
                <TableCell>{po.supplier_name}</TableCell>
                <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell align="right">${parseFloat(po.total_amount).toFixed(2)}</TableCell>
                <TableCell align="center">{getStatusChip(po.status)}</TableCell>
                <TableCell align="center">
                  {po.status === 'Draft' && (
                    <>
                    <Tooltip title="Recibir Mercadería">
                      <IconButton color="success" onClick={() => handleReceive(po.id)} disabled={actionLoading}>
                        <InventoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Orden">
                      <IconButton color="error" onClick={() => handleDelete(po.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    </>
                  )}
                  {po.status === 'Completed' && (
                    <Tooltip title="Registrar Pago">
                      <IconButton color="primary" onClick={() => handleOpenPayment(po)}>
                        <AttachMoneyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PaymentModal 
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={selectedOrder}
        type="Expense"
        onSuccess={() => {
           setNotification({ open: true, message: 'Pago registrado con éxito', severity: 'success' });
        }}
      />

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseOrderListPage;