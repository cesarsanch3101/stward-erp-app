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
// import { useNavigate } from 'react-router-dom'; // Para usar más adelante con el enrutador

const SalesOrderFormPage = () => {
  const { tokens } = useAuth(); // Obtenemos los tokens del contexto
  
  // Estado para la cabecera de la orden
  const [orderData, setOrderData] = useState({
    customer: '',
    shipping_date: '',
    status: 'Draft',
  });
  // Estado para los items de la orden
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: 0 }
  ]);
  
  // Estado para las opciones de los desplegables
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Estados de carga y error
  const [loadingOptions, setLoadingOptions] = useState(true); // Para los desplegables
  const [formLoading, setFormLoading] = useState(false); // Para el envío del formulario
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  // useEffect para cargar clientes y productos al montar
  useEffect(() => {
    const fetchData = async () => {
      if (!tokens?.access) {
        setError('Autenticación requerida.');
        setLoadingOptions(false);
        return;
      }
      try {
        setError(null);
        setLoadingOptions(true);
        
        // Hacemos ambas llamadas a la API en paralelo
        const [customersData, productsData] = await Promise.all([
          getCustomers(tokens.access),
          getProducts(tokens.access)
        ]);
        
        setCustomers(customersData || []);
        setProducts(productsData || []);

      } catch (err) {
        setError('Error cargando datos para el formulario.');
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, [tokens]); // Se ejecuta si cambian los tokens

  // --- Funciones de manejo del formulario (CORREGIDAS) ---
  const handleHeaderChange = (event) => {
    const { name, value } = event.target;
    // Usamos el "functional update" para crear un estado nuevo
    setOrderData(prevState => ({
      ...prevState, // Copia todas las propiedades viejas
      [name]: value  // Sobrescribe solo la que cambió
    }));
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;

    // Creamos un array completamente nuevo
    const newItems = items.map((item, i) => {
      // Si no es el item que estamos cambiando, lo devolvemos tal cual
      if (i !== index) {
        return item;
      }
      
      // Si ES el item que estamos cambiando, creamos un objeto nuevo
      return {
        ...item,       // Copia todas las propiedades viejas del item
        [name]: value  // Sobrescribe solo la propiedad que cambió
      };
    });

    // Le damos a React el array completamente nuevo
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // --- handleSubmit Completo ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!tokens?.access) {
      setError("Autenticación requerida.");
      return;
    }
    
    // Validación simple
    if (!orderData.customer || items.some(item => !item.product || item.quantity <= 0 || item.unit_price < 0)) {
      setError("Por favor, complete todos los campos requeridos (Cliente, Producto, Cantidad > 0, Precio >= 0).");
      return;
    }

    setFormLoading(true);
    setError(null);

    // Preparamos los datos anidados que espera el backend
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
      // Llamamos al servicio para crear la orden
      const newOrder = await createSalesOrder(payload, tokens.access);
      console.log('¡Orden de Venta creada con éxito!', newOrder);
      
      // Limpiamos el formulario
      setOrderData({ customer: '', shipping_date: '', status: 'Draft' });
      setItems([{ product: '', quantity: 1, unit_price: 0 }]);
      // TODO: Mostrar notificación de éxito
      // navigate('/sales-orders'); // (Para cuando tengamos rutas)

    } catch (err) {
      console.error('Fallo al crear la Orden de Venta:', err);
      setError(`Error al guardar: ${err.message}` || 'Ocurrió un error al guardar la orden.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Crear Orden de Venta
        </Typography>

        {/* Muestra spinner mientras cargan las opciones */}
        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* --- Sección de Cabecera --- */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="customer-label">Cliente</InputLabel>
                  <Select
                    labelId="customer-label"
                    name="customer"
                    value={orderData.customer}
                    label="Cliente"
                    onChange={handleHeaderChange}
                  >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="shipping_date"
                  label="Fecha de Envío (Estimada)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={orderData.shipping_date}
                  onChange={handleHeaderChange}
                />
              </Grid>
            </Grid>

            {/* --- Sección de Items --- */}
            <Typography component="h2" variant="h6" sx={{ mt: 4, mb: 2 }}>
              Items del Pedido
            </Typography>
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
                          <Select
                            name="product"
                            value={item.product}
                            label="Producto"
                            onChange={(e) => handleItemChange(index, e)}
                          >
                            <MenuItem value=""><em>Seleccione...</em></MenuItem>
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="quantity"
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          required
                          inputProps={{ min: "0.01", step: "any" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="unit_price"
                          type="number"
                          size="small"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, e)}
                          required
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(item.quantity * item.unit_price).toFixed(2)}
                      </TableCell>
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
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddItem}
              sx={{ mt: 2 }}
            >
              Añadir Item
            </Button>

            {/* --- Botón de Guardar --- */}
            {error && <Alert severity="error" sx={{ width: '100%', mt: 3 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formLoading}
            >
              {formLoading ? 'Guardando...' : 'Guardar Orden de Venta'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SalesOrderFormPage;