import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress, Alert, LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { uploadInvoiceOCR } from '../api/purchasingService';

const InvoiceUploadModal = ({ open, onClose, onDataDetected }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const data = await uploadInvoiceOCR(file);
      // Pasamos los datos detectados al componente padre para pre-llenar el formulario
      onDataDetected(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al procesar la factura. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" /> 
        IA: Escanear Factura
      </DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2, textAlign: 'center', p: 4, border: '2px dashed #ccc', borderRadius: 2 }}>
          <input
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button component="span" startIcon={<CloudUploadIcon />}>
              Seleccionar Archivo (PDF/Imagen)
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
              {file.name}
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="caption">Analizando documento con OCR...</Typography>
            <LinearProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={!file || loading}
        >
          {loading ? 'Procesando...' : 'Extraer Datos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceUploadModal;