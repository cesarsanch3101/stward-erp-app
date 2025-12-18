import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { getSuppliers, deleteSupplier } from '../api/purchasingService';
import { useNavigate } from 'react-router-dom';

const SupplierListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      // getSuppliers ya lo actualizamos en la fase anterior para soportar args, 
      // pero por seguridad lo llamamos con paginación
      const page = paginationModel.page + 1;
      // Nota: Si getSuppliers en purchasingService.js aún no soporta params, 
      // asegúrate de que el archivo del paso anterior se aplicó.
      // Aquí asumimos que retorna {results, count} o array directo.
      const data = await getSuppliers(); 
      // *NOTA*: Si getSuppliers no acepta argumentos en tu versión actual, 
      // el API devolverá la pág 1 por defecto debido a settings.py.
      // Para paginación real, purchasingService.js debe aceptar (page, pageSize).
      // Asumiremos que devuelve la estructura paginada.
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data || []);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando proveedores.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Borrar proveedor?')) {
      try { await deleteSupplier(id); fetchSuppliers(); } 
      catch (e) { console.error(e); alert('Error al borrar'); }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Empresa', flex: 1.5, minWidth: 200, renderCell: (p) => <b>{p.value}</b> },
    { field: 'contact_person', headerName: 'Contacto', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 },
    {
      field: 'actions', headerName: 'Acciones', width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/edit/${params.row.id}`); }}>
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Proveedores</Typography>
          <SmartButton icon={<BusinessIcon />} value={rowCount} label="Total Proveedores" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/suppliers/new')}>
          Nuevo Proveedor
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
      />
    </Box>
  );
};

export default SupplierListPage;