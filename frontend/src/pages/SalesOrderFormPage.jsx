import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getCustomers, createSalesOrder } from '../api/salesService';
import { getProducts } from '../api/inventoryService';
import { useNavigate } from 'react-router-dom';

const SalesOrderFormPage = () => {
  const navigate = useNavigate();
  
  const [header, setHeader] = useState({ customer: '', shipping_date: '' });
  const [items, setItems] = useState([{ product: '', quantity: 1, unit_price: 0 }]);
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial de catálogos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pedimos la primera página de clientes y productos para llenar los selects
        // Nota: En un sistema real con miles de registros, estos selects deberían ser 
        // componentes de autocompletado con búsqueda en servidor (AsyncAutocomplete).
        const [cData, pData] = await Promise.all([
          getCustomers(1, 100), // Traemos 100 para el combo
          getProducts(1, 100)
        ]);

        // CORRECCIÓN CRÍTICA: Desempaquetar 'results' si viene paginado
        const customerList = Array.isArray(cData) ? cData : (cData.results || []);
        const productList = Array.isArray(pData) ? pData : (pData.results || []);

        setCustomers(customerList);
        setProducts(productList);
      } catch (err) {
        console.error(err);
        setError('Error cargando catálogos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.customer) {
        setError("Seleccione un cliente.");
        return;
    }
    
    // Validación básica de items
    if (items.length === 0 || !items[0].product) {
       setError("Agregue al menos un producto válido.");
       return;
    }

    setSaving(true);
    try {
      // CORRECCIÓN: Manejo de fecha vacía
      const payload = {
          ...header,
          shipping_date: header.shipping_date || null,
          items
      };

      await createSalesOrder(payload);
      navigate('/sales-orders');
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar la orden.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales-orders')} sx={{ my: 2 }}>Volver</Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nueva Orden de Venta</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Cliente</InputLabel>
                <Select 
                    value={header.customer} 
                    label="Cliente" 
                    onChange={(e) => setHeader({ ...header, customer: e.target.value })}
                >
                  {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="date" 
                label="Fecha Envío" 
                InputLabelProps={{ shrink: true }} 
                value={header.shipping_date} 
                onChange={(e) => setHeader({ ...header, shipping_date: e.target.value })} 
              />
            </Grid>
          </Grid>

          <Typography variant="h6" mb={1}>Líneas de Pedido</Typography>
          <TableContainer sx={{ mb: 2, border: '1px solid #eee' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                <TableRow>
                  <TableCell width="40%">Producto</TableCell>
                  <TableCell width="20%">Cantidad</TableCell>
                  <TableCell width="20%">Precio</TableCell>
                  <TableCell width="10%">Total</TableCell>
                  <TableCell width="10%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Select fullWidth size="small" name="product" value={item.product} onChange={(e) => handleItemChange(i, e)}>
                        {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell><TextField fullWidth size="small" type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(i, e)} /></TableCell>
                    <TableCell><TextField fullWidth size="small" type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(i, e)} /></TableCell>
                    <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                    <TableCell><IconButton color="error" onClick={() => removeItem(i)}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addItem}>Agregar Línea</Button>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear Orden'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SalesOrderFormPage;