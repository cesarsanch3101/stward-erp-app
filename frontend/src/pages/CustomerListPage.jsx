import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People'; // Icono clientes

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getCustomers, deleteCustomer } from '../api/salesService';
import { useNavigate } from 'react-router-dom';

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers(); // Sin token manual
      setCustomers(data || []);
    } catch (err) {
      setError('Error cargando clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de borrar este cliente?')) {
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
    { field: 'contact_person', headerName: 'Contacto', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
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
          <Typography variant="h5" fontWeight={600}>Clientes</Typography>
          <SmartButton 
            icon={<PeopleIcon />} 
            value={customers.length} 
            label="Total Clientes" 
            onClick={() => {}} 
          />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/customers/new')}>
          Nuevo Cliente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={customers}
        columns={columns}
        loading={loading}
        onRowClick={(id) => navigate(`/customers/edit/${id}`)}
      />
    </Box>
  );
};

export default CustomerListPage;