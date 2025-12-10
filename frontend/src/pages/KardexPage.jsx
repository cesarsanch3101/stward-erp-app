import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Button, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductKardex } from '../api/inventoryService';
import { useAuth } from '../context/AuthContext';

const KardexPage = () => {
  const { id } = useParams();
  const { tokens } = useAuth();
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokens?.access) {
      getProductKardex(id, tokens.access)
        .then(data => setMovements(data))
        .finally(() => setLoading(false));
    }
  }, [id, tokens]);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        Volver a Productos
      </Button>
      <Typography variant="h4" mb={2}>Kardex del Producto</Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">Sin movimientos.</TableCell></TableRow>
              ) : (
                movements.map((mov, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(mov.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: mov.type === 'ENTRADA' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {mov.type}
                    </TableCell>
                    <TableCell>{mov.description}</TableCell>
                    <TableCell align="right">${parseFloat(mov.amount).toFixed(2)}</TableCell>
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

export default KardexPage;