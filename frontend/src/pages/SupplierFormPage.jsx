import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

// Importamos los servicios y el hook de autenticación
import { getCustomers, createSalesOrder } from '../api/salesService.js';
import { getProducts } from '../api/inventoryService.js';
import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom';

const SalesOrderFormPage = () => {
  const { tokens } = useAuth();

  const [orderData, setOrderData] = useState({ customer: '', shipping_date: '', status: 'Draft' });
  const [items, setItems] = useState([{ product: '', quantity: 1, unit_price: 0 }]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!tokens?.access) {
        setError('Autenticación requerida.'); setLoadingOptions(false); return;
      }
      try {
        setError(null); setLoadingOptions(true);
        const [customersData, productsData] = await Promise.all([
          getCustomers(tokens.access),
          getProducts(tokens.access)
        ]);
        setCustomers(customersData || []);
        setProducts(productsData || []);
      } catch (err) {
        setError('Error cargando datos para el formulario.'); console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, [tokens]);

  // --- FUNCIONES DE MANEJO DEL FORMULARIO (CORREGIDAS) ---
  const handleHeaderChange = (event) => {
    const { name, value } = event.target;
    // Creamos un estado nuevo inmutable
    setOrderData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    // Creamos un array de items completamente nuevo
    const newItems = items.map((item, i) => {
      if (i !== index) {
        return item;
      }
      // Creamos un objeto de item completamente nuevo
      return {
        ...item,
        [name]: value
      };
    });
    setItems(newItems); // Actualizamos el estado con el nuevo array
  };

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // --- handleSubmit (listo para la API) ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tokens?.access) {
      setError("Autenticación requerida."); return;
    }

    if (!orderData.customer || items.some(item => !item.product || item.quantity <= 0 || item.unit_price < 0)) {
      setError("Por favor, complete todos los campos requeridos (Cliente, Producto, Cantidad > 0, Precio >= 0).");
      return;
    }

    setFormLoading(true);
    setError(null);

    const payload = {
      ...orderData,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    console.log("Enviando payload:", payload);

    try {
      const newOrder = await createSalesOrder(payload, tokens.access);
      console.log('¡Orden de Venta creada con éxito!', newOrder);

      setOrderData({ customer: '', shipping_date: '', status: 'Draft' });
      setItems([{ product: '', quantity: 1, unit_price: 0 }]);

    } catch (err) {
      console.error('Fallo al crear la Orden de Venta:', err);
      setError(`Error al guardar: ${err.message}` || 'Ocurrió un error al guardar la orden.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- JSX (SIN CAMBIOS) ---
  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Crear Orden de Venta
        </Typography>
        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Cliente */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="customer-label">Cliente</InputLabel>
                  <Select labelId="customer-label" name="customer" value={orderData.customer} label="Cliente" onChange={handleHeaderChange} >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Fecha de Envío */}
              <Grid item xs={12} sm={6}>
                <TextField name="shipping_date" label="Fecha de Envío (Estimada)" type="date" fullWidth InputLabelProps={{ shrink: true }} value={orderData.shipping_date} onChange={handleHeaderChange} />
              </Grid>
            </Grid>

            {/* Items */}
            <Typography component="h2" variant="h6" sx={{ mt: 4, mb: 2 }}>Items del Pedido</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Quitar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Producto</InputLabel>
                          <Select name="product" value={item.product} label="Producto" onChange={(e) => handleItemChange(index, e)} >
                            <MenuItem value=""><em>Seleccione...</em></MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField name="quantity" type="number" size="small" value={item.quantity} onChange={(e) => handleItemChange(index, e)} required inputProps={{ min: 0.01 }} />
                      </TableCell>
                      <TableCell>
                        <TextField name="unit_price" type="number" size="small" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} required inputProps={{ min: 0 }} />
                      </TableCell>
                      <TableCell align="right">{(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleRemoveItem(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddItem} sx={{ mt: 2 }}>Añadir Item</Button>

            {/* Submit */}
            {error && <Alert severity="error" sx={{ width: '100%', mt: 3 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Orden de Venta'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SalesOrderFormPage;