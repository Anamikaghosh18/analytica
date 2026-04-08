import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container, IconButton } from '@mui/material';
import { Activity, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Activity color="#90caf9" style={{ marginRight: '8px' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
              ANALYTICA
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
              <>
                <Button 
                  startIcon={<LayoutDashboard size={18} />} 
                  color={location.pathname === '/' ? 'primary' : 'inherit'}
                  onClick={() => navigate('/')}
                >
                  Dashboard
                </Button>
                <Button startIcon={<LogOut size={18} />} color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/register')}>Sign Up</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ p: 3, mt: 'auto', borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Analytica API Monitor. Professional Edition.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
