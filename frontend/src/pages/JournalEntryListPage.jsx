import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icono ver

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getJournalEntries } from '../api/accountingService';
import { useNavigate } from 'react-router-dom';

const JournalEntryListPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntries();
      setEntries(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError("Error cargando Libro Diario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'date', headerName: 'Fecha', width: 120, valueGetter: (val) => new Date(val).toLocaleDateString() },
    { field: 'description', headerName: 'Concepto', flex: 1, minWidth: 250 },
    { 
      field: 'created_by_username', headerName: 'Usuario', width: 120,
      renderCell: (p) => <Chip label={p.value || 'System'} size="small" />
    },
    {
      field: 'total_amount', headerName: 'Monto', width: 130, align: 'right', headerAlign: 'right',
      valueGetter: (val, row) => {
        if (!row.items) return 0;
        return row.items.reduce((sum, i) => sum + Number(i.debit), 0);
      },
      valueFormatter: (val) => `$${parseFloat(val).toFixed(2)}`
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Libro Diario</Typography>
          <SmartButton icon={<DescriptionIcon />} value={entries.length} label="Asientos" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/journal-entries/new')}>
          Nuevo Asiento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SmartTable rows={entries} columns={columns} loading={loading} />
    </Box>
  );
};

export default JournalEntryListPage;