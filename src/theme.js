import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#4FC3A8' : '#0E6B5C' },
      secondary: { main: '#D9962B' },
      background:
        mode === 'dark'
          ? { default: '#0F1615', paper: '#172221' }
          : { default: '#F4F6F2', paper: '#FFFFFF' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Figtree", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: { defaultProps: { variant: 'outlined' } },
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    },
  });
