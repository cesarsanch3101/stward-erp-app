import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, Box, CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

// Importamos los servicios y el contexto
import { getEmployees, deleteEmployee } from '../api/employeeService.js';
import { useAuth } from '../context/AuthContext.jsx';

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  const navigate = useNavigate();

  // 1. LÓGICA RECUPERADA: Función para buscar empleados
  const fetchEmployees = async () => {
    if (!tokens?.access) {
       setError("Autenticación requerida.");
       setLoading(false);
       return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees(tokens.access);
      setEmployees(data || []);
    } catch (err) {
      setError('Error cargando la lista de empleados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ejecutar la búsqueda al cargar
  useEffect(() => {
    fetchEmployees();
  }, [tokens]);

  // 3. LÓGICA RECUPERADA: Función para borrar
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
        try {
            await deleteEmployee(id, tokens.access);
            fetchEmployees(); // Recargar la lista
        } catch (err) {
            alert('Error al eliminar');
        }
    }
  };

  // 4. Función para editar
  const handleEdit = (id) => {
    navigate(`/employees/edit/${id}`);
  };

  // 5. Función para añadir nuevo
  const handleAdd = () => {
    navigate('/employees/new');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Lista de Empleados
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Añadir Empleado
        </Button>
      </Box>

      {/* Mensajes de Carga y Error */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Puesto</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.first_name}</TableCell>
                    <TableCell>{employee.last_name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(employee.id)} size="small" sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(employee.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EmployeeListPage;