import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress, Divider, 
  FormControlLabel, Switch, ListItemText
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
  
  // --- ESTADOS DEL FORMULARIO ---
  const [header, setHeader] = useState({ 
    supplier: '', 
    expected_delivery_date: '',
    apply_retention: true, // Default: Somos agentes de retención
    is_gross_up: false 
  });
  
  const [items, setItems] = useState([
    { product: '', quantity: 1, unit_price: 0, tax_rate: 0.07 }
  ]);
  
  // --- DATOS EXTERNOS ---
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplierType, setSelectedSupplierType] = useState('Local'); 
  
  // --- UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suppData, prodData] = await Promise.all([
          getSuppliers(1, 100), // Traer 100 proveedores para el combo
          getProducts(1, 100) 
        ]);
        
        setSuppliers(Array.isArray(suppData) ? suppData : (suppData.results || []));
        setProducts(Array.isArray(prodData) ? prodData : (prodData.results || []));
      } catch (err) {
        console.error(err);
        setError('Error de conexión al cargar catálogos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. SELECCIÓN DE PROVEEDOR (Detectar si es Local/Extranjero)
  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    const supp = suppliers.find(s => s.id === supplierId);
    
    setHeader(prev => ({ ...prev, supplier: supplierId }));
    
    if (supp) {
        setSelectedSupplierType(supp.supplier_type);
        // Si es extranjero, por defecto podríamos ajustar la lógica aquí si fuera necesario
    }
  };

  // 3. MOTOR DE CÁLCULO FISCAL (En Vivo)
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      
      const lineTotal = qty * price;
      subtotal += lineTotal;
      totalTax += (lineTotal * taxRate);
    });

    // Lógica de Retención DGI
    let retention = 0;
    if (header.apply_retention && totalTax > 0) {
        if (selectedSupplierType === 'Local') {
            retention = totalTax * 0.50; // Local: 50% del ITBMS
        } else if (selectedSupplierType === 'Foreign') {
            retention = totalTax * 1.00; // Extranjero: 100% del ITBMS
        }
    }

    const totalFactura = subtotal + totalTax;
    const payable = totalFactura - retention;

    return { subtotal, totalTax, retention, totalFactura, payable };
  }, [items, header.apply_retention, selectedSupplierType]);

  // Manejo de la tabla de productos
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const addItem = () => setItems([...items, { product: '', quantity: 1, unit_price: 0, tax_rate: 0.07 }]);
  const removeItem = (i) => setItems(items.filter((_, index) => index !== i));

  // Guardar Orden
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.supplier) return setError("Debe seleccionar un proveedor.");
    if (items.some(i => !i.product || i.quantity <= 0)) return setError("Revise las líneas de productos (cantidad debe ser > 0).");
    
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
      setError(err.message || "Error al guardar la orden.");
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
        
        {/* IZQUIERDA: DATOS */}
        <Grid item xs={12} md={9}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required size="small">
                            <InputLabel>Proveedor</InputLabel>
                            <Select 
                                value={header.supplier} 
                                label="Proveedor" 
                                onChange={handleSupplierChange}
                                renderValue={(selected) => {
                                    const s = suppliers.find(sup => sup.id === selected);
                                    return s ? s.name : selected;
                                }}
                            >
                            {suppliers.map(s => (
                                <MenuItem key={s.id} value={s.id} divider>
                                    <ListItemText 
                                        primary={s.name} 
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {s.ruc || 'S/R'}
                                                </Typography>
                                                {" — "}
                                                {s.supplier_type === 'Foreign' ? '🌎 EXTRANJERO' : '🇵🇦 LOCAL'}
                                            </React.Fragment>
                                        } 
                                    />
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField 
                            fullWidth type="date" label="Fecha Entrega" size="small"
                            InputLabelProps={{ shrink: true }} 
                            value={header.expected_delivery_date} 
                            onChange={(e) => setHeader({ ...header, expected_delivery_date: e.target.value })} 
                        />
                    </Grid>
                    <Grid item xs={12} md={3} display="flex" alignItems="center">
                        <Box sx={{ border: '1px dashed #ccc', px: 2, py: 0.5, borderRadius: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={header.apply_retention} 
                                        onChange={(e) => setHeader({...header, apply_retention: e.target.checked})} 
                                        size="small"
                                    />
                                }
                                label={<Typography variant="caption" fontWeight="bold">Retener ITBMS</Typography>}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f6f7' }}>
                        <TableRow>
                        <TableCell width="35%">Producto</TableCell>
                        <TableCell width="12%" align="right">Cant.</TableCell>
                        <TableCell width="15%" align="right">Costo</TableCell>
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
                                    <MenuItem value={0.00}>Exento</MenuItem>
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

        {/* DERECHA: TOTALES */}
        <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa', position: 'sticky', top: 20 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Resumen de Pago</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight={600}>${totals.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">ITBMS:</Typography>
                    <Typography variant="body2" fontWeight={600}>${totals.totalTax.toFixed(2)}</Typography>
                </Box>
                
                {/* Lógica de Retención Visual */}
                {totals.retention > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1} sx={{ color: 'warning.dark', bgcolor: 'warning.light', px: 1, borderRadius: 0.5 }}>
                        <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                            Retención ({selectedSupplierType === 'Local' ? '50%' : '100%'}):
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>-${totals.retention.toFixed(2)}</Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontSize="1rem">A Pagar:</Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700} fontSize="1.2rem">
                        ${totals.payable.toFixed(2)}
                    </Typography>
                </Box>
                
                <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    disabled={saving} 
                    sx={{ mt: 3 }} 
                    startIcon={<SaveIcon />}
                >
                    {saving ? 'Guardando...' : 'Confirmar Orden'}
                </Button>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PurchaseOrderFormPage;