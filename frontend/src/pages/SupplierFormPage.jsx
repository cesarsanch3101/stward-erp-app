import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// Importamos el servicio correcto de COMPRAS
import { createSupplier } from '../api/purchasingService';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const SupplierFormPage = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone_number: '',
    address: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!tokens?.access) {
      setError("Autenticación requerida.");
      setLoading(false);
      return;
    }

    try {
      // Llamamos a la función para crear PROVEEDOR (no ventas)
      await createSupplier(formData, tokens.access);
      console.log('Proveedor creado con éxito');
      navigate('/suppliers'); // Volver a la lista
    } catch (err) {
      console.error('Error al crear proveedor:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al guardar el proveedor.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/suppliers')} sx={{ mb: 2, mt: 2 }}>
        Volver
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Añadir Nuevo Proveedor
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
             <Grid item xs={12}>
               <TextField 
                 name="name" 
                 required 
                 fullWidth 
                 label="Nombre de la Empresa" 
                 autoFocus 
                 value={formData.name} 
                 onChange={handleChange}
               />
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField 
                 name="contact_person" 
                 fullWidth 
                 label="Persona de Contacto" 
                 value={formData.contact_person} 
                 onChange={handleChange}
               />
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField 
                 name="email" 
                 fullWidth 
                 label="Correo Electrónico" 
                 type="email" 
                 value={formData.email} 
                 onChange={handleChange}
               />
             </Grid>
             <Grid item xs={12} sm={6}>
               <TextField 
                 name="phone_number" 
                 fullWidth 
                 label="Número de Teléfono" 
                 value={formData.phone_number} 
                 onChange={handleChange}
               />
             </Grid>
             <Grid item xs={12}>
               <TextField 
                 name="address" 
                 fullWidth 
                 multiline 
                 rows={3} 
                 label="Dirección Física" 
                 value={formData.address} 
                 onChange={handleChange}
               />
             </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
                variant="outlined" 
                onClick={() => navigate('/suppliers')}
                disabled={loading}
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                disabled={loading}
            >
                {loading ? 'Guardando...' : 'Guardar Proveedor'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SupplierFormPage;