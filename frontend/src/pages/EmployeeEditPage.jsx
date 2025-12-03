import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, Grid, Paper, Alert, CircularProgress } from '@mui/material';
// Importamos los servicios de lectura (get) y actualización (update)
import { getEmployee, updateEmployee } from '../api/employeeService';
import { useAuth } from '../context/AuthContext.jsx';
// Importamos useParams para leer el ID de la URL y useNavigate para salir al terminar
import { useParams, useNavigate } from 'react-router-dom';

const EmployeeEditPage = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL (ej: "1")
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', position: '', hire_date: '',
  });
  const [loading, setLoading] = useState(true); // Cargando datos iniciales
  const [saving, setSaving] = useState(false);  // Guardando cambios
  const [error, setError] = useState(null);

  // 1. Cargar los datos existentes al entrar
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!tokens?.access) return;
      try {
        setLoading(true);
        const data = await getEmployee(id, tokens.access);
        setFormData(data); // ¡Rellenamos el formulario con los datos reales!
      } catch (err) {
        setError('Error al cargar los datos del empleado.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, tokens]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Guardar los cambios
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateEmployee(id, formData, tokens.access);
      console.log('Empleado actualizado');
      navigate('/employees'); // Regresamos a la lista automáticamente
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
            {/* Los campos son idénticos al formulario de crear */}
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