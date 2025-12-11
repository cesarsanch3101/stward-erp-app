import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, Box, Typography, Divider, CircularProgress
} from '@mui/material';
import { getBankAccounts } from '../api/treasuryService';
import { createTreasuryMovement } from '../api/treasuryService';

const PaymentModal = ({ open, onClose, order, type = 'Expense', onSuccess }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [formData, setFormData] = useState({
    bank_account: '',
    amount: '',
    description: ''
  });
  const [error, setError] = useState(null);

  // Cargar cuentas bancarias al abrir el modal
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setLoadingBanks(true);
        try {
          const token = JSON.parse(localStorage.getItem('tokens'))?.access;
          const data = await getBankAccounts(token);
          setBanks(data || []);
          
          // Pre-llenar datos basados en la orden seleccionada
          if (order) {
            setFormData({
              bank_account: '',
              // Sugerimos el monto total pendiente (en un sistema real, calcularíamos saldo pendiente)
              amount: order.total_amount || '',
              description: `${type === 'Expense' ? 'Pago a Proveedor' : 'Cobro a Cliente'} - Orden #${order.id}`
            });
          }
        } catch (err) {
          console.error("Error cargando bancos:", err);
          setError("No se pudieron cargar las cuentas bancarias.");
        } finally {
          setLoadingBanks(false);
        }
      };
      loadData();
    }
  }, [open, order, type]);

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.bank_account || !formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Por favor seleccione una cuenta y un monto válido.");
      return;
    }

    setLoading(true);
    setError(null);
    const token = JSON.parse(localStorage.getItem('tokens'))?.access;

    try {
      // Construimos el payload para el Backend
      const payload = {
        movement_type: type, // 'Expense' (Pago) o 'Income' (Cobro)
        amount: formData.amount,
        description: formData.description,
        
        // Si es Gasto (Pago), el dinero sale del banco seleccionado
        from_bank_account: type === 'Expense' ? formData.bank_account : null,
        
        // Si es Ingreso (Cobro), el dinero entra al banco seleccionado
        to_bank_account: type === 'Income' ? formData.bank_account : null,
        
        // Enlace a la orden correspondiente para trazabilidad
        purchase_order: type === 'Expense' ? order?.id : null,
        sales_order: type === 'Income' ? order?.id : null,
      };

      await createTreasuryMovement(payload, token);
      
      if (onSuccess) onSuccess(); // Notificar al padre que refresque
      onClose(); // Cerrar modal
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al procesar la transacción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: type === 'Expense' ? '#ffebee' : '#e8f5e9', color: type === 'Expense' ? '#c62828' : '#2e7d32' }}>
        {type === 'Expense' ? 'Registrar Pago (Egreso)' : 'Registrar Cobro (Ingreso)'}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 2 }}>{error}</Alert>}
        
        {/* Resumen de la Orden */}
        <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" color="text.secondary">Documento Relacionado</Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Orden #{order?.id}</Typography>
            <Typography variant="h6" color={type === 'Expense' ? 'error' : 'success'}>
               ${parseFloat(order?.total_amount || 0).toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {type === 'Expense' ? `Proveedor: ${order?.supplier_name}` : `Cliente: ${order?.customer_name}`}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loadingBanks ? (
          <Box display="flex" justifyContent="center"><CircularProgress size={24} /></Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="bank-select-label">Cuenta Bancaria / Caja</InputLabel>
              <Select
                labelId="bank-select-label"
                value={formData.bank_account}
                label="Cuenta Bancaria / Caja"
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              >
                {banks.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} - {b.bank_name} (Saldo: ${parseFloat(b.current_balance).toFixed(2)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Monto a Pagar"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />

            <TextField
              label="Notas / Referencia (ACH, Cheque #)"
              fullWidth
              multiline
              rows={2}
              sx={{ mt: 2 }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color={type === 'Expense' ? 'error' : 'success'} 
          disabled={loading || loadingBanks}
          startIcon={loading && <CircularProgress size={20} color="inherit"/>}
        >
          {loading ? 'Procesando...' : 'Confirmar Transacción'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;