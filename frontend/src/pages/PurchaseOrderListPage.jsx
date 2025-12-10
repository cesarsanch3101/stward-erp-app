import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getPurchaseOrders } from '../api/purchasingService';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchOrders();
  }, [tokens]);

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
          <ShoppingCartIcon fontSize="large" /> Órdenes de Compra
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

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
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
              {orders.length === 0 ? (
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
                        <IconButton size="small"><VisibilityIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PurchaseOrderListPage;