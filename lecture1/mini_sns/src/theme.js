import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#66c0f4' },
    secondary: { main: '#4c6b22' },
    background: { default: '#1b2838', paper: '#16202d' },
    text: { primary: '#c6d4df', secondary: '#8fa4b9' },
    divider: '#2a475e',
    success: { main: '#5ba32b' },
    error: { main: '#e74c3c' },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#1b2838', color: '#c6d4df' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 4, fontWeight: 600 },
        containedPrimary: {
          background: 'linear-gradient(to bottom, #75b3e0, #4b8fc4)',
          boxShadow: 'none',
          color: '#c6d4df',
          '&:hover': { background: 'linear-gradient(to bottom, #8dc8f0, #5ba3d8)', boxShadow: 'none' },
        },
        containedSuccess: {
          background: 'linear-gradient(to bottom, #75bb21, #558a1a)',
          boxShadow: 'none',
          color: '#d9f5a5',
          '&:hover': { background: 'linear-gradient(to bottom, #88cc28, #66a020)', boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#316282',
            borderRadius: 4,
            '& fieldset': { borderColor: '#4c7b9a' },
            '&:hover fieldset': { borderColor: '#66c0f4' },
            '&.Mui-focused fieldset': { borderColor: '#66c0f4' },
            '& input': { color: '#c6d4df' },
            '& input::placeholder': { color: '#8fa4b9', opacity: 1 },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#2a475e' } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
  },
})

export default theme
