import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, alpha, Tooltip, Menu as MuiMenu, MenuItem as MuiMenuItem, Button } from '@mui/material';
import { LogOut, Bell, Search, Activity, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ⌘K / Ctrl+K to open palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Decode username from JWT
  const getUserEmail = () => {
    try {
      const token = user?.token || localStorage.getItem('token');
      if (!token) return 'U';
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Prioritize email field for initials, then fallback to sub
      const identity = payload.email || payload.sub || 'User';
      
      // If it's an email, return the part before @, otherwise return the whole string
      if (typeof identity === 'string' && identity.includes('@')) {
        return identity.split('@')[0];
      }
      return identity.toString();
    } catch (err) {
      return 'U';
    }
  };

  const PAGE_TITLES = {
    '/': 'Dashboard',
    '/analytics': 'Analytics',
    '/network': 'Network',
    '/security': 'Security',
    '/settings': 'Settings',
  };
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'transparent' }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: alpha('#050505', 0.8) }}>
      <Sidebar />

      {/* Main column */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>

        {/* ── Topbar ── */}
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            height: 56,
            bgcolor: '#0A0A0A',
            borderBottom: `1px solid ${alpha('#FFFFFF', 0.07)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            zIndex: 100,
          }}
        >
          {/* Left — breadcrumb + search trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Breadcrumb — SIMPLIFIED */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Activity size={13} color={alpha('#007AFF', 0.5)} />
              <Typography sx={{ color: alpha('#FFFFFF', 0.25), fontSize: '0.72rem', fontWeight: 600 }}>
                Analytica
              </Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.12), fontSize: '0.72rem', mx: 0.25 }}>
                /
              </Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.85), fontSize: '0.78rem', fontWeight: 800 }}>
                {pageTitle}
              </Typography>
            </Box>
          </Box>

          {/* Right — clock + bell + user + logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Clock */}
            <Typography sx={{
              color: alpha('#FFFFFF', 0.2), fontSize: '0.7rem', fontWeight: 600,
              fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.5, minWidth: 60, textAlign: 'right'
            }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </Typography>

            <Box sx={{ width: '1px', height: 14, bgcolor: alpha('#FFFFFF', 0.08) }} />

            {/* Bell */}
            <Tooltip title="Notifications" arrow>
              <IconButton size="small" sx={{
                borderRadius: '4px', p: 0.75,
                bgcolor: alpha('#FFFFFF', 0.02),
                border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
                color: alpha('#FFFFFF', 0.35),
                '&:hover': { bgcolor: alpha('#FFFFFF', 0.07), color: alpha('#FFFFFF', 0.7) }
              }}>
                <Bell size={14} />
              </IconButton>
            </Tooltip>

            {/* User Profile — PREMIUM GMAIL-LIKE UI */}
            <Box sx={{ position: 'relative' }}>
              <IconButton 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                  p: 0, 
                  border: `2px solid ${alpha('#FFFFFF', 0.05)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: alpha('#007AFF', 0.5), transform: 'scale(1.05)' }
                }}
              >
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #007AFF 0%, #5E5CE6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', color: '#fff', fontWeight: 900,
                  boxShadow: `0 0 15px ${alpha('#007AFF', 0.3)}`
                }}>
                  {getUserEmail().slice(0, 1).toUpperCase()}
                </Box>
              </IconButton>

              <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transitionDuration={200}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    bgcolor: '#0F0F0F',
                    backgroundImage: 'none',
                    border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
                    borderRadius: 2,
                    minWidth: 280,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    '& .MuiMenuItem-root': {
                      px: 2, py: 1.2,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: alpha('#FFFFFF', 0.7),
                      '&:hover': { bgcolor: alpha('#FFFFFF', 0.05), color: '#FFFFFF' }
                    }
                  }
                }}
              >
                <Box sx={{ px: 2.5, py: 2.5, borderBottom: `1px solid ${alpha('#FFFFFF', 0.05)}`, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #007AFF 0%, #5E5CE6 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', color: '#fff', fontWeight: 900
                    }}>
                      {getUserEmail().slice(0, 1).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                        {getUserEmail()}
                      </Typography>
                      <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontSize: '0.75rem' }}>
                        Administrator Account
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth variant="outlined" 
                    size="small"
                    onClick={() => { navigate('/settings'); setAnchorEl(null); }}
                    sx={{ 
                      color: '#FFFFFF', borderColor: alpha('#FFFFFF', 0.15), 
                      textTransform: 'none', fontWeight: 700, borderRadius: 1.5,
                      '&:hover': { borderColor: '#FFFFFF', bgcolor: alpha('#FFFFFF', 0.05) }
                    }}
                  >
                    Manage Account
                  </Button>
                </Box>

                <MuiMenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Settings size={16} opacity={0.5} />
                    System Settings
                  </Box>
                </MuiMenuItem>
                <MuiMenuItem onClick={handleLogout} sx={{ color: '#ff4b4b !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LogOut size={16} />
                    Sign Out
                  </Box>
                </MuiMenuItem>
              </MuiMenu>
            </Box>

            {/* Logout */}
            <Tooltip title="Sign out" arrow>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  borderRadius: '4px', p: 0.75,
                  border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
                  color: alpha('#FFFFFF', 0.3),
                  '&:hover': { bgcolor: alpha('#ff4b4b', 0.08), color: '#ff4b4b', borderColor: alpha('#ff4b4b', 0.2) }
                }}
              >
                <LogOut size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Page content ── */}
        <Box sx={{
          flex: 1, overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#FFFFFF', 0.08), borderRadius: '2px' }
        }}>
          <Container component="main" sx={{ py: 5, maxWidth: '1600px !important', px: { xs: 2, sm: 4 } }}>
            {children}
          </Container>
        </Box>

        {/* ── Footer ── */}
        <Box sx={{
          flexShrink: 0, px: 4, py: 2,
          borderTop: `1px solid ${alpha('#FFFFFF', 0.04)}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Typography sx={{ color: alpha('#FFFFFF', 0.12), fontWeight: 700, letterSpacing: 1.5, fontSize: '0.6rem' }}>
            ANALYTICA — REAL-TIME MONITORING ENGINE
          </Typography>
          <Typography sx={{ color: alpha('#FFFFFF', 0.1), fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }}>
            v2.4.0
          </Typography>
        </Box>
      </Box>

      {/* ── Command Palette (global, portalled) ── */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  );
};

export default Layout;
