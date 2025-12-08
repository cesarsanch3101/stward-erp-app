import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSuppliers, deleteSupplier } from '../api/purchasingService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Import activo

const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  const navigate = useNavigate(); // Hook activo

  const fetchSuppliers = async () => {
    if (!tokens?.access) {
       setError("Autenticación requerida."); setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const data = await getSuppliers(tokens.access);
      setSuppliers(data || []);
    } catch (err) {
      setError('Error loading suppliers.'); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [tokens]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este proveedor?')) {
      try {
        await deleteSupplier(id, tokens.access);
        fetchSuppliers();
      } catch (err) {
        setError(err.message || 'Error deleting supplier.');
      }
    }
  };

  const handleEdit = (id) => {
    console.log("Edit supplier", id);
    // navigate(`/suppliers/edit/${id}`); // Aún no tenemos la página de editar proveedor, lo dejamos pendiente pero listo.
    alert("Funcionalidad de editar proveedor en construcción");
  };

  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1">Lista de Proveedores</Typography>
         <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/suppliers/new')} // ¡Botón Añadir ACTIVADO!
         >
            Añadir Proveedor
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
            ) : suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">No se encontraron proveedores.</TableCell></TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || '-'}</TableCell>
                  <TableCell>{supplier.email || '-'}</TableCell>
                  <TableCell>{supplier.phone_number || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(supplier.id)} size="small" sx={{ mr: 1 }}>
                       <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(supplier.id)} size="small" color="error">
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

export default SupplierListPage;