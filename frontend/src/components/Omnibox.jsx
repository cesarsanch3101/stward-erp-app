import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

const Omnibox = () => {
  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
        height: 36,
        backgroundColor: '#F0F2F5',
        border: '1px solid transparent',
        '&:hover': {
          backgroundColor: '#E4E6E9',
        },
        '&:focus-within': {
          backgroundColor: '#FFFFFF',
          border: '1px solid #0070F2',
          boxShadow: '0 0 0 2px rgba(0,112,242,0.1)'
        }
      }}
    >
      <IconButton sx={{ p: '6px' }} aria-label="search" disabled>
        <SearchIcon fontSize="small" />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1, fontSize: '13px' }}
        placeholder="Buscar... (ej: 'Factura 2024' o 'Cliente Tesla')"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <IconButton type="button" sx={{ p: '6px' }} aria-label="filters">
        <TuneIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default Omnibox;