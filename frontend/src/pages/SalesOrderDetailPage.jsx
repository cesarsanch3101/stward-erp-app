import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Chip, CircularProgress, Grid, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalesOrder } from '../api/salesService'; 
// CORRECCIÓN: Eliminamos useAuth

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CORRECCIÓN: Eliminamos la condición if (tokens?.access)
    // La llamada viaja con la cookie automáticamente
    getSalesOrder(id)
      .then(data => setOrder(data))
      .catch(err => console.error("Error cargando orden:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (!order) return <Typography>Orden no encontrada.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales-orders')} sx={{ mb: 2 }}>
        Volver
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Orden #{order.id}</Typography>
          <Chip 
            label={order.status} 
            color={order.status === 'Invoiced' ? 'success' : 'warning'} 
            variant="outlined"
          />
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} mb={4}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
            <Typography variant="h6">{order.customer_name}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
            <Typography variant="body1">
              {new Date(order.order_date).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" mb={2} fontWeight="bold">Detalle de Productos</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unit.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${Number(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${Number(item.total_price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  TOTAL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                  ${Number(order.total_amount).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesOrderDetailPage;