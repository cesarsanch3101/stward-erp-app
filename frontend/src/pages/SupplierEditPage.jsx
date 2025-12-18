import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert, CircularProgress 
} from '@mui/material';
import { getSuppliers, updateSupplier } from '../api/purchasingService'; // Usamos getSuppliers filtrado o necesitamos getSupplierDetails
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios'; // Import directo para obtener detalle si no existe la fn en servicio

const SupplierEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        // Obtenemos el detalle directamente (asegúrate que tu API soporte GET /suppliers/{id}/)
        // O agrega la función getSupplierDetails en purchasingService.js
        const response = await apiClient.get(`/suppliers/${id}/`);
        setFormData(response.data);
      } catch (err) {
        setError('Error al cargar datos del proveedor.');
      } finally {
        setLoading(false);
      }
    };
    loadSupplier();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSupplier(id, formData); // Asegúrate de tener esta función en purchasingService (la corregimos en el paso anterior)
      navigate('/suppliers');
    } catch (err) {
      setError('Error al actualizar proveedor.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" mb={3}>Editar Proveedor</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField fullWidth label="Empresa" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
                <TextField fullWidth label="Contacto" name="contact_person" value={formData.contact_person} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
                <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
                <TextField fullWidth label="Teléfono" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Dirección" name="address" value={formData.address} onChange={handleChange} />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => navigate('/suppliers')}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar Cambios</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SupplierEditPage;