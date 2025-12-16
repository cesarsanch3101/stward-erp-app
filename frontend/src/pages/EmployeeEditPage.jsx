import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import { getEmployee, updateEmployee } from '../api/employeeService';
// Eliminamos useAuth porque no necesitamos leer tokens manualmente
import { useParams, useNavigate } from 'react-router-dom';

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', position: '', hire_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // CORRECCIÓN: Eliminamos la verificación de if (!tokens?.access)
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // El cliente axios envía la cookie automáticamente
        const data = await getEmployee(id);
        setFormData(data);
      } catch (err) {
        setError('Error al cargar los datos del empleado.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // CORRECCIÓN: No pasamos token, solo data
      await updateEmployee(id, formData);
      console.log('Empleado actualizado');
      navigate('/employees');
    } catch (err) {
      setError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Editar Empleado
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="first_name" required fullWidth label="Nombre" value={formData.first_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Apellido" name="last_name" value={formData.last_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="phone_number" fullWidth label="Teléfono" value={formData.phone_number} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="position" fullWidth label="Puesto" value={formData.position} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="hire_date" label="Fecha Contratación" type="date" InputLabelProps={{ shrink: true }} value={formData.hire_date} onChange={handleChange} />
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/employees')}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployeeEditPage;