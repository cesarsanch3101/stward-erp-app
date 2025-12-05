import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Container, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, Alert, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import { getAccounts, createJournalEntry } from '../api/accountingService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JournalEntryFormPage = () => {
  const { tokens } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [header, setHeader] = useState({
    date: new Date().toISOString().split('T')[0], // Fecha de hoy YYYY-MM-DD
    description: '',
  });
  
  // Inicializamos con 2 líneas (mínimo para partida doble)
  const [lines, setLines] = useState([
    { account: '', debit: '', credit: '', description: '' },
    { account: '', debit: '', credit: '', description: '' }
  ]);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar cuentas
  useEffect(() => {
    if(tokens?.access) {
      getAccounts(tokens.access).then(data => setAccounts(data.results || data));
    }
  }, [tokens]);

  // --- LÓGICA CONTABLE EN TIEMPO REAL ---
  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const credit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    return {
      debit,
      credit,
      diff: debit - credit,
      isBalanced: Math.abs(debit - credit) < 0.01 && debit > 0 // Tolerancia 0.01
    };
  }, [lines]);

  // Manejadores
  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    // UX: Si escribo en Debe, borro el Haber (y viceversa) para evitar errores
    if (field === 'debit' && value) newLines[index]['credit'] = '';
    if (field === 'credit' && value) newLines[index]['debit'] = '';

    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account: '', debit: '', credit: '', description: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 2) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
    }
  };

  const handleSubmit = async () => {
    if (!totals.isBalanced) {
      setError("El asiento no está balanceado. No se puede guardar.");
      return;
    }
    if (lines.some(l => !l.account)) {
      setError("Todas las líneas deben tener una cuenta asignada.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...header,
      items: lines.map(l => ({
        account: l.account,
        description: l.description || header.description, // Heredar descripción si falta
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0
      }))
    };

    try {
      await createJournalEntry(payload, tokens.access);
      navigate('/journal-entries'); // Redirigir al listado
    } catch (err) {
      setError(err.message || "Error al contabilizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">Nuevo Asiento Contable</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* CABECERA */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth type="date" label="Fecha" name="date"
              value={header.date} onChange={(e) => setHeader({...header, date: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth label="Descripción General" name="description"
              value={header.description} onChange={(e) => setHeader({...header, description: e.target.value})}
              placeholder="Ej. Registro de Nómina Quincenal"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* DETALLES (GRID) */}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="35%">Cuenta</TableCell>
              <TableCell width="25%">Detalle Línea</TableCell>
              <TableCell width="15%" align="right">Debe</TableCell>
              <TableCell width="15%" align="right">Haber</TableCell>
              <TableCell width="10%" align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    select fullWidth variant="standard"
                    value={line.account}
                    onChange={(e) => handleLineChange(index, 'account', e.target.value)}
                  >
                    {accounts.map(acc => (
                      <MenuItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth variant="standard" placeholder="Opcional"
                    value={line.description}
                    onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth type="number" variant="standard"
                    inputProps={{ style: { textAlign: 'right' } }}
                    value={line.debit}
                    onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth type="number" variant="standard"
                    inputProps={{ style: { textAlign: 'right' } }}
                    value={line.credit}
                    onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => removeLine(index)} color="error" disabled={lines.length <= 2}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* TOTALES */}
            <TableRow sx={{ bgcolor: totals.isBalanced ? '#e8f5e9' : '#ffebee' }}>
              <TableCell colSpan={2}>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addLine}>
                  Agregar Línea
                </Button>
                {!totals.isBalanced && (
                  <Chip label={`Diferencia: ${totals.diff.toFixed(2)}`} color="error" sx={{ ml: 2 }} />
                )}
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">{totals.debit.toFixed(2)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold">{totals.credit.toFixed(2)}</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" color="primary" size="large" 
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={!totals.isBalanced || loading}
        >
          Contabilizar
        </Button>
      </Box>
    </Container>
  );
};

export default JournalEntryFormPage;