import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { LayoutDashboard, Globe, Shield, BarChart3, Settings, HelpCircle, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Global Stats', icon: <Globe size={20} />, path: '/stats' },
    { text: 'Security', icon: <Shield size={20} />, path: '/security' },
    { text: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
  ];

  const secondaryItems = [
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { text: 'Help Center', icon: <HelpCircle size={20} />, path: '/help' },
  ];

  return (
    <Box sx={{ width: 280, height: '100vh', borderRight: '1px solid', borderColor: 'divider', py: 3, px: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, px: 2 }}>
        <Activity size={24} color="#D0E4FF" style={{ marginRight: '12px' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5, color: 'primary.main' }}>
          ANALYTICA
        </Typography>
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: 'primary.container',
                  color: 'primary.onContainer',
                  '& .MuiListItemIcon-root': { color: 'primary.onContainer' },
                  '&:hover': { bgcolor: 'primary.container' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List>
        {secondaryItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: '12px' }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
