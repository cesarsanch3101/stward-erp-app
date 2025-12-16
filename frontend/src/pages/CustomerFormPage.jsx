import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert } from '@mui/material';
import { createCustomer } from '../api/salesService';
import { useNavigate } from 'react-router-dom';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createCustomer(formData); // Llamada limpia
      navigate('/customers');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al guardar el cliente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nuevo Cliente</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Razón Social / Nombre" name="name" autoFocus required value={formData.name} onChange={handleChange} />
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
              <TextField fullWidth label="Dirección" name="address" multiline rows={2} value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/customers')} sx={{ mr: 1 }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerFormPage;