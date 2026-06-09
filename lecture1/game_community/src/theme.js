import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e8e8e8',
      light: '#ffffff',
      dark: '#b0b0b0',
    },
    secondary: {
      main: '#888888',
      light: '#aaaaaa',
      dark: '#555555',
    },
    background: {
      default: '#080808',
      paper: '#111111',
    },
    text: {
      primary: '#e8e8e8',
      secondary: '#787878',
    },
    error: { main: '#ff4444' },
    warning: { main: '#ffaa00' },
    success: { main: '#44cc88' },
    divider: 'rgba(232, 232, 232, 0.1)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(232, 232, 232, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          color: '#080808',
          fontWeight: 700,
          boxShadow: '0 0 12px rgba(232, 232, 232, 0.2)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(232, 232, 232, 0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#080808',
          borderBottom: '1px solid rgba(232, 232, 232, 0.1)',
          boxShadow: '0 0 20px rgba(232, 232, 232, 0.05)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(232, 232, 232, 0.1)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(232, 232, 232, 0.15)' },
            '&:hover fieldset': { borderColor: 'rgba(232, 232, 232, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#e8e8e8' },
          },
        },
      },
    },
  },
});

export default theme;
