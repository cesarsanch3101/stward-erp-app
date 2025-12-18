import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert, MenuItem, FormHelperText } from '@mui/material';
import { createCustomer } from '../api/salesService';
import { useNavigate } from 'react-router-dom';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
    ruc: '', dv: '', taxpayer_type: 'Juridico'
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validación de RUC Panameño (Frontend)
  const validateRUC = (ruc, type) => {
    if (!ruc) return "El RUC es obligatorio.";
    if (type === 'Juridico') {
      // Validar formato numérico con guiones opcionales (Ej: 1556988-1-2024)
      const rucRegex = /^[\d-]+$/;
      if (!rucRegex.test(ruc)) return "RUC Jurídico inválido (solo números y guiones).";
    }
    // Añadir lógica para Natural si es necesario
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error al escribir
    if (errors[name]) {
        setErrors({...errors, [name]: null});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    // Validaciones Locales
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nombre requerido";
    const rucError = validateRUC(formData.ruc, formData.taxpayer_type);
    if (rucError) newErrors.ruc = rucError;
    if (!formData.dv) newErrors.dv = "DV requerido";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setLoading(true);
    try {
      await createCustomer(formData);
      navigate('/customers');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ p: 4, mt: 4, border: '1px solid #E0E0E0', borderRadius: 2 }}>
        <Typography variant="h5" mb={1} fontWeight={700} color="text.primary">Nuevo Cliente</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">Complete la información fiscal y de contacto.</Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Razón Social / Nombre" name="name" autoFocus 
                value={formData.name} onChange={handleChange} 
                error={!!errors.name} helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
               <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main', fontWeight: 600 }}>
                 Información Fiscal (DGI Panamá)
               </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
               <TextField select fullWidth label="Tipo Contribuyente" name="taxpayer_type" value={formData.taxpayer_type} onChange={handleChange}>
                  <MenuItem value="Juridico">Persona Jurídica</MenuItem>
                  <MenuItem value="Natural">Persona Natural</MenuItem>
                  <MenuItem value="Extranjero">Extranjero</MenuItem>
               </TextField>
            </Grid>
            <Grid item xs={12} sm={5}>
               <TextField 
                 fullWidth label="RUC" name="ruc" 
                 value={formData.ruc} onChange={handleChange} 
                 placeholder="Ej: 1556988-1-2024"
                 error={!!errors.ruc} helperText={errors.ruc}
               />
            </Grid>
            <Grid item xs={12} sm={3}>
               <TextField 
                 fullWidth label="DV" name="dv" 
                 value={formData.dv} onChange={handleChange} 
                 placeholder="00"
                 error={!!errors.dv} helperText={errors.dv}
               />
            </Grid>

            <Grid item xs={12}>
               <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'primary.main', fontWeight: 600 }}>
                 Contacto
               </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Contacto" name="contact_person" value={formData.contact_person} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Dirección Física" name="address" multiline rows={2} value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>
          
          {apiError && <Alert severity="error" sx={{ mt: 3 }}>{apiError}</Alert>}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/customers')} disabled={loading}>
                Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 120 }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerFormPage;