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
  Fingerprint, Smartphone, Globe, Activity
} from 'lucide-react';
import api from '../services/api';
import BentoCard from '../components/BentoCard';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Notifications Mock State
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    outages: true,
    weekly: true
  });

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
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Update failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setSnackbar({ open: true, message: 'Notification preferences saved', severity: 'success' });
  };

  const handleGenerateKey = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({ open: true, message: 'New API Key generated & active', severity: 'success' });
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 4, py: 6 }}>
      
      {/* ── Page Header ── */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1.5, color: '#FFFFFF', mb: 1, lineHeight: 1 }}>Studio Config</Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.25), fontWeight: 600 }}>Manage your core identity and security protocols.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={logout} startIcon={<LogOut size={18} />} sx={{ borderColor: alpha('#ff375f', 0.2), color: '#ff375f', borderRadius: 1.5, px: 3, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha('#ff375f', 0.05), borderColor: '#ff375f' } }}>Sign Out</Button>
          </Box>
      </Box>

      <Grid container spacing={4}>
        
        {/* ── Profile & Identity ── */}
        <Grid item xs={12} md={7}>
            <BentoCard height="100%">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#007AFF', 0.1), color: '#007AFF' }}>
                        <User size={24} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.25rem' }}>Core Identity</Typography>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 800 }}>SYSTEM ADMINISTRATOR PROFILE</Typography>
                    </Box>
                </Box>

                <Stack spacing={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Mail size={18} color={alpha('#fff', 0.2)} />
                            <Box>
                                <Typography sx={{ color: alpha('#fff', 0.4), fontSize: '0.65rem', fontWeight: 900 }}>EMAIL ADDRESS</Typography>
                                <Typography sx={{ color: '#fff', fontWeight: 700 }}>{user?.email || 'N/A'}</Typography>
                            </Box>
                        </Box>
                        <Chip label="VERIFIED" size="small" sx={{ bgcolor: alpha('#00ffc3', 0.1), color: '#00ffc3', fontWeight: 900, fontSize: '0.6rem' }} />
                    </Box>

                    <Divider sx={{ borderColor: alpha('#fff', 0.05) }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Fingerprint size={18} color={alpha('#fff', 0.2)} />
                        <Box>
                            <Typography sx={{ color: alpha('#fff', 0.4), fontSize: '0.65rem', fontWeight: 900 }}>MEMBER SINCE</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700 }}>APRIL 2026</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: alpha('#fff', 0.05) }} />

                    <Box sx={{ pt: 2 }}>
                        <Typography sx={{ color: alpha('#fff', 0.6), fontWeight: 900, fontSize: '0.7rem', mb: 3 }}>UPDATE PASSWORD</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth type="password" variant="standard" placeholder="New Secure Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} InputProps={{ sx: { color: '#fff', fontSize: '1rem', py: 1.5 } }} />
                            <TextField fullWidth type="password" variant="standard" placeholder="Confirm Credentials" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} InputProps={{ sx: { color: '#fff', fontSize: '1rem', py: 1.5 } }} />
                            <Button variant="contained" onClick={handleSetPassword} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />} sx={{ bgcolor: '#fff', color: '#000', fontWeight: 900, py: 1.5, borderRadius: 1, '&:hover': { bgcolor: alpha('#fff', 0.8) } }}>Provision New Credentials</Button>
                        </Stack>
                    </Box>
                </Stack>
            </BentoCard>
        </Grid>

        {/* ── Security & API ── */}
        <Grid item xs={12} md={5}>
            <Stack spacing={4}>
                <BentoCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: alpha('#BF5AF2', 0.1), color: '#BF5AF2' }}>
                            <Bell size={20} />
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#fff' }}>Global Alerts</Typography>
                    </Box>
                    <Stack spacing={2.5}>
                        {[
                            { label: 'Critical Outages', key: 'outages' },
                            { label: 'Weekly Reports', key: 'weekly' },
                            { label: 'Email Notifications', key: 'email' },
                            { label: 'Push Tokens', key: 'push' }
                        ].map(n => (
                            <Box key={n.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ color: alpha('#fff', 0.6), fontWeight: 600, fontSize: '0.9rem' }}>{n.label}</Typography>
                                <Switch size="small" checked={notifications[n.key]} onChange={() => handleUpdateNotifications(n.key)} color="primary" />
                            </Box>
                        ))}
                    </Stack>
                </BentoCard>

                <BentoCard>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: alpha('#00ffc3', 0.1), color: '#00ffc3' }}>
                                <Key size={20} />
                            </Box>
                            <Typography sx={{ fontWeight: 900, color: '#fff' }}>Developer API</Typography>
                        </Box>
                        <Tooltip title="Cycle API Key">
                            <IconButton onClick={handleGenerateKey} size="small" sx={{ color: alpha('#fff', 0.1), '&:hover': { color: '#00ffc3' } }}><RefreshCw size={16} /></IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: alpha('#000', 0.4), border: `1px solid ${alpha('#fff', 0.05)}`, borderRadius: 1.5, mb: 2 }}>
                        <Typography sx={{ color: alpha('#00ffc3', 0.8), fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', letterSpacing: 1 }}>{loading ? 'GENERATING...' : 'ana_live_6f8g2k9n1p0q5r'}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.15), fontWeight: 500 }}>Global access token for node-level telemetry extraction.</Typography>
                </BentoCard>

                <BentoCard sx={{ bgcolor: alpha('#007AFF', 0.02) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <ShieldCheck size={18} color="#007AFF" />
                        <Typography sx={{ color: '#007AFF', fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 2 }}>Security Status</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.4), lineHeight: 1.6 }}>Your account is protected by MFA and hardware-key encryption protocols. Monitor consensus provides an extra layer of data integrity.</Typography>
                </BentoCard>
            </Stack>
        </Grid>

      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>{snackbar.message}</MuiAlert>
      </Snackbar>

    </Box>
  );
};


export default Settings;
