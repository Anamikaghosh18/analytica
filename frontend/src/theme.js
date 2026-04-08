import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF', // Apple System Blue
    },
    background: {
      default: '#0F172A', // Deep Slate-Charcoal (Softer than pure black)
      paper: '#1E293B',   // Lighter slate surface
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    divider: alpha('#FFFFFF', 0.08),
  },
  typography: {
    fontFamily: '"SF Pro Text", "Inter", -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 16, // Softer curves for "friendly" feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          boxShadow: `0 4px 14px 0 ${alpha('#000000', 0.4)}`,
          '&:hover': {
            boxShadow: `0 6px 20px 0 ${alpha('#007AFF', 0.2)}`,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
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
            borderRadius: 12,
            backgroundColor: alpha('#FFFFFF', 0.03),
            '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
          },
        },
      },
    },
  },
});

export default theme;
