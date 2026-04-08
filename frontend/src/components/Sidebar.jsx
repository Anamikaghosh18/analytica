import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, alpha } from '@mui/material';
import { LayoutDashboard, Globe, Shield, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { text: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics' },
    { text: 'Network', icon: <Globe size={18} />, path: '/network' },
    { text: 'Security', icon: <Shield size={18} />, path: '/security' },
  ];

  return (
    <Box sx={{ 
      width: 250, 
      height: '100vh', 
      bgcolor: alpha('#1C1C1E', 0.25),
      backdropFilter: 'blur(30px) saturate(180%)',
      borderRight: `0.5px solid ${alpha('#FFFFFF', 0.1)}`,
      display: 'flex', 
      flexDirection: 'column',
      px: 1.5,
      py: 3
    }}>
      <Box sx={{ mb: 4, px: 2, display: 'flex', alignItems: 'center', opacity: 1 }}>
        <Box sx={{ mr: 1.5 }}>
          <Logo size={32} />
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 800, letterSpacing: -0.5, fontSize: '1.25rem', color: '#FFFFFF' }}>
          Analytica
        </Typography>
      </Box>

      <List sx={{ px: 0 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  '&.Mui-selected': {
                    bgcolor: alpha('#FFFFFF', 0.08),
                    color: '#FFFFFF',
                    '& .MuiListItemIcon-root': { color: '#007AFF' },
                    '&:hover': { bgcolor: alpha('#FFFFFF', 0.12) },
                  },
                  '&:not(.Mui-selected):hover': {
                    bgcolor: alpha('#FFFFFF', 0.04),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#007AFF' : alpha('#FFFFFF', 0.5) }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? 600 : 500,
                    opacity: isActive ? 1 : 0.7
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 1 }}>
        <ListItemButton 
          onClick={() => navigate('/settings')}
          selected={location.pathname === '/settings'}
          sx={{ 
            borderRadius: 2, 
            py: 1,
            '&.Mui-selected': {
              bgcolor: alpha('#FFFFFF', 0.08),
              color: '#FFFFFF',
              '& .MuiListItemIcon-root': { color: '#007AFF' },
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: location.pathname === '/settings' ? '#007AFF' : alpha('#FFFFFF', 0.5) }}>
            <Settings size={18} />
          </ListItemIcon>
          <ListItemText primary="System Settings" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.7 }} />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 2, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 36, color: alpha('#FFFFFF', 0.5) }}><HelpCircle size={18} /></ListItemIcon>
          <ListItemText primary="Help Center" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.7 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
