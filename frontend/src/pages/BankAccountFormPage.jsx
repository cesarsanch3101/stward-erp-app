import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Container, Paper, Alert, CircularProgress 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createBankAccount } from '../api/treasuryService';
import { useNavigate } from 'react-router-dom';

const BankAccountFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', bank_name: '', account_number: '', initial_balance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBankAccount(formData); // Sin token manual
      navigate('/bank-accounts');
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/bank-accounts')} sx={{ my: 2 }}>
        Volver
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={3} fontWeight={600}>Nueva Cuenta Bancaria</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth margin="normal" label="Alias / Nombre" name="name" required autoFocus value={formData.name} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Banco" name="bank_name" required value={formData.bank_name} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Número de Cuenta" name="account_number" required value={formData.account_number} onChange={handleChange} />
          <TextField fullWidth margin="normal" label="Saldo Inicial" name="initial_balance" type="number" required value={formData.initial_balance} onChange={handleChange} />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cuenta'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BankAccountFormPage;