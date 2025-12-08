import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert, CircularProgress 
} from '@mui/material';
import { getCustomerDetails, updateCustomer } from '../api/salesService'; 
import { useAuth } from '../context/AuthContext.jsx';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerEditPage = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al entrar
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const data = await getCustomerDetails(id, tokens.access);
        setFormData(data);
      } catch (err) {
        setError('Error al cargar datos del cliente.');
      } finally {
        setLoading(false);
      }
    };
    if (tokens?.access) loadCustomer();
  }, [id, tokens]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCustomer(id, formData, tokens.access);
      navigate('/customers'); // Éxito: Volver a la lista
    } catch (err) {
      setError('Error al actualizar cliente.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" mb={3}>Editar Cliente</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField fullWidth label="Nombre Empresa" name="name" value={formData.name} onChange={handleChange} required />
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
            <Button variant="outlined" onClick={() => navigate('/customers')}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar Cambios</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerEditPage;