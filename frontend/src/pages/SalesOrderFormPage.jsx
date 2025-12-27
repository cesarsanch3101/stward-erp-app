import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, Divider, InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { getCustomers, createSalesOrder } from '../api/salesService';
import { getProducts } from '../api/inventoryService';
import { useNavigate } from 'react-router-dom';

const SalesOrderFormPage = () => {
  const navigate = useNavigate();
  
  // Encabezado del documento
  const [header, setHeader] = useState({ customer: '', shipping_date: '' });
  
  // Líneas de detalle (Inicializamos con 1 línea vacía)
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: 0, discount: 0, tax_rate: 0.07 }
  ]);
  
  // Catálogos
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cData, pData] = await Promise.all([
          getCustomers(1, 100), 
          getProducts(1, 100)
        ]);
        
        setCustomers(Array.isArray(cData) ? cData : (cData.results || []));
        setProducts(Array.isArray(pData) ? pData : (pData.results || []));
      } catch (err) {
        console.error(err);
        setError('Error cargando catálogos. Verifique su conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- MOTOR DE CÁLCULO EN VIVO ---
  const totals = useMemo(() => {
    let subtotalTaxable = 0;
    let subtotalExempt = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;

      // Base Imponible de la línea
      const lineGross = qty * price;
      const lineNet = Math.max(0, lineGross - discount); // No negativos

      totalDiscount += discount;

      if (taxRate > 0) {
        subtotalTaxable += lineNet;
        totalTax += (lineNet * taxRate);
      } else {
        subtotalExempt += lineNet;
      }
    });

    return {
      subtotalTaxable,
      subtotalExempt,
      totalDiscount,
      totalTax,
      totalAmount: subtotalTaxable + subtotalExempt + totalTax
    };
  }, [items]);

  // Manejadores
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Si cambia el producto, buscar su precio sugerido (opcional, si el backend lo enviara)
    // if (field === 'product') { ... } 
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, unit_price: 0, discount: 0, tax_rate: 0.07 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.customer) return setError("Seleccione un cliente.");
    if (items.some(i => !i.product || i.quantity <= 0)) return setError("Revise las líneas de productos.");

    setSaving(true);
    try {
      const payload = {
        ...header,
        shipping_date: header.shipping_date || null,
        items: items.map(i => ({
          ...i,
          quantity: parseFloat(i.quantity),
          unit_price: parseFloat(i.unit_price),
          discount: parseFloat(i.discount),
          tax_rate: parseFloat(i.tax_rate)
        }))
      };

      await createSalesOrder(payload);
      navigate('/sales-orders');
    } catch (err) {
      console.error(err);
      setError("Error al procesar la orden. Verifique los datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl">
      <Box display="flex" alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/sales-orders')} sx={{ mr: 2 }}>
          Cancelar
        </Button>
        <Typography variant="h5" fontWeight={700}>Nueva Factura de Venta</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Cliente</InputLabel>
                  <Select 
                    value={header.customer} 
                    label="Cliente" 
                    onChange={(e) => setHeader({ ...header, customer: e.target.value })}
                  >
                    {customers.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} {c.ruc ? `(${c.ruc})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField 
                  fullWidth type="date" label="Fecha Emisión" size="small"
                  InputLabelProps={{ shrink: true }} disabled value={new Date().toISOString().split('T')[0]} 
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField 
                  fullWidth type="date" label="Fecha Entrega" size="small"
                  InputLabelProps={{ shrink: true }} 
                  value={header.shipping_date} 
                  onChange={(e) => setHeader({ ...header, shipping_date: e.target.value })} 
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 0, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f6f7' }}>
                  <TableRow>
                    <TableCell width="35%">Producto</TableCell>
                    <TableCell width="12%" align="right">Cant.</TableCell>
                    <TableCell width="15%" align="right">Precio</TableCell>
                    <TableCell width="12%" align="right">Desc.</TableCell>
                    <TableCell width="12%" align="right">Impuesto</TableCell>
                    <TableCell width="10%" align="right">Total</TableCell>
                    <TableCell width="4%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, i) => {
                    const lineTotal = (item.quantity * item.unit_price) - item.discount;
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <Select 
                            fullWidth variant="standard" disableUnderline 
                            value={item.product} 
                            onChange={(e) => handleItemChange(i, 'product', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="" disabled>Seleccionar producto...</MenuItem>
                            {products.map(p => (
                              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField 
                            type="number" variant="standard" fullWidth 
                            inputProps={{ style: { textAlign: 'right' }, min: 1 }}
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(i, 'quantity', e.target.value)} 
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            type="number" variant="standard" fullWidth 
                            inputProps={{ style: { textAlign: 'right' }, min: 0, step: "0.01" }}
                            value={item.unit_price} 
                            onChange={(e) => handleItemChange(i, 'unit_price', e.target.value)} 
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            type="number" variant="standard" fullWidth 
                            inputProps={{ style: { textAlign: 'right' }, min: 0 }}
                            value={item.discount} 
                            onChange={(e) => handleItemChange(i, 'discount', e.target.value)} 
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            fullWidth variant="standard" disableUnderline
                            value={item.tax_rate} 
                            onChange={(e) => handleItemChange(i, 'tax_rate', e.target.value)}
                            sx={{ fontSize: '0.875rem', textAlign: 'right' }}
                          >
                            <MenuItem value={0.07}>7% ITBMS</MenuItem>
                            <MenuItem value={0.00}>Exento</MenuItem>
                            <MenuItem value={0.10}>10% Alcohol</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${lineTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeItem(i)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Button startIcon={<AddCircleOutlineIcon />} onClick={addItem} sx={{ textTransform: 'none' }}>
                        Agregar Línea
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: Totales */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>Resumen</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Subtotal Gravable:</Typography>
              <Typography variant="body2" fontWeight={600}>${totals.subtotalTaxable.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Subtotal Exento:</Typography>
              <Typography variant="body2" fontWeight={600}>${totals.subtotalExempt.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="error.main">Descuento:</Typography>
              <Typography variant="body2" color="error.main">-${totals.totalDiscount.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary">ITBMS (7%):</Typography>
              <Typography variant="body2" fontWeight={600}>${totals.totalTax.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h5" color="primary.main" fontWeight={700}>
                ${totals.totalAmount.toFixed(2)}
              </Typography>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large" 
              startIcon={!saving && <SaveIcon />}
              disabled={saving}
              sx={{ mt: 3 }}
            >
              {saving ? 'Procesando...' : 'Confirmar Orden'}
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default SalesOrderFormPage;