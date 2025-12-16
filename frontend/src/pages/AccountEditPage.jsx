import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Paper, Alert, 
  MenuItem, CircularProgress, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountById, updateAccount, getAccounts } from '../api/accountingService';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Activo' }, { value: 'LIABILITY', label: 'Pasivo' },
  { value: 'EQUITY', label: 'Patrimonio' }, { value: 'REVENUE', label: 'Ingresos' },
  { value: 'EXPENSE', label: 'Gastos' },
];

const AccountEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    code: '', name: '', account_type: '', parent: '', description: ''
  });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountData, allAccounts] = await Promise.all([
          getAccountById(id),
          getAccounts()
        ]);
        
        // Convertir parent object a ID si viene populado
        const parentId = accountData.parent ? (typeof accountData.parent === 'object' ? accountData.parent.id : accountData.parent) : '';
        
        setFormData({
          ...accountData,
          parent: parentId
        });
        
        // Filtrar para que una cuenta no pueda ser su propio padre
        const validParents = (Array.isArray(allAccounts) ? allAccounts : allAccounts.results || [])
          .filter(a => a.id !== parseInt(id));
          
        setParents(validParents);
      } catch (err) {
        setError("Error al cargar los datos de la cuenta.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAccount(id, { ...formData, parent: formData.parent || null });
      navigate('/accounts');
    } catch (err) {
      setError("Error al actualizar la cuenta. Verifique el código.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/accounts')} sx={{ my: 2 }}>Volver</Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Editar Cuenta Contable</Typography>
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
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountEditPage;