import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, Divider, 
  FormControlLabel, Switch
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { getSuppliers, createPurchaseOrder } from '../api/purchasingService';
import { getProducts } from '../api/inventoryService';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderFormPage = () => {
  const navigate = useNavigate();
  
  // CABECERA DEL DOCUMENTO
  const [header, setHeader] = useState({ 
    supplier: '', 
    expected_delivery_date: '',
    apply_retention: true, // Por defecto, asumimos que retenemos impuesto
    is_gross_up: false     // Solo relevante para extranjeros
  });
  
  // DETALLE (ITEMS)
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: 0, tax_rate: 0.07 }
  ]);
  
  // CATÁLOGOS
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // LOGICA VISUAL
  const [selectedSupplierType, setSelectedSupplierType] = useState('Local'); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Traemos proveedores y productos al mismo tiempo
        const [suppData, prodData] = await Promise.all([
          getSuppliers(1, 100), 
          getProducts(1, 100) 
        ]);
        
        // Manejo seguro de arrays (DRF pagination vs array directo)
        setSuppliers(Array.isArray(suppData) ? suppData : (suppData.results || []));
        setProducts(Array.isArray(prodData) ? prodData : (prodData.results || []));
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los catálogos. Verifique conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. DETECTAR TIPO DE PROVEEDOR AL SELECCIONAR
  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    const supp = suppliers.find(s => s.id === supplierId);
    
    setHeader(prev => ({ ...prev, supplier: supplierId }));
    
    if (supp) {
        setSelectedSupplierType(supp.supplier_type); // Actualiza la lógica visual
        // Si es extranjero, por defecto podríamos activar o desactivar gross-up
    }
  };

  // 3. MOTOR DE CÁLCULO EN VIVO (USEMEMO)
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    // Sumar líneas
    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      
      const lineTotal = qty * price;
      subtotal += lineTotal;
      totalTax += (lineTotal * taxRate);
    });

    // Calcular Retención Fiscal
    let retention = 0;
    if (header.apply_retention && totalTax > 0) {
        if (selectedSupplierType === 'Local') {
            retention = totalTax * 0.50; // Agente de Retención Local (50%)
        } else if (selectedSupplierType === 'Foreign') {
            retention = totalTax * 1.00; // Parámetro 4: Pagos al exterior (100%)
        }
    }

    const totalFactura = subtotal + totalTax;
    const payable = totalFactura - retention; // Lo que sale del banco

    return { subtotal, totalTax, retention, totalFactura, payable };
  }, [items, header.apply_retention, selectedSupplierType]);

  // MANEJADORES DE ITEMS
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const addItem = () => setItems([...items, { product: '', quantity: 1, unit_price: 0, tax_rate: 0.07 }]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));

  // ENVIAR AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.supplier) return setError("Debe seleccionar un proveedor.");
    if (items.some(i => !i.product || i.quantity <= 0)) return setError("Revise las líneas de productos.");
    
    setSaving(true);
    try {
      const payload = {
        ...header,
        expected_delivery_date: header.expected_delivery_date || null,
        items: items.map(i => ({
            ...i,
            quantity: parseFloat(i.quantity),
            unit_price: parseFloat(i.unit_price),
            tax_rate: parseFloat(i.tax_rate)
        }))
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

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl">
      <Box display="flex" alignItems="center" mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/purchase-orders')} sx={{ mr: 2 }}>
          Cancelar
        </Button>
        <Typography variant="h5" fontWeight={700}>Nueva Orden de Compra</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <Grid item xs={12} md={9}>
            {/* CABECERA */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth required size="small">
                            <InputLabel>Proveedor</InputLabel>
                            <Select value={header.supplier} label="Proveedor" onChange={handleSupplierChange}>
                            {suppliers.map(s => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name} — <Typography variant="caption" sx={{ ml: 1, fontWeight: 'bold' }}>{s.supplier_type === 'Foreign' ? 'EXTRANJERO' : 'LOCAL'}</Typography>
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField 
                            fullWidth type="date" label="Fecha Esperada" size="small"
                            InputLabelProps={{ shrink: true }} 
                            value={header.expected_delivery_date} 
                            onChange={(e) => setHeader({ ...header, expected_delivery_date: e.target.value })} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4} display="flex" alignItems="center">
                         <Box sx={{ border: '1px dashed #ccc', p: 1, borderRadius: 1, width: '100%' }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={header.apply_retention} 
                                        onChange={(e) => setHeader({...header, apply_retention: e.target.checked})} 
                                        color="primary"
                                    />
                                }
                                label={<Typography variant="body2">Aplicar Retención de Ley</Typography>}
                            />
                         </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* TABLA DE PRODUCTOS */}
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f6f7' }}>
                        <TableRow>
                        <TableCell width="35%">Producto / Servicio</TableCell>
                        <TableCell width="12%" align="right">Cantidad</TableCell>
                        <TableCell width="15%" align="right">Costo Unit.</TableCell>
                        <TableCell width="15%" align="right">Impuesto</TableCell>
                        <TableCell width="15%" align="right">Subtotal</TableCell>
                        <TableCell width="5%"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Select fullWidth variant="standard" disableUnderline displayEmpty value={item.product} onChange={(e) => handleItemChange(index, 'product', e.target.value)}>
                                    <MenuItem value="" disabled>Seleccione...</MenuItem>
                                    {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                                </Select>
                            </TableCell>
                            <TableCell>
                                <TextField type="number" variant="standard" fullWidth inputProps={{ style: { textAlign: 'right' } }} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <TextField type="number" variant="standard" fullWidth inputProps={{ style: { textAlign: 'right' } }} value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <Select fullWidth variant="standard" disableUnderline value={item.tax_rate} onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)} sx={{ textAlign: 'right' }}>
                                    <MenuItem value={0.07}>7% ITBMS</MenuItem>
                                    <MenuItem value={0.00}>Exento (0%)</MenuItem>
                                    <MenuItem value={0.10}>10% (Licor)</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                ${(item.quantity * item.unit_price).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <IconButton color="error" size="small" onClick={() => removeItem(index)}><DeleteIcon fontSize="small" /></IconButton>
                            </TableCell>
                        </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={6}>
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

        {/* COLUMNA DERECHA: TOTALES Y PAGO */}
        <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa', position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>Desglose de Pago</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight={600}>${totals.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">ITBMS Calc:</Typography>
                    <Typography variant="body2" fontWeight={600}>${totals.totalTax.toFixed(2)}</Typography>
                </Box>
                
                {/* Lógica de Retención Visual */}
                {totals.retention > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1} sx={{ color: 'warning.main', bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2">
                            Retención ({selectedSupplierType === 'Local' ? '50%' : '100%'}):
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>-${totals.retention.toFixed(2)}</Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Total a Pagar:</Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                        ${totals.payable.toFixed(2)}
                    </Typography>
                </Box>
                <Typography variant="caption" display="block" align="right" color="text.secondary" mt={0.5}>
                    (Total Factura Original: ${totals.totalFactura.toFixed(2)})
                </Typography>

                <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    disabled={saving} 
                    sx={{ mt: 3, py: 1.5 }} 
                    startIcon={<SaveIcon />}
                >
                    {saving ? 'Procesando...' : 'Confirmar Orden'}
                </Button>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PurchaseOrderFormPage;