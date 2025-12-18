import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getCustomers, deleteCustomer } from '../api/salesService';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios'; // Import directo para paginación manual si el servicio no está adaptado

const CustomerListPage = () => {
  const navigate = useNavigate();
  
  // Estados para DataGrid Server-Side
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Calculamos offset/limit para la API o usamos page param
      const page = paginationModel.page + 1; // DRF usa base 1
      const response = await apiClient.get(`/customers/?page=${page}&page_size=${paginationModel.pageSize}`);
      
      // Manejo robusto: DRF paginado devuelve { count, results }
      // Si la API no estuviera paginada, devuelve array directo.
      const data = response.data;
      if (Array.isArray(data)) {
         setRows(data);
         setRowCount(data.length);
      } else {
         setRows(data.results || []);
         setRowCount(data.count || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando clientes.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Borrar cliente?')) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert('Error al borrar.');
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Razón Social', flex: 1.5, minWidth: 200, renderCell: (p) => <b>{p.value}</b> },
    { field: 'ruc', headerName: 'RUC', width: 150 },
    { 
      field: 'taxpayer_type', headerName: 'Tipo', width: 130,
      renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" />
    },
    { field: 'contact_person', headerName: 'Contacto', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone_number', headerName: 'Teléfono', width: 120 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/customers/edit/${params.row.id}`); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600} color="text.primary">Clientes</Typography>
          <SmartButton 
            icon={<PeopleIcon />} 
            value={rowCount} 
            label="Registrados" 
            onClick={() => {}} 
          />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/customers/new')}>
          Nuevo Cliente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={(id) => navigate(`/customers/edit/${id}`)}
      />
    </Box>
  );
};

export default CustomerListPage;