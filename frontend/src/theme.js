import { createTheme, alpha } from '@mui/material/styles';

// Material Design 3 (M3) inspired professional charcoal theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0E4FF', // Light blue tonal from M3
      container: '#004A77',
      onContainer: '#D0E4FF',
    },
    secondary: {
      main: '#BBC7DB',
      container: '#3E4858',
    },
    background: {
      default: '#0F1113', // Very dark charcoal
      paper: '#1A1C1E',   // M3 Surface color
    },
    surfaceVariant: '#43474E',
    outline: '#8D9199',
    error: {
      main: '#FFB4AB',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: -0.5 },
    h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: -0.5 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0.1 },
  },
  shape: {
    borderRadius: 16, // M3 medium rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // M3 fully rounded buttons
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 20, // M3 Large rounded corners for surfaces
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1C1E',
          border: '1px solid #333',
          transition: 'transform 0.2s ease-in-out, border-color 0.2s',
          '&:hover': {
            borderColor: '#555',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;
