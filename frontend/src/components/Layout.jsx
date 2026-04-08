import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton, alpha } from '@mui/material';
import { LogOut, Bell, User as UserIcon, Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container component="main" sx={{ pt: 4, pb: 4 }}>
          {children}
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000000' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppBar position="sticky" elevation={0} sx={{ 
          bgcolor: alpha('#1C1C1E', 0.1), 
          backdropFilter: 'blur(30px) saturate(180%)', 
          borderBottom: `0.5px solid ${alpha('#FFFFFF', 0.1)}`,
          px: 3
        }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: '0.4 !important', minHeight: '64px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="#FFFFFF" sx={{ fontWeight: 800, letterSpacing: -0.5, opacity: 0.9 }}>
                Fleet Dashboard
              </Typography>
              <Box sx={{ width: 1, height: 16, bgcolor: alpha('#FFFFFF', 0.15), mx: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha('#FFFFFF', 0.05), border: `0.5px solid ${alpha('#FFFFFF', 0.1)}`, borderRadius: 1.5, px: 2, height: 32 }}>
                <Search size={14} color={alpha('#FFFFFF', 0.4)} style={{ marginRight: 8 }} />
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.4), fontSize: '0.85rem' }}>Search nodes...</Typography>
                <Typography variant="caption" sx={{ ml: 4, color: alpha('#FFFFFF', 0.2), bgcolor: alpha('#FFFFFF', 0.08), px: 0.5, borderRadius: 0.5, fontWeight: 700 }}>⌘K</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Plus size={16} />} 
                sx={{ borderRadius: 1.5, height: 32, bgcolor: '#007AFF', px: 2, '&:hover': { bgcolor: '#0A84FF' } }}
              >
                New Node
              </Button>
              <Box sx={{ width: 1, height: 16, bgcolor: alpha('#FFFFFF', 0.15), mx: 1 }} />
              <IconButton size="small" sx={{ borderRadius: 1, bgcolor: alpha('#FFFFFF', 0.05) }}><Bell size={18} /></IconButton>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.2, 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1.5, 
                bgcolor: alpha('#FFFFFF', 0.05),
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha('#FFFFFF', 0.08) }
              }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #007AFF 0%, #00C7BE 100%)' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Admin</Typography>
              </Box>
              <IconButton 
                onClick={handleLogout}
                sx={{ borderRadius: 1, '&:hover': { bgcolor: alpha('#EB5757', 0.1), color: '#EB5757' } }}
              >
                <LogOut size={18} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <Container component="main" sx={{ py: 6, maxWidth: '1400px !important' }}>
            {children}
          </Container>
        </Box>
        
        <Box component="footer" sx={{ p: 4, borderTop: `0.5px solid ${alpha('#FFFFFF', 0.1)}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.25), fontWeight: 700, letterSpacing: 0.5 }}>
            ANALYTICA — PRIVATE INFRASTRUCTURE HUB
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
