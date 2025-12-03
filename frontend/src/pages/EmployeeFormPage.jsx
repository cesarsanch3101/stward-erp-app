import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert } from '@mui/material';
// Import the new service function and the auth hook
import { createEmployee } from '../api/employeeService';
import { useAuth } from '../context/AuthContext.jsx';
// We'll use useNavigate later to redirect
// import { useNavigate } from 'react-router-dom';

const EmployeeFormPage = () => {
  const { tokens } = useAuth(); // Get tokens from context
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    position: '',
    hire_date: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Updated handleSubmit function
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!tokens) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    try {
      // Call the createEmployee service function
      const newEmployee = await createEmployee(formData, tokens.access);
      console.log('Employee created successfully:', newEmployee);
      // TODO: Add success message/notification
      // navigate('/employees'); // Redirect after success (later)

    } catch (err) {
      console.error('Failed to create employee:', err);
      // Set a user-friendly error message
      setError(err.message || 'An error occurred while saving the employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Añadir Nuevo Empleado
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* ... All TextField components remain the same ... */}
            <Grid item xs={12} sm={6}>
              <TextField name="first_name" required fullWidth id="firstName" label="Nombre" autoFocus value={formData.first_name} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth id="lastName" label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth id="email" label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone_number" fullWidth id="phoneNumber" label="Número de Teléfono" value={formData.phone_number} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="position" fullWidth id="position" label="Puesto" value={formData.position} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="hire_date" label="Fecha de Contratación" type="date" id="hireDate" InputLabelProps={{ shrink: true }} value={formData.hire_date} onChange={handleChange}/>
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeFormPage;