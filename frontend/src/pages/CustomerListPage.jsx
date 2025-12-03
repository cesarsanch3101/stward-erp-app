import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, IconButton // Added IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icono para borrar
import EditIcon from '@mui/icons-material/Edit';   // Icono para editar
// Importa getCustomers y la NUEVA deleteCustomer
import { getCustomers, deleteCustomer } from '../api/salesService.js';
import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom'; // Para Editar después

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  // const navigate = useNavigate(); // Para Editar después

  // Función para buscar clientes (movida afuera para reusarla)
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

  // Búsqueda inicial al montar
  useEffect(() => {
    fetchCustomers();
  }, [tokens]);

  // --- NUEVO: Manejar Borrado ---
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este cliente?')) {
      try {
        if (!tokens?.access) { throw new Error("Autenticación requerida."); }
        await deleteCustomer(id, tokens.access);
        // Refresca la lista después de borrar exitosamente
        fetchCustomers();
        // TODO: Añadir notificación de éxito
      } catch (err) {
        setError(err.message || 'Error borrando cliente.');
        console.error(err);
      }
    }
  };

  const handleEdit = (id) => {
    console.log("Editar cliente", id); // Placeholder
    // navigate(`/customers/edit/${id}`); // Añadiremos esto con el enrutador
  };
  // --- FIN NUEVO ---

  return (
    <Box>
      {/* ... (Caja del encabezado con Título y Botón Añadir se mantiene igual) ... */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1">Lista de Clientes</Typography>
         <Button variant="contained" color="primary">Añadir Cliente</Button>
       </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>{/* Alinear a la derecha */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? ( /* ... (Fila de carga) ... */
               <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? ( /* ... (Fila de error) ... */
               <TableRow><TableCell colSpan={5} align="center"><Alert severity="error">{error}</Alert></TableCell></TableRow>
            ) : customers.length === 0 ? ( /* ... (Fila no encontrada) ... */
              <TableRow><TableCell colSpan={5} align="center">No se encontraron clientes.</TableCell></TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.contact_person || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone_number || '-'}</TableCell>
                  <TableCell align="right"> {/* Alinear a la derecha */}
                    {/* --- NUEVO: Botones de Acción --- */}
                    <IconButton aria-label="edit" onClick={() => handleEdit(customer.id)} size="small" sx={{ mr: 1 }} >
                       <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDelete(customer.id)} size="small" color="error" >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                     {/* --- FIN NUEVO --- */}
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