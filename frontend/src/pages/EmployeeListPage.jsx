import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Chip, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge'; // Icono carnet

// Componentes Nuevos
import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';

import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../api/employeeService.js';

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees(); // Ya no pasamos token manual
      setEmployees(data || []);
    } catch (err) {
      setError('Error cargando empleados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
        try {
            await deleteEmployee(id); // Ya no pasamos token manual
            fetchEmployees();
        } catch (err) {
            alert('Error al eliminar');
        }
    }
  };

  // Definición de Columnas para SmartTable
  const columns = [
    { 
      field: 'avatar', 
      headerName: '', 
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light' }}>
          {params.row.first_name[0]}{params.row.last_name[0]}
        </Avatar>
      )
    },
    { field: 'first_name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    { field: 'last_name', headerName: 'Apellido', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { 
      field: 'position', 
      headerName: 'Puesto', 
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.value || 'Sin Asignar'} size="small" variant="outlined" />
      )
    },
    { 
      field: 'actions', 
      headerName: 'Acciones', 
      width: 120,
      renderCell: (params) => (
        <Box>
          <EditIcon 
            fontSize="small" 
            color="action" 
            sx={{ cursor: 'pointer', mr: 2 }} 
            onClick={(e) => {
              e.stopPropagation(); // Evita click en la fila
              navigate(`/employees/edit/${params.row.id}`);
            }}
          />
          <DeleteIcon 
            fontSize="small" 
            color="error" 
            sx={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
          />
        </Box>
      )
    },
  ];

  return (
    <Box>
      {/* Cabecera de Página (Estilo ERP) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Empleados
          </Typography>
          {/* Ejemplo de SmartButton: KPI Rápido */}
          <SmartButton 
            icon={<BadgeIcon />} 
            value={employees.length} 
            label="Activos" 
            onClick={() => {}} 
          />
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/employees/new')}
        >
          Nuevo Empleado
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabla Inteligente */}
      <SmartTable 
        rows={employees}
        columns={columns}
        loading={loading}
        onRowClick={(id) => navigate(`/employees/edit/${id}`)}
      />
    </Box>
  );
};

export default EmployeeListPage;