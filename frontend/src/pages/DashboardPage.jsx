import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
// NOTA: Usamos el Grid clásico temporalmente para asegurar la carga
// import Grid from '@mui/material/Grid2'; 
import { getProfitAndLoss } from '../api/reportsService.js';

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
          (formatAsMoney ? '$' : '') + parseFloat(value || 0).toFixed(2)
        )}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfitAndLoss();
        setReportData(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos financieros.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []); 

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary' }}>
        Dashboard Principal
      </Typography>

      {error && !loading && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {/* Usamos sintaxis Grid v1 (Clásica) para evitar errores de importación */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <KpiCard 
            title="Ingresos Totales (YTD)" 
            value={reportData?.total_revenue || 0} 
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KpiCard 
            title="Gastos Operativos" 
            value={reportData?.total_expense || 0} 
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KpiCard 
            title="Utilidad Neta" 
            value={reportData?.net_profit || 0} 
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;