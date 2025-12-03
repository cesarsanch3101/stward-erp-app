import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, Chip
} from '@mui/material';
// Import our new service and the auth hook
import { getSalesOrders } from '../api/salesService.js';
import { useAuth } from '../context/AuthContext.jsx';

const SalesOrderListPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState(null);
  const { tokens } = useAuth(); // Get tokens from context

  useEffect(() => {
    const fetchSalesOrders = async () => {
      if (!tokens?.access) { // Check specifically for access token
         setError("Authentication required to view sales orders.");
         setLoading(false);
         return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSalesOrders(tokens.access); // Call the service
        setSalesOrders(data || []); // Ensure it's an array
      } catch (err) {
        setError('Error loading sales order list. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, [tokens]); // Re-fetch if tokens change

  // Función para dar color al estado (mejora visual)
  const getStatusChip = (status) => {
    let color = 'default';
    if (status === 'Completed' || status === 'Invoiced') color = 'success';
    if (status === 'Confirmed' || status === 'Shipped') color = 'info';
    if (status === 'Cancelled') color = 'error';
    if (status === 'Draft') color = 'warning';
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Órdenes de Venta
        </Typography>
        <Button variant="contained" color="primary">
          Añadir Orden
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Orden</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><Alert severity="error">{error}</Alert></TableCell>
              </TableRow>
            ) : salesOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No se encontraron órdenes de venta.</TableCell>
              </TableRow>
            ) : (
              // Map over sales orders to display them
              salesOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>SO-{order.id}</TableCell>
                  {/* Use the customer_name from the serializer */}
                  <TableCell>{order.customer_name || '-'}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ mr: 1 }}>Ver</Button>
                    <Button size="small" color="error">Borrar</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalesOrderListPage;