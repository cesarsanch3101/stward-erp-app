import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, IconButton // Added IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icon for delete button
import EditIcon from '@mui/icons-material/Edit';   // Icon for edit button
// Import getSuppliers and the NEW deleteSupplier
import { getSuppliers, deleteSupplier } from '../api/purchasingService.js';
import { useAuth } from '../context/AuthContext.jsx';
// We'll need useNavigate later for editing
// import { useNavigate } from 'react-router-dom';

const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  // const navigate = useNavigate(); // For Edit button later

  // Function to fetch suppliers (moved outside useEffect for re-use)
  const fetchSuppliers = async () => {
    if (!tokens?.access) {
       setError("Authentication required."); setLoading(false); return;
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

  // Initial fetch on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [tokens]); // Dependency array remains [tokens]

  // --- NEW: Handle Delete ---
  const handleDelete = async (id) => {
    // Simple confirmation dialog
    if (window.confirm('¿Estás seguro de que quieres borrar este proveedor?')) {
      try {
        if (!tokens?.access) { throw new Error("Authentication required."); }
        await deleteSupplier(id, tokens.access);
        // Refresh the list after successful deletion
        fetchSuppliers();
        // TODO: Add success notification
      } catch (err) {
        setError(err.message || 'Error deleting supplier.');
        console.error(err);
      }
    }
  };

  const handleEdit = (id) => {
    console.log("Edit supplier", id); // Placeholder
    // navigate(`/suppliers/edit/${id}`); // We'll add this when routing is set up
  };
  // --- END NEW ---

  return (
    <Box>
      {/* ... (Header Box with Title and Add Button remains the same) ... */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
         <Typography variant="h4" component="h1">Lista de Proveedores</Typography>
         <Button variant="contained" color="primary">Añadir Proveedor</Button>
       </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>{/* Align right */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? ( /* ... (Loading row) ... */
               <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? ( /* ... (Error row) ... */
               <TableRow><TableCell colSpan={5} align="center"><Alert severity="error">{error}</Alert></TableCell></TableRow>
            ) : suppliers.length === 0 ? ( /* ... (Not found row) ... */
              <TableRow><TableCell colSpan={5} align="center">No se encontraron proveedores.</TableCell></TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || '-'}</TableCell>
                  <TableCell>{supplier.email || '-'}</TableCell>
                  <TableCell>{supplier.phone_number || '-'}</TableCell>
                  <TableCell align="right"> {/* Align right */}
                    {/* --- NEW: Action Buttons --- */}
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleEdit(supplier.id)}
                      size="small"
                      sx={{ mr: 1 }}
                     >
                       <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDelete(supplier.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                     {/* --- END NEW --- */}
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