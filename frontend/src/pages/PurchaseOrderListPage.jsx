import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getPurchaseOrders } from '../api/purchasingService';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getPurchaseOrders(page, paginationModel.pageSize);
      
      if (data.results) {
         setRows(data.results);
         setRowCount(data.count);
      } else {
         setRows([]);
         setRowCount(0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando compras.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // COLUMNAS CON CÁLCULO FISCAL
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'supplier_name', headerName: 'Proveedor', flex: 1, minWidth: 200,
      renderCell: (p) => <b>{p.value}</b> 
    },
    { field: 'order_date', headerName: 'Fecha', width: 110 },
    { 
      field: 'total_amount', headerName: 'Total Fac.', width: 120,
      renderCell: (p) => `$${parseFloat(p.value).toFixed(2)}`
    },
    { 
      field: 'retention_amount', headerName: 'Retenido', width: 120,
      renderCell: (p) => {
        const val = parseFloat(p.value);
        return val > 0 ? <span style={{ color: 'red' }}>-${val.toFixed(2)}</span> : '-';
      }
    },
    { 
      field: 'payable_amount', headerName: 'A Pagar', width: 120,
      renderCell: (p) => <b style={{ color: 'green' }}>${parseFloat(p.value).toFixed(2)}</b>
    },
    { 
      field: 'status', headerName: 'Estado', width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" />
    },
    {
      field: 'actions', headerName: 'Ver', width: 80, sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders/${params.row.id}`); }}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Compras & Gastos</Typography>
          <SmartButton icon={<ShoppingCartIcon />} value={rowCount} label="Órdenes" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/purchase-orders/new')}>
          Nueva Compra
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SmartTable
        rows={rows} columns={columns} rowCount={rowCount} loading={loading}
        paginationModel={paginationModel} onPaginationModelChange={setPaginationModel}
        onRowClick={(id) => navigate(`/purchase-orders/${id}`)} // Navegar al detalle (futuro) o edición
      />
    </Box>
  );
};

export default PurchaseOrderListPage;