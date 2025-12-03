import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Importamos el servicio y el contexto
import { getBankAccounts } from '../api/treasuryService';
import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom'; // Para el futuro

const BankAccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth();
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!tokens?.access) {
        setError("Autenticación requerida.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getBankAccounts(tokens.access);
        setAccounts(data || []);
      } catch (err) {
        setError('Error al cargar las cuentas bancarias.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [tokens]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon fontSize="large" /> Cuentas Bancarias
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          // onClick={() => navigate('/bank-accounts/new')}
        >
          Nueva Cuenta
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre de Cuenta</TableCell>
                <TableCell>Banco</TableCell>
                <TableCell>Número de Cuenta</TableCell>
                <TableCell align="right">Saldo Inicial</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Saldo Actual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay cuentas registradas.</TableCell>
                </TableRow>
              ) : (
                accounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>{acc.bank_name}</TableCell>
                    <TableCell>{acc.account_number}</TableCell>
                    <TableCell align="right">${parseFloat(acc.initial_balance).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${parseFloat(acc.current_balance).toFixed(2)}
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

export default BankAccountListPage;