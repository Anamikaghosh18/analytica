import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF', // Apple System Blue
    },
    background: {
      default: '#000000', // Absolute OLED Black
      paper: '#09090b',   // Deep Charcoal Surface
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#a1a1aa',
    },
    divider: alpha('#FFFFFF', 0.1),
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Text", -apple-system, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em' },
    h2: { fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em' },
    h3: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' },
    h4: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontSize: '1rem', fontWeight: 700, letterSpacing: '0em' },
    body1: { fontSize: '0.875rem', letterSpacing: '-0.01em', lineHeight: 1.5 },
    body2: { fontSize: '0.75rem', letterSpacing: '-0.01em', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 800, letterSpacing: '0.02em', fontSize: '0.8125rem' },
    caption: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }
  },
  shape: {
    borderRadius: 4, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: `0 0 10px ${alpha('#007AFF', 0.2)}`,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            fontSize: '0.875rem',
            backgroundColor: alpha('#FFFFFF', 0.03),
            '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
          },
        },
      },
    },
  },
});

export default theme;
