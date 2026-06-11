import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0095f6' },
    secondary: { main: '#ed4956' },
    background: { default: '#fafafa', paper: '#ffffff' },
    text: { primary: '#262626', secondary: '#8e8e8e' },
    divider: '#dbdbdb',
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        containedPrimary: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fafafa',
            '& fieldset': { borderColor: '#dbdbdb' },
            '&:hover fieldset': { borderColor: '#a8a8a8' },
            '&.Mui-focused fieldset': { borderColor: '#a8a8a8', borderWidth: 1 },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#262626',
          boxShadow: 'none',
          borderBottom: '1px solid #dbdbdb',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { borderTop: '1px solid #dbdbdb', height: 56 },
      },
    },
  },
})

export default theme
