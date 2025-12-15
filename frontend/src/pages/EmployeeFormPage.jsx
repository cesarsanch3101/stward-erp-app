import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert } from '@mui/material';
import { createEmployee } from '../api/employeeService';
// NOTA: Ya no necesitamos tokens del AuthContext
import { useNavigate } from 'react-router-dom';

const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', position: '', hire_date: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // LLAMADA CORREGIDA: Sin pasar token
      await createEmployee(formData);
      console.log('Employee created successfully');
      navigate('/employees');
    } catch (err) {
      console.error('Failed to create employee:', err);
      // Extraemos mensaje de error del backend si existe
      const msg = err.response?.data?.detail || err.message || 'Error al guardar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>Añadir Nuevo Empleado</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="first_name" required fullWidth label="Nombre" autoFocus value={formData.first_name} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone_number" fullWidth label="Teléfono" value={formData.phone_number} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="position" fullWidth label="Puesto" value={formData.position} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="hire_date" label="Fecha Contratación" type="date" InputLabelProps={{ shrink: true }} value={formData.hire_date} onChange={handleChange}/>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeFormPage;