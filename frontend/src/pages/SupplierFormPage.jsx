import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createSupplier } from '../api/purchasingService';
import { useNavigate } from 'react-router-dom';

const SupplierFormPage = () => {
  const navigate = useNavigate();
  
  // Estado inicial alineado con el Backend
  const [formData, setFormData] = useState({
    name: '', 
    supplier_type: 'Local', // Valor por defecto crítico
    ruc: '', 
    dv: '',
    contact_person: '', 
    email: '', 
    phone_number: '', 
    address: '',
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // VALIDACIÓN CRÍTICA
    if (!formData.name) {
        setError("La Razón Social es obligatoria.");
        setLoading(false);
        return;
    }
    
    // Si es Local, exigimos RUC. Si es Extranjero, somos más flexibles.
    if (formData.supplier_type === 'Local' && !formData.ruc) {
        setError("El RUC es obligatorio para proveedores locales (DGI).");
        setLoading(false);
        return;
    }

    try {
      await createSupplier(formData);
      navigate('/suppliers');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al guardar proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/suppliers')} sx={{ my: 2 }}>
        Volver a Lista
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={1} fontWeight={700}>Nuevo Proveedor</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Configuración Fiscal para Retenciones Automáticas
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            
            {/* SECCIÓN 1: DATOS FISCALES (Lo más importante) */}
            <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" fontWeight={600}>Clasificación Fiscal</Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField 
                select 
                fullWidth 
                label="Tipo de Proveedor" 
                name="supplier_type" 
                value={formData.supplier_type} 
                onChange={handleChange}
                helperText="Define la regla de retención de impuestos"
              >
                <MenuItem value="Local">Local (Panamá)</MenuItem>
                <MenuItem value="Foreign">Extranjero (Internacional)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={5}>
              <TextField 
                fullWidth 
                label={formData.supplier_type === 'Local' ? "RUC (Obligatorio)" : "Tax ID / RUC"} 
                name="ruc" 
                value={formData.ruc} 
                onChange={handleChange} 
                required={formData.supplier_type === 'Local'}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField 
                fullWidth 
                label="DV" 
                name="dv" 
                value={formData.dv} 
                onChange={handleChange} 
                disabled={formData.supplier_type === 'Foreign'}
                helperText={formData.supplier_type === 'Local' ? "Dígito Verificador" : "No aplica"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Razón Social / Nombre de la Empresa" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
              />
            </Grid>

            {/* SECCIÓN 2: CONTACTO */}
            <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={600}>Contacto y Pagos</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Persona de Contacto" name="contact_person" value={formData.contact_person} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email para Órdenes" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth label="Dirección Física / Entrega" name="address" multiline rows={2} value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Guardando...' : 'Registrar Proveedor'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SupplierFormPage;