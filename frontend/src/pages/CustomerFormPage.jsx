import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert
} from '@mui/material';
// Import the new service function and the auth hook
import { createCustomer } from '../api/salesService.js';
import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom';

const CustomerFormPage = () => {
  const { tokens } = useAuth(); // Get tokens
  const [formData, setFormData] = useState({
    name: '', contact_person: '', email: '', phone_number: '', address: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleChange = (event) => { /* ... (no changes) ... */
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Updated handleSubmit
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!tokens?.access) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    try {
      // Call the createCustomer service
      const newCustomer = await createCustomer(formData, tokens.access);
      console.log('Customer created successfully:', newCustomer);
      // TODO: Add success message/notification
      // navigate('/customers'); // Redirect later
      // Optionally clear form:
      setFormData({ name: '', contact_person: '', email: '', phone_number: '', address: '' });

    } catch (err) {
      console.error('Failed to create customer:', err);
      setError(`Error al guardar: ${err.message}` || 'An error occurred while saving the customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Añadir Nuevo Cliente
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
             {/* ... TextFields remain the same ... */}
             <Grid item xs={12}>
               <TextField name="name" required fullWidth id="customerName" label="Nombre del Cliente" autoFocus value={formData.name} onChange={handleChange}/>
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField name="contact_person" fullWidth id="contactPerson" label="Persona de Contacto" value={formData.contact_person} onChange={handleChange}/>
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField name="email" fullWidth id="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange}/>
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField name="phone_number" fullWidth id="phoneNumber" label="Número de Teléfono" value={formData.phone_number} onChange={handleChange}/>
             </Grid>
             <Grid item xs={12}>
               <TextField name="address" fullWidth multiline rows={3} id="address" label="Dirección" value={formData.address} onChange={handleChange}/>
             </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CustomerFormPage;