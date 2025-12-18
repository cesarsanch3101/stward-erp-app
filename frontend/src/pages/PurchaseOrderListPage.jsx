import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Alert, Chip, IconButton, Tooltip, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner'; // Icono scanner

import { getPurchaseOrders, deletePurchaseOrder, receivePurchaseOrder } from '../api/purchasingService';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import InvoiceUploadModal from '../components/InvoiceUploadModal'; // <--- NUEVO
import SmartTable from '../components/SmartTable';
import SmartButton from '../components/SmartButton';

const PurchaseOrderListPage = () => {
  const navigate = useNavigate();
  
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // Estado para modal OCR
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const page = paginationModel.page + 1;
      const data = await getPurchaseOrders(page, paginationModel.pageSize);
      
      if (data.results) {
        setRows(data.results);
        setRowCount(data.count);
      } else {
        setRows(data); 
        setRowCount(data.length);
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar órdenes.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;
    try {
      await deletePurchaseOrder(id);
      setNotification({ open: true, message: 'Orden eliminada.', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm("¿Confirmar recepción?")) return;
    try {
      await receivePurchaseOrder(id);
      setNotification({ open: true, message: '¡Mercadería recibida!', severity: 'success' });
      fetchOrders();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Callback cuando la IA termina de leer la factura
  const handleOCRData = (data) => {
    // Redirigimos al formulario de creación pasando los datos detectados por estado
    // (Asumiendo que PurchaseOrderFormPage está listo para recibir `location.state`)
    console.log("IA Detectó:", data);
    alert(`IA Detectó:\nFecha: ${data.detected_date}\nTotal: $${data.detected_total}`);
    // En una fase posterior, pasaríamos esto al formulario:
    // navigate('/purchase-orders/new', { state: { ocrData: data } });
  };

  const getStatusColor = (status) => {
    const map = { 'Draft': 'warning', 'Submitted': 'info', 'Completed': 'success', 'Cancelled': 'error' };
    return map[status] || 'default';
  };

  const columns = [
    { field: 'id', headerName: 'Orden #', width: 100, renderCell: (p) => <b>PO-{p.value}</b> },
    { field: 'supplier_name', headerName: 'Proveedor', flex: 1, minWidth: 200 },
    { field: 'order_date', headerName: 'Fecha', width: 120, valueGetter: (val) => new Date(val).toLocaleDateString() },
    { 
      field: 'total_amount', headerName: 'Total', width: 120, align: 'right', headerAlign: 'right',
      valueFormatter: (val) => `$${parseFloat(val).toFixed(2)}`
    },
    { 
      field: 'status', headerName: 'Estado', width: 120,
      renderCell: (p) => <Chip label={p.value} color={getStatusColor(p.value)} size="small" variant="outlined" />
    },
    {
      field: 'actions', headerName: 'Acciones', width: 160, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver Detalle">
             <IconButton size="small" onClick={(e) => e.stopPropagation()}>
               <VisibilityIcon fontSize="small" />
             </IconButton>
          </Tooltip>

          {params.row.status === 'Draft' && (
            <>
            <Tooltip title="Recibir Mercadería">
              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleReceive(params.row.id); }}>
                <InventoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            </>
          )}
          {params.row.status === 'Completed' && (
            <Tooltip title="Registrar Pago">
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); setSelectedOrder(params.row); setPaymentModalOpen(true); }}>
                <AttachMoneyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>Compras</Typography>
          <SmartButton icon={<ShoppingCartIcon />} value={rowCount} label="Total Órdenes" onClick={() => {}} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Botón IA Scanner */}
            <Button 
                variant="outlined" 
                startIcon={<DocumentScannerIcon />} 
                onClick={() => setUploadModalOpen(true)}
            >
                Escanear Factura
            </Button>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => navigate('/purchase-orders/new')}
            >
                Nueva Compra
            </Button>
        </Box>
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

      <PaymentModal 
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={selectedOrder}
        type="Expense"
        onSuccess={() => {
           setNotification({ open: true, message: 'Pago registrado con éxito', severity: 'success' });
        }}
      />

      {/* Modal de OCR */}
      <InvoiceUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDataDetected={handleOCRData}
      />

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseOrderListPage;