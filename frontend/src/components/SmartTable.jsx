import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Paper, LinearProgress } from '@mui/material';

// Configuración en español para la DataGrid
const spanishLocale = {
  noRowsLabel: 'Sin datos',
  noResultsOverlayLabel: 'No se encontraron resultados.',
  toolbarDensity: 'Densidad',
  toolbarDensityLabel: 'Densidad',
  toolbarDensityCompact: 'Compacta',
  toolbarDensityStandard: 'Estándar',
  toolbarDensityComfortable: 'Cómoda',
  toolbarColumns: 'Columnas',
  toolbarColumnsLabel: 'Seleccionar columnas',
  toolbarFilters: 'Filtros',
  toolbarFiltersLabel: 'Mostrar filtros',
  toolbarExport: 'Exportar',
  toolbarExportLabel: 'Exportar',
  toolbarExportCSV: 'Descargar como CSV',
  toolbarExportPrint: 'Imprimir',
  columnsPanelTextFieldLabel: 'Buscar columna',
  columnsPanelTextFieldPlaceholder: 'Título de columna',
  filterPanelColumns: 'Columna',
  filterPanelOperators: 'Operador',
  filterPanelInputLabel: 'Valor',
  filterPanelInputPlaceholder: 'Filtrar valor',
  filterOperatorContains: 'contiene',
  filterOperatorEquals: 'es igual',
  filterOperatorStartsWith: 'empieza con',
  filterOperatorEndsWith: 'termina con',
  columnMenuLabel: 'Menú',
  columnMenuShowColumns: 'Mostrar columnas',
  columnMenuFilter: 'Filtrar',
  columnMenuHideColumn: 'Ocultar',
  columnMenuUnsort: 'Desordenar',
  columnMenuSortAsc: 'Ordenar ASC',
  columnMenuSortDesc: 'Ordenar DESC',
};

const SmartTable = ({ 
  rows, 
  columns, 
  loading, 
  onRowClick 
}) => {
  return (
    <Paper sx={{ height: 600, width: '100%', overflow: 'hidden' }}>
      <DataGrid
        rows={rows || []}
        columns={columns}
        loading={loading}
        density="compact" // OBLIGATORIO: Estilo "Enterprise Dense"
        
        // Slots para personalizar
        slots={{
          loadingOverlay: LinearProgress,
          toolbar: GridToolbar, // Barra de búsqueda y filtros nativa
        }}

        // Props de la Toolbar
        slotProps={{
          toolbar: {
            showQuickFilter: true, // Buscador rápido
            quickFilterProps: { debounceMs: 500 },
          },
        }}

        // Paginación (Por ahora cliente, fase 4 cambiamos a servidor)
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[25, 50, 100]}

        // Estilos visuales
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F5F7FA', // Cabecera gris suave
            color: '#556B82',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '11px',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F5F9FF', // Hover azul muy suave
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}

        // Eventos
        onRowClick={onRowClick ? (params) => onRowClick(params.row.id) : undefined}
        disableRowSelectionOnClick
        localeText={spanishLocale}
      />
    </Paper>
  );
};

export default SmartTable;