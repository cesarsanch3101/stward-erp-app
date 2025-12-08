import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getCustomers, deleteCustomer } from '../api/salesService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // 1. Import activo

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  const navigate = useNavigate(); // 2. Hook activo

  const fetchCustomers = async () => {
    if (!tokens?.access) {
       setError("Autenticación requerida."); setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const data = await getCustomers(tokens.access);
      setCustomers(data || []);
    } catch (err) {
      setError('Error cargando clientes.'); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tokens]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este cliente?')) {
      try {
        await deleteCustomer(id, tokens.access);
        fetchCustomers();
      } catch (err) {
        setError(err.message || 'Error borrando cliente.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/customers/edit/${id}`); // 3. ¡Navegación activada!
  };

  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1">Lista de Clientes</Typography>
         <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/customers/new')} // 4. Botón Añadir activo
         >
            Añadir Cliente
         </Button>
       </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? (
               <TableRow><TableCell colSpan={5} align="center"><Alert severity="error">{error}</Alert></TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No se encontraron clientes.</TableCell></TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.contact_person || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone_number || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(customer.id)} size="small" sx={{ mr: 1 }}>
                       <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(customer.id)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerListPage;