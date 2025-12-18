import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Alert, Chip, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Se mantiene por si se implementa edición futura
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History'; // Icono para Kardex

import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api/inventoryService.js';
import SmartTable from '../components/SmartTable'; // <--- COMPONENTE ENTERPRISE
import SmartButton from '../components/SmartButton';

const ProductListPage = () => {
  const navigate = useNavigate();

  // Estados para SmartTable Server-Side
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // DRF usa base 1, DataGrid usa base 0
      const page = paginationModel.page + 1;
      const data = await getProducts(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        // Fallback robusto
        setRows(data);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error(err);
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
      renderCell: (params) => <Chip label={params.value || 'Gral'} size="small" variant="outlined" />
    },
    { 
      field: 'current_stock', 
      headerName: 'Stock Físico', 
      width: 120, 
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold', 
            color: parseFloat(params.value) <= 10 ? 'error.main' : 'success.main' 
          }}
        >
          {parseFloat(params.value).toFixed(2)} {params.row.unit_of_measure_name}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver Kardex">
            <IconButton 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${params.row.id}/kardex`);
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Eliminar">
            <IconButton 
              onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }} 
              size="small" 
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
            value={rowCount} 
            label="Items Totales" 
            onClick={() => {}} 
          />
          {/* KPI de Valorización (Simulado por ahora) */}
          <SmartButton 
            icon={<AssessmentIcon />} 
            value="$ --" 
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
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={(id) => navigate(`/products/${id}/kardex`)}
      />
    </Box>
  );
};

export default ProductListPage;