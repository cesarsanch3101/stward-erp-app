import { createTheme } from '@mui/material/styles';

// Paleta SAP Horizon (Aproximación Profesional)
const sapColors = {
  primary: '#0070F2', // Azul SAP
  secondary: '#556B82', // Gris Pizarra
  background: '#F5F6F7', // Fondo Shell
  surface: '#FFFFFF',
  error: '#D20A0A',
  success: '#188918',
  warning: '#E76500',
  textPrimary: '#1D2D3E',
  textSecondary: '#556B82',
  border: '#E0E0E0'
};

const enterpriseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: sapColors.primary },
    secondary: { main: sapColors.secondary },
    background: { default: sapColors.background, paper: sapColors.surface },
    error: { main: sapColors.error },
    success: { main: sapColors.success },
    warning: { main: sapColors.warning },
    text: { primary: sapColors.textPrimary, secondary: sapColors.textSecondary },
    divider: sapColors.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '24px', fontWeight: 600, color: sapColors.textPrimary },
    h2: { fontSize: '20px', fontWeight: 600, color: sapColors.textPrimary },
    h3: { fontSize: '18px', fontWeight: 600, color: sapColors.textPrimary },
    h4: { fontSize: '16px', fontWeight: 600, color: sapColors.textPrimary },
    h5: { fontSize: '14px', fontWeight: 600, color: sapColors.textPrimary },
    h6: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
    body1: { fontSize: '14px', lineHeight: 1.5 },
    body2: { fontSize: '13px', lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // Bordes sutiles
  },
  components: {
    // --- DENSIDAD ALTA ---
    MuiButton: {
      styleOverrides: {
        root: {
          height: '32px', // Botones compactos
          fontSize: '13px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: { fontWeight: 600 }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          '& .MuiOutlinedInput-input': {
            padding: '8px 12px', // Inputs compactos
            height: '1.4em',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          transform: 'translate(14px, 9px) scale(1)',
          '&.Mui-focused': { transform: 'translate(14px, -9px) scale(0.75)' },
          '&.MuiFormLabel-filled': { transform: 'translate(14px, -9px) scale(0.75)' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '6px 16px',
          fontSize: '13px',
          borderBottom: `1px solid ${sapColors.border}`,
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F5F7FA',
          color: sapColors.textSecondary,
          height: '40px',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${sapColors.border}` }
      }
    }
  },
});

export default enterpriseTheme;