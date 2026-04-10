import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  Alert as MuiAlert, 
  Snackbar,
  CircularProgress,
  TextField,
  Button,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  ShieldCheck, User, ArrowRight, Lock, Bell, 
  Key, Save, RefreshCw, LogOut, Mail, 
  Fingerprint, Smartphone, Globe, Activity, Eye, EyeOff, Copy
} from 'lucide-react';
import api from '../services/api';
import BentoCard from '../components/BentoCard';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Notifications state initialized from user profile
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    outages: true,
    weekly: true
  });

  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (user?.notification_prefs) {
        try {
            const prefs = JSON.parse(user.notification_prefs);
            setNotifications(prev => ({ ...prev, ...prefs }));
        } catch (e) {
            console.error("Failed to parse notification prefs", e);
        }
    }
  }, [user]);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setSnackbar({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/set-password', { new_password: newPassword });
      setSnackbar({ open: true, message: 'Credentials updated successfully', severity: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Update failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    
    try {
        await api.post('/auth/settings', { notification_prefs: updated });
        setSnackbar({ open: true, message: 'Preferences synchronized', severity: 'success' });
        await refreshUser();
    } catch (err) {
        setSnackbar({ open: true, message: 'Sync failed', severity: 'error' });
    }
  };

  const handleGenerateKey = async () => {
    setLoading(true);
    try {
        await api.post('/auth/generate-key');
        setSnackbar({ open: true, message: 'New API Key generated & active', severity: 'success' });
        await refreshUser();
    } catch (err) {
        setSnackbar({ open: true, message: "System failure during key rotation", severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!user?.api_key) return;
    navigator.clipboard.writeText(user.api_key);
    setSnackbar({ open: true, message: 'API Key copied to security vault', severity: 'success' });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, md: 4, lg: 6 }, py: 6 }}>
      
      {/* ── Page Header ── */}
      <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -2, color: '#FFFFFF', mb: 1, lineHeight: 1 }}>Studio Config</Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.25), fontWeight: 600, fontSize: '0.9rem' }}>Manage your core identity and system security protocols.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={logout} 
                startIcon={<LogOut size={18} />} 
                sx={{ 
                    borderColor: alpha('#ff375f', 0.2), 
                    color: '#ff375f', 
                    borderRadius: 1.5, 
                    px: 3, 
                    height: 48,
                    fontWeight: 900, 
                    textTransform: 'none', 
                    '&:hover': { bgcolor: alpha('#ff375f', 0.05), borderColor: '#ff375f' } 
                }}
              >
                  Sign Out
              </Button>
          </Box>
      </Box>

      {/* ── Main Bento Grid: Full Width Stack ── */}
      <Stack spacing={4}>
        
        {/* Row 1: Identity */}
        <Box>
            <BentoCard sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#007AFF', 0.1), color: '#007AFF' }}>
                            <User size={28} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.4rem', lineHeight: 1.1 }}>Core Identity</Typography>
                            <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 900, textTransform: 'uppercase' }}>System Admin Profile</Typography>
                        </Box>
                    </Box>
                    <Chip label={user?.is_active ? "VERIFIED ACCESS" : "PENDING VERIFICATION"} size="small" sx={{ bgcolor: alpha('#00ffc3', 0.05), color: '#00ffc3', fontWeight: 900, fontSize: '0.65rem' }} />
                </Box>

                <Grid container spacing={6} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={4}>
                        <Typography sx={{ color: alpha('#fff', 0.4), fontSize: '0.65rem', fontWeight: 900, mb: 1 }}>PRIMARY EMAIL</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{user?.email || 'Loading Profile...'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography sx={{ color: alpha('#fff', 0.4), fontSize: '0.65rem', fontWeight: 900, mb: 1 }}>MEMBER STATUS</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                            NODE ADMIN — SINCE {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase() : 'APRIL 2026'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2.5, bgcolor: alpha('#00ffc3', 0.02), borderRadius: 2, border: `1px solid ${alpha('#00ffc3', 0.05)}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ShieldCheck size={16} color="#00ffc3" />
                                <Typography sx={{ color: '#00ffc3', fontWeight: 900, fontSize: '0.65rem' }}>ENCRYPTION ACTIVE</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: alpha('#fff', 0.3), fontWeight: 500, display: 'block' }}>Local RSA-4096 protocols verified for this station.</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: alpha('#fff', 0.05), mb: 4 }} />
                
                <Box>
                    <Typography sx={{ color: alpha('#fff', 0.6), fontWeight: 900, fontSize: '0.75rem', mb: 3, letterSpacing: 1.5 }}>SECURITY OVERRIDE</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth type="password" variant="outlined" label="New Password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: alpha('#000', 0.2) }}} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth type="password" variant="outlined" label="Confirm Password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: alpha('#000', 0.2) }}} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button fullWidth variant="contained" onClick={handleSetPassword} disabled={loading} sx={{ bgcolor: '#fff', color: '#000', fontWeight: 900, height: 56, borderRadius: 1.5 }}>
                                {loading ? <CircularProgress size={20} color="inherit" /> : 'Provision New Credentials'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </BentoCard>
        </Box>

        {/* Row 2: API Access */}
        <Box>
            <BentoCard sx={{ p: 4, bgcolor: alpha('#BF5AF2', 0.02) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#BF5AF2', 0.1), color: '#BF5AF2' }}>
                            <Key size={28} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.2rem' }}>Developer API Access</Typography>
                            <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 600 }}>PRIVATE ACCESS TOKEN</Typography>
                        </Box>
                    </Box>
                    <Button startIcon={<RefreshCw size={14} />} onClick={handleGenerateKey} disabled={loading} sx={{ color: '#BF5AF2', fontWeight: 900 }}>Rotate Key</Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box sx={{ flex: 1, p: 2, bgcolor: '#000', border: `1px solid ${alpha('#BF5AF2', 0.2)}`, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#BF5AF2', fontFamily: '"JetBrains Mono", monospace', fontSize: '1rem', letterSpacing: 1 }}>
                            {loading ? '...' : (showApiKey ? (user?.api_key || 'ana_live_GENERATE_TO_VIEW') : 'ana_live_••••••••••••••••••••••••••••••')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={handleCopyKey} disabled={!user?.api_key} sx={{ color: alpha('#BF5AF2', 0.4) }}><Copy size={20} /></IconButton>
                            <IconButton onClick={() => setShowApiKey(!showApiKey)} sx={{ color: alpha('#BF5AF2', 0.4) }}>{showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}</IconButton>
                        </Box>
                    </Box>
                    <Box sx={{ maxWidth: 300 }}>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 500, lineHeight: 1.4, display: 'block' }}>System-level telemetry extraction token. Regeneration will instantly invalidate sessions.</Typography>
                    </Box>
                </Box>
            </BentoCard>
        </Box>

        {/* Row 3: Protocols */}
        <Box>
            <BentoCard sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#00ffc3', 0.1), color: '#00ffc3' }}>
                        <Bell size={28} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.2rem' }}>Alert Protocols</Typography>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 900 }}>SYSTEM NOTIFICATIONS</Typography>
                    </Box>
                </Box>
                <Grid container spacing={4}>
                    {[
                        { label: 'Outage Logic', desc: 'Instant P1 triggers on downtime', key: 'outages' },
                        { label: 'Performance Summaries', desc: 'Email digest of all node data', key: 'weekly' },
                        { label: 'Native Email Sync', desc: 'Direct protocol verification', key: 'email' },
                        { label: 'Push Tokens', desc: 'Secure device alerts', key: 'push' }
                    ].map(n => (
                        <Grid item xs={12} sm={6} md={3} key={n.key}>
                            <Box sx={{ p: 3, bgcolor: alpha('#fff', 0.02), borderRadius: 2, border: `1px solid ${alpha('#fff', 0.05)}`, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography sx={{ color: '#fff', fontWeight: 800 }}>{n.label}</Typography>
                                    <Switch checked={notifications[n.key]} onChange={() => handleUpdateNotifications(n.key)} color="primary" />
                                </Box>
                                <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 500 }}>{n.desc}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </BentoCard>
        </Box>

      </Stack>




      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>{snackbar.message}</MuiAlert>
      </Snackbar>

    </Box>
  );
};

export default Settings;
