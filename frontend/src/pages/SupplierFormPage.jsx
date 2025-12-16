import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createSupplier } from '../api/purchasingService';
import { useNavigate } from 'react-router-dom';

const SupplierFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSupplier(formData);
      navigate('/suppliers');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/suppliers')} sx={{ my: 2 }}>Volver</Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nuevo Proveedor</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Empresa" name="name" required value={formData.name} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Contacto" name="contact_person" value={formData.contact_person} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Dirección" name="address" multiline rows={2} value={formData.address} onChange={handleChange} /></Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SupplierFormPage;