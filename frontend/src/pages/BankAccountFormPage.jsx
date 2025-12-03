import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Container, Paper, Alert, CircularProgress 
} from '@mui/material';
import { createBankAccount } from '../api/treasuryService';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const BankAccountFormPage = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    account_number: '',
    initial_balance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokens?.access) return;

    setLoading(true);
    setError(null);

    try {
      await createBankAccount(formData, tokens.access);
      console.log("Cuenta creada con éxito");
      // Redirigir a la lista de cuentas después de crear
      navigate('/bank-accounts');
    } catch (err) {
      console.error(err);
      // Mensaje de error amigable
      const msg = err.response?.data?.detail || "Error al crear la cuenta. Verifique los datos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Nueva Cuenta Bancaria
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField 
            fullWidth margin="normal" 
            label="Nombre de la Cuenta (Alias)" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            autoFocus
            helperText="Ej: Cuenta Operativa Principal"
          />
          <TextField 
            fullWidth margin="normal" 
            label="Nombre del Banco" 
            name="bank_name" 
            value={formData.bank_name} 
            onChange={handleChange} 
            required 
            helperText="Ej: Banco General"
          />
          <TextField 
            fullWidth margin="normal" 
            label="Número de Cuenta" 
            name="account_number" 
            value={formData.account_number} 
            onChange={handleChange} 
            required 
          />
          <TextField 
            fullWidth margin="normal" 
            label="Saldo Inicial" 
            name="initial_balance" 
            type="number" 
            inputProps={{ step: "0.01", min: "0" }} 
            value={formData.initial_balance} 
            onChange={handleChange} 
            required 
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar Cuenta'}
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => navigate('/bank-accounts')}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BankAccountFormPage;