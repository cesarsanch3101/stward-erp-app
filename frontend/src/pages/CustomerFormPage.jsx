import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createCustomer } from '../api/salesService';
import { useNavigate } from 'react-router-dom';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    ruc: '', 
    dv: '', 
    taxpayer_type: 'Juridico',
    contact_person: '',  // ✅ Campo recuperado
    email: '', 
    phone_number: '', 
    address: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Razón Social requerida";
    
    if (formData.taxpayer_type !== 'Extranjero') {
        if (!formData.ruc) newErrors.ruc = "RUC obligatorio";
        if (formData.taxpayer_type === 'Juridico' && !formData.dv) newErrors.dv = "DV requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createCustomer(formData);
      navigate('/customers');
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Error al guardar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/customers')} sx={{ my: 2 }}>
        Volver
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={1} fontWeight={700}>Nuevo Cliente</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Información Fiscal y Comercial
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* SECCIÓN FISCAL */}
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600}>Fiscal (DGI)</Typography></Grid>
            <Grid item xs={12} sm={4}>
               <TextField select fullWidth label="Tipo" name="taxpayer_type" value={formData.taxpayer_type} onChange={handleChange}>
                  <MenuItem value="Juridico">Persona Jurídica</MenuItem>
                  <MenuItem value="Natural">Persona Natural</MenuItem>
                  <MenuItem value="Extranjero">Extranjero</MenuItem>
               </TextField>
            </Grid>
            <Grid item xs={12} sm={5}>
               <TextField fullWidth label="RUC / NT" name="ruc" value={formData.ruc} onChange={handleChange} error={!!errors.ruc} helperText={errors.ruc} />
            </Grid>
            <Grid item xs={12} sm={3}>
               <TextField fullWidth label="DV" name="dv" value={formData.dv} onChange={handleChange} error={!!errors.dv} helperText={errors.dv} disabled={formData.taxpayer_type === 'Natural'} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Razón Social" name="name" value={formData.name} onChange={handleChange} required error={!!errors.name} />
            </Grid>

            {/* SECCIÓN COMERCIAL */}
            <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="subtitle2" color="primary" fontWeight={600}>Comercial</Typography></Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Persona de Contacto" name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Ej: Lic. Juan Pérez" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Facturación" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Dirección Física" name="address" multiline rows={2} value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>
          
          {apiError && <Alert severity="error" sx={{ mt: 3 }}>{apiError}</Alert>}
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerFormPage;