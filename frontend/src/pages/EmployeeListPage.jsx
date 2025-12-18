import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert, Chip, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';

import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../api/employeeService.js';

const EmployeeListPage = () => {
  const navigate = useNavigate();
  
  // Estados Enterprise
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getEmployees(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data);
        setRowCount(data.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Error cargando empleados.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
        try {
            await deleteEmployee(id);
            fetchEmployees();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    }
  };

  const columns = [
    { 
      field: 'avatar', headerName: '', width: 60,
      renderCell: (params) => (
        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light' }}>
          {params.row.first_name?.[0]}{params.row.last_name?.[0]}
        </Avatar>
      )
    },
    { field: 'first_name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'last_name', headerName: 'Apellido', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { 
      field: 'position', headerName: 'Puesto', flex: 1,
      renderCell: (params) => <Chip label={params.value || 'Sin Asignar'} size="small" variant="outlined" />
    },
    { 
      field: 'actions', headerName: 'Acciones', width: 120,
      renderCell: (params) => (
        <Box>
          <EditIcon 
            fontSize="small" color="action" sx={{ cursor: 'pointer', mr: 2 }} 
            onClick={(e) => { e.stopPropagation(); navigate(`/employees/edit/${params.row.id}`); }}
          />
          <DeleteIcon 
            fontSize="small" color="error" sx={{ cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}
          />
        </Box>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>Empleados</Typography>
          <SmartButton icon={<BadgeIcon />} value={rowCount} label="Activos" onClick={() => {}} />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employees/new')}>
          Nuevo Empleado
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
        onRowClick={(id) => navigate(`/employees/edit/${id}`)}
      />
    </Box>
  );
};

export default EmployeeListPage;