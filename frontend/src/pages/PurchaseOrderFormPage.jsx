import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getSuppliers, createPurchaseOrder } from '../api/purchasingService';
import { getProducts } from '../api/inventoryService';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderFormPage = () => {
  const navigate = useNavigate();
  
  const [header, setHeader] = useState({ supplier: '', expected_delivery_date: '' });
  const [items, setItems] = useState([{ product: '', quantity: 1, unit_price: 0 }]);
  
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suppData, prodData] = await Promise.all([
          // CORRECCIÓN: Pedimos 100 registros para llenar el combo
          getSuppliers(1, 100), 
          getProducts(1, 100) 
        ]);

        // Manejo robusto de la respuesta paginada
        const suppliersList = suppData.results || suppData || [];
        const productsList = prodData.results || prodData || [];

        setSuppliers(suppliersList);
        setProducts(productsList);
      } catch (err) {
        console.error(err);
        setError('Error cargando catálogos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeaderChange = (e) => setHeader({ ...header, [e.target.name]: e.target.value });

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.supplier) { setError("Seleccione un proveedor."); return; }
    
    if (items.length === 0 || !items[0].product) {
       setError("Agregue al menos un producto válido.");
       return;
    }

    setSaving(true);
    try {
      // CORRECCIÓN: Si la fecha está vacía, enviar null
      const payload = {
        ...header,
        expected_delivery_date: header.expected_delivery_date || null,
        items
      };

      await createPurchaseOrder(payload);
      navigate('/purchase-orders');
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear la orden.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/purchase-orders')} sx={{ my: 2 }}>Volver</Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nueva Orden de Compra</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Proveedor</InputLabel>
                <Select name="supplier" value={header.supplier} label="Proveedor" onChange={handleHeaderChange}>
                  {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth type="date" label="Fecha Entrega Estimada" name="expected_delivery_date"
                InputLabelProps={{ shrink: true }} value={header.expected_delivery_date} onChange={handleHeaderChange} 
              />
            </Grid>
          </Grid>

          <Typography variant="h6" mb={2}>Productos</Typography>
          <TableContainer sx={{ mb: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell width="40%">Producto</TableCell>
                  <TableCell width="20%">Cantidad</TableCell>
                  <TableCell width="20%">Costo Unit.</TableCell>
                  <TableCell width="10%">Total</TableCell>
                  <TableCell width="10%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select fullWidth size="small" name="product" value={item.product} onChange={(e) => handleItemChange(index, e)}>
                        {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" type="number" name="unit_price" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} />
                    </TableCell>
                    <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => removeItem(index)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addItem}>Agregar Producto</Button>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" size="large" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear Orden'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PurchaseOrderFormPage;