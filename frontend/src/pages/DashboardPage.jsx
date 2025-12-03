import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
// Importamos nuestro nuevo servicio y el hook de autenticación
import { getProfitAndLoss } from '../api/reportsService.js';
import { useAuth } from '../context/AuthContext.jsx';

// El componente KpiCard se queda igual
const KpiCard = ({ title, value, loading, formatAsMoney = true }) => (
  <Card sx={{ minHeight: 120 }}>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          (formatAsMoney ? '$' : '') + parseFloat(value).toFixed(2)
        )}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens } = useAuth(); // Obtenemos los tokens del contexto

  // useEffect para buscar los datos del reporte al cargar
  useEffect(() => {
    const fetchReportData = async () => {
      if (!tokens?.access) {
         setError("Autenticación requerida para ver el dashboard.");
         setLoading(false);
         return;
      }

      try {
        setLoading(true);
        setError(null);
        // Llamamos a nuestro servicio de reportes
        const data = await getProfitAndLoss(tokens.access);
        setReportData(data);
      } catch (err) {
        setError('Error al cargar el reporte P&L.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [tokens]); // Se re-ejecuta si los tokens cambian

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Dashboard Principal
      </Typography>

      {/* Mostramos el estado de carga o error general */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      )}
      {error && !loading && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {/* Mostramos las tarjetas con los datos (o en estado de carga) */}
      {!error && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <KpiCard 
              title="Ingresos Totales (P&L)" 
              value={reportData?.total_revenue || 0} 
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard 
              title="Gastos Totales (P&L)" 
              value={reportData?.total_expense || 0} 
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard 
              title="Ganancia Neta (P&L)" 
              value={reportData?.net_profit || 0} 
              loading={loading}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;