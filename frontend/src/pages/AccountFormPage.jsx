import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Paper, Alert, 
  MenuItem, CircularProgress, Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { createAccount, getAccounts } from '../api/accountingService';
import { useAuth } from '../context/AuthContext';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Activo' },
  { value: 'LIABILITY', label: 'Pasivo' },
  { value: 'EQUITY', label: 'Patrimonio' },
  { value: 'REVENUE', label: 'Ingresos' },
  { value: 'EXPENSE', label: 'Gastos' },
];

const AccountFormPage = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    account_type: 'ASSET',
    parent: '', // ID de la cuenta padre
    description: ''
  });
  
  const [parents, setParents] = useState([]); // Lista para el dropdown de padres
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar cuentas existentes para poder elegir un Padre
  useEffect(() => {
    const fetchParents = async () => {
      if (!tokens?.access) return;
      try {
        const data = await getAccounts(tokens.access);
        setParents(data.results || data); // Manejo de paginación si aplica
      } catch (err) {
        console.error("Error cargando cuentas padre", err);
      }
    };
    fetchParents();
  }, [tokens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Si el padre está vacío, mandamos null al backend
    const payload = {
        ...formData,
        parent: formData.parent === '' ? null : formData.parent
    };

    try {
      await createAccount(payload, tokens.access);
      navigate('/accounts'); // Volver a la lista (asumiendo que existe la ruta)
    } catch (err) {
      setError("Error al crear la cuenta. Verifica que el código sea único.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/accounts')} sx={{ mb: 2, mt: 2 }}>
        Volver
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Nueva Cuenta Contable
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Código (ej. 1.1.01)" name="code"
                value={formData.code} onChange={handleChange}
                required autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth label="Nombre de la Cuenta" name="name"
                value={formData.name} onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Tipo de Cuenta" name="account_type"
                value={formData.account_type} onChange={handleChange}
              >
                {ACCOUNT_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Cuenta Padre (Opcional)" name="parent"
                value={formData.parent} onChange={handleChange}
                helperText="Selecciona para crear una sub-cuenta"
              >
                <MenuItem value=""><em>Sin Padre (Cuenta Raíz)</em></MenuItem>
                {parents.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={2} label="Descripción" name="description"
                value={formData.description} onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit" variant="contained" size="large"
              startIcon={loading ? <CircularProgress size={20}/> : <SaveIcon />}
              disabled={loading}
            >
              Guardar Cuenta
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountFormPage;