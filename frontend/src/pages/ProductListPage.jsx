import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Alert, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory'; // Caja
import AssessmentIcon from '@mui/icons-material/Assessment'; // Gráfica

import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api/inventoryService.js';
import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(); // Token automático
      setProducts(data || []);
    } catch (err) {
      setError('Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const columns = [
    { field: 'sku', headerName: 'SKU', width: 120, renderCell: (p) => <b>{p.value}</b> },
    { field: 'name', headerName: 'Producto', flex: 1, minWidth: 200 },
    { 
      field: 'category_name', 
      headerName: 'Categoría', 
      width: 150,
      renderCell: (params) => <Chip label={params.value || 'Gral'} size="small" />
    },
    { 
      field: 'current_stock', 
      headerName: 'Stock Físico', 
      width: 120, 
      type: 'number',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold', 
            color: params.value <= 10 ? 'error.main' : 'success.main' 
          }}
        >
          {params.value} {params.row.unit_of_measure_name}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button 
             size="small" 
             sx={{ mr: 1, minWidth: 0, p: 0.5 }}
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/products/${params.row.id}/kardex`);
             }}
           >
             Kardex
           </Button>
          <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }} size="small" color="error">
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
          <Typography variant="h5" fontWeight={600}>Inventario</Typography>
          <SmartButton 
            icon={<InventoryIcon />} 
            value={products.length} 
            label="Items" 
            onClick={() => {}} 
          />
          {/* KPI Simulado de Valorización */}
          <SmartButton 
            icon={<AssessmentIcon />} 
            value="$ 0.00" 
            label="Valor Total" 
            onClick={() => {}} 
          />
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')} 
        >
          Nuevo Producto
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={products}
        columns={columns}
        loading={loading}
        onRowClick={(id) => console.log("Editar", id)}
      />
    </Box>
  );
};

export default ProductListPage;