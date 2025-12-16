import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Paper, Alert, 
  MenuItem, CircularProgress, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { createAccount, getAccounts } from '../api/accountingService';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Activo' }, { value: 'LIABILITY', label: 'Pasivo' },
  { value: 'EQUITY', label: 'Patrimonio' }, { value: 'REVENUE', label: 'Ingresos' },
  { value: 'EXPENSE', label: 'Gastos' },
];

const AccountFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '', name: '', account_type: 'ASSET', parent: '', description: ''
  });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccounts().then(data => setParents(data.results || data)).catch(console.error);
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAccount({ ...formData, parent: formData.parent || null });
      navigate('/accounts');
    } catch (err) {
      setError("Error al crear la cuenta. Verifica el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/accounts')} sx={{ my: 2 }}>Volver</Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nueva Cuenta Contable</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Código" name="code" required value={formData.code} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Nombre" name="name" required value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Tipo" name="account_type" value={formData.account_type} onChange={handleChange}>
                {ACCOUNT_TYPES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Padre (Opcional)" name="parent" value={formData.parent} onChange={handleChange}>
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {parents.map(p => <MenuItem key={p.id} value={p.id}>{p.code} - {p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Descripción" name="description" value={formData.description} onChange={handleChange} />
            </Grid>
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

export default AccountFormPage;