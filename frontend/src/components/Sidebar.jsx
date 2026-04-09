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
      width: 280, 
      height: '100vh', 
      bgcolor: '#000000',
      borderRight: `1px solid ${alpha('#FFFFFF', 0.08)}`,
      display: 'flex', 
      flexDirection: 'column',
      px: 2,
      py: 4,
      position: 'relative',
      borderRadius: 0,
      zIndex: 10
    }}>
      <Box sx={{ mb: 6, px: 2, display: 'flex', alignItems: 'center' }}>
        <Logo size={36} />
        <Typography variant="h5" sx={{ ml: 2, fontWeight: 900, letterSpacing: -1.5, color: '#FFFFFF' }}>
          Analytica
        </Typography>
      </Box>

      <List sx={{ px: 0 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 0.5,
                  py: 1,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: alpha('#FFFFFF', 0.05),
                    color: '#FFFFFF',
                    border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
                    '& .MuiListItemIcon-root': { color: '#007AFF' },
                    '&:hover': { bgcolor: alpha('#FFFFFF', 0.08) },
                  },
                  '&:not(.Mui-selected):hover': {
                    bgcolor: alpha('#FFFFFF', 0.03),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#007AFF' : alpha('#FFFFFF', 0.4) }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography sx={{ 
                      fontSize: '0.8125rem', 
                      fontWeight: isActive ? 800 : 500,
                      letterSpacing: isActive ? '-0.01em' : 0,
                      opacity: isActive ? 1 : 0.6,
                      color: isActive ? '#FFFFFF' : alpha('#FFFFFF', 0.6)
                    }}>
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 1, borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}`, pt: 3 }}>
        <ListItemButton 
          onClick={() => navigate('/settings')}
          selected={location.pathname === '/settings'}
          sx={{ 
            borderRadius: 3, 
            py: 1.2,
            mb: 1,
            '&.Mui-selected': {
              bgcolor: alpha('#FFFFFF', 0.05),
              color: '#FFFFFF',
              '& .MuiListItemIcon-root': { color: '#007AFF' },
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/settings' ? '#007AFF' : alpha('#FFFFFF', 0.4) }}>
            <Settings size={18} />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, color: '#FFFFFF' }}>
                System Configuration
              </Typography>
            } 
          />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 3, py: 1.2 }}>
          <ListItemIcon sx={{ minWidth: 40, color: alpha('#FFFFFF', 0.4) }}><HelpCircle size={18} /></ListItemIcon>
          <ListItemText 
            primary={
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, color: '#FFFFFF' }}>
                Documentation
              </Typography>
            } 
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
