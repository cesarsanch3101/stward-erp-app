import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, InputLabel, FormControl,
  Box, Typography, Alert, CircularProgress, Grid
} from '@mui/material';
import { getBankAccounts, getCashRegisters, createTreasuryMovement } from '../api/treasuryService';

// CORRECCIÓN: Eliminamos 'token' de las props
const TransactionModal = ({ open, onClose, type, order, onSuccess }) => {
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [banks, setBanks] = useState([]);
  const [cashes, setCashes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    targetType: 'Bank',
    targetId: ''
  });

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setLoadingOptions(true);
        try {
          // CORRECCIÓN: Llamadas limpias sin token
          const [b, c] = await Promise.all([
            getBankAccounts(),
            getCashRegisters()
          ]);
          setBanks(b || []);
          setCashes(c || []);
          
          setFormData(prev => ({
            ...prev,
            amount: order?.total_amount || '',
            description: type === 'Income' 
              ? `Cobro Factura #${order?.id} - ${order?.customer_name}`
              : `Pago Compra #${order?.id} - ${order?.supplier_name}`
          }));

        } catch (err) {
          console.error(err);
          setError("Error cargando cuentas de tesorería.");
        } finally {
          setLoadingOptions(false);
        }
      };
      loadData();
    }
  }, [open, order, type]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        movement_type: type,
        amount: formData.amount,
        description: formData.description,
        customer: type === 'Income' ? order.customer : null,
        supplier: type === 'Expense' ? order.supplier : null,
      };

      if (type === 'Income') {
        if (formData.targetType === 'Bank') payload.to_bank_account = formData.targetId;
        else payload.to_cash_register = formData.targetId;
      } else {
        if (formData.targetType === 'Bank') payload.from_bank_account = formData.targetId;
        else payload.from_cash_register = formData.targetId;
      }

      // CORRECCIÓN: Llamada sin token
      await createTreasuryMovement(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const title = type === 'Income' ? 'Registrar Cobro' : 'Registrar Pago';
  const targetLabel = type === 'Income' ? 'Destino (Entra en)' : 'Origen (Sale de)';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loadingOptions ? <CircularProgress /> : (
          <Box sx={{ mt: 1 }}>
             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
             
             <Typography variant="subtitle1" gutterBottom>
               Total Orden: <b>${parseFloat(order?.total_amount).toFixed(2)}</b>
             </Typography>

             <Grid container spacing={2}>
               <Grid item xs={6}>
                 <FormControl fullWidth margin="dense">
                   <InputLabel>Medio</InputLabel>
                   <Select name="targetType" value={formData.targetType} label="Medio" onChange={handleChange}>
                     <MenuItem value="Bank">Cuenta Bancaria</MenuItem>
                     <MenuItem value="Cash">Caja Chica</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={6}>
                 <FormControl fullWidth margin="dense">
                    <InputLabel>{targetLabel}</InputLabel>
                    <Select name="targetId" value={formData.targetId} label={targetLabel} onChange={handleChange}>
                      {formData.targetType === 'Bank' 
                        ? banks.map(b => <MenuItem key={b.id} value={b.id}>{b.name} ({b.bank_name})</MenuItem>)
                        : cashes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)
                      }
                    </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12}>
                 <TextField 
                    fullWidth label="Monto a Pagar" type="number" 
                    name="amount" value={formData.amount} onChange={handleChange} 
                  />
               </Grid>
               <Grid item xs={12}>
                 <TextField 
                    fullWidth multiline rows={2} label="Concepto / Nota" 
                    name="description" value={formData.description} onChange={handleChange} 
                  />
               </Grid>
             </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving}>
          {saving ? 'Registrando...' : 'Confirmar Transacción'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;