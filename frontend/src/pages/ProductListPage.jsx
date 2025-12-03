import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'; // <--- ¡El componente profesional!
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { getProducts, deleteProduct } from '../api/inventoryService.js';
import { useAuth } from '../context/AuthContext.jsx';

// Estilos para el DataGrid (Opcional: para que se parezca más a un ERP denso)
const gridStyles = {
  height: 600, 
  width: '100%',
  '& .MuiDataGrid-root': {
    border: 'none',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #303030', // Líneas sutiles en modo oscuro
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1e1e1e', // Cabecera más oscura
    borderBottom: '2px solid #505050',
  },
};

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();

  const fetchProducts = async () => {
    if (!tokens?.access) return;
    try {
      setLoading(true);
      const data = await getProducts(tokens.access);
      setProducts(data || []);
    } catch (err) {
      setError('Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [tokens]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id, tokens.access);
        fetchProducts(); // Recargar la lista
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const handleEdit = (id) => {
    console.log("Editar producto", id);
    // Aquí conectaremos el router para editar en el futuro
    // navigate(`/products/edit/${id}`);
  };

  // --- DEFINICIÓN DE COLUMNAS (La parte clave del DataGrid) ---
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'category_name', headerName: 'Categoría', width: 150 },
    { field: 'unit_of_measure_name', headerName: 'Unidad', width: 100 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row.id)} size="small" sx={{ mr: 1 }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Inventario
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          // onClick={() => navigate('/products/new')} // Descomentar cuando tengamos la ruta
        >
          Nuevo Producto
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={gridStyles}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection // ¡Estilo ERP! Permite seleccionar filas
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ProductListPage;