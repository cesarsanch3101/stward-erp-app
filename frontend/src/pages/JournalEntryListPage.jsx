import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Alert, Chip 
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

import { getJournalEntries } from '../api/accountingService';
import { useAuth } from '../context/AuthContext';

const JournalEntryListPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const fetchEntries = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);
      // Asumimos que esta función existe en accountingService.js
      const data = await getJournalEntries(tokens.access);
      const rows = Array.isArray(data) ? data : (data.results || []);
      setEntries(rows);
    } catch (err) {
      console.error(err);
      setError("Error cargando el Libro Diario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [tokens]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { 
      field: 'date', 
      headerName: 'Fecha', 
      width: 130, 
      type: 'date',
      valueGetter: (value) => value && new Date(value),
    },
    { 
      field: 'description', 
      headerName: 'Concepto / Glosa', 
      flex: 1, 
      minWidth: 300 
    },
    { 
      field: 'created_by_username', 
      headerName: 'Usuario', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Sistema'} 
          variant="outlined" 
          size="small" 
        />
      )
    },
    {
      field: 'total_amount', 
      headerName: 'Monto', 
      width: 150,
      align: 'right',
      headerAlign: 'right',
      // Calculamos el total sumando los 'debits' de los items
      valueGetter: (value, row) => {
        if (!row.items || !Array.isArray(row.items)) return 0;
        return row.items.reduce((sum, item) => sum + Number(item.debit), 0);
      },
      valueFormatter: (value) => {
        if (value == null) return '';
        return `$${Number(value).toFixed(2)}`;
      },
      cellClassName: 'font-bold-cell',
    },
    {
      field: 'actions',
      headerName: 'Detalle',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button 
          startIcon={<VisibilityIcon />}
          size="small"
          onClick={() => console.log("Ver detalle", params.id)}
        >
          Ver
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon fontSize="large" color="primary" />
          Libro Diario
        </Typography>
        <Button 
          variant="contained" 
          color="success"
          startIcon={<AddIcon />} 
          onClick={() => navigate('/journal-entries/new')}
        >
          Nuevo Asiento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={entries}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
            sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
          }}
          pageSizeOptions={[15, 30, 50]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          sx={{
            '& .font-bold-cell': {
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default JournalEntryListPage;