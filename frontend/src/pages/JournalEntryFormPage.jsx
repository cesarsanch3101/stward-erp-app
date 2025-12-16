import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Container, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, Alert, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { getAccounts, createJournalEntry } from '../api/accountingService';
import { useNavigate } from 'react-router-dom';

const JournalEntryFormPage = () => {
  const navigate = useNavigate();
  const [header, setHeader] = useState({ date: new Date().toISOString().split('T')[0], description: '' });
  const [lines, setLines] = useState([
    { account: '', debit: '', credit: '', description: '' },
    { account: '', debit: '', credit: '', description: '' }
  ]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccounts().then(data => setAccounts(data.results || data));
  }, []);

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const credit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
    return { debit, credit, diff: debit - credit, isBalanced: Math.abs(debit - credit) < 0.01 && debit > 0 };
  }, [lines]);

  const handleLineChange = (i, field, val) => {
    const newLines = [...lines];
    newLines[i][field] = val;
    if (field === 'debit' && val) newLines[i]['credit'] = '';
    if (field === 'credit' && val) newLines[i]['debit'] = '';
    setLines(newLines);
  };

  const handleSubmit = async () => {
    if (!totals.isBalanced) return setError("Asiento desbalanceado.");
    setLoading(true);
    try {
      const payload = {
        ...header,
        items: lines.map(l => ({
          account: l.account, description: l.description || header.description,
          debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0
        }))
      };
      await createJournalEntry(payload);
      navigate('/journal-entries');
    } catch (err) {
      setError("Error al contabilizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3} fontWeight={600}>Nuevo Asiento Manual</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}><TextField fullWidth type="date" label="Fecha" value={header.date} onChange={(e) => setHeader({...header, date: e.target.value})} /></Grid>
          <Grid item xs={9}><TextField fullWidth label="Glosa" value={header.description} onChange={(e) => setHeader({...header, description: e.target.value})} /></Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="35%">Cuenta</TableCell>
              <TableCell width="25%">Detalle</TableCell>
              <TableCell width="15%">Debe</TableCell>
              <TableCell width="15%">Haber</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField select fullWidth size="small" value={line.account} onChange={(e) => handleLineChange(i, 'account', e.target.value)}>
                    {accounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</MenuItem>)}
                  </TextField>
                </TableCell>
                <TableCell><TextField fullWidth size="small" value={line.description} onChange={(e) => handleLineChange(i, 'description', e.target.value)} /></TableCell>
                <TableCell><TextField fullWidth size="small" type="number" value={line.debit} onChange={(e) => handleLineChange(i, 'debit', e.target.value)} /></TableCell>
                <TableCell><TextField fullWidth size="small" type="number" value={line.credit} onChange={(e) => handleLineChange(i, 'credit', e.target.value)} /></TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => setLines(lines.filter((_, idx) => idx !== i))}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: totals.isBalanced ? '#e8f5e9' : '#ffebee' }}>
              <TableCell colSpan={2}>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => setLines([...lines, { account: '', debit: '', credit: '', description: '' }])}>Agregar</Button>
                {!totals.isBalanced && <Chip label={`Diferencia: ${totals.diff.toFixed(2)}`} color="error" sx={{ ml: 2 }} />}
              </TableCell>
              <TableCell><b>{totals.debit.toFixed(2)}</b></TableCell>
              <TableCell><b>{totals.credit.toFixed(2)}</b></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !totals.isBalanced}>Contabilizar</Button>
      </Box>
    </Container>
  );
};

export default JournalEntryFormPage;