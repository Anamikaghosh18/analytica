import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  Alert, 
  Snackbar,
  CircularProgress,
  TextField,
  Button
} from '@mui/material';
import { ShieldCheck, User, ArrowRight, Lock } from 'lucide-react';
import api from '../services/api';
import BentoCard from '../components/BentoCard';

const Settings = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/set-password', { new_password: newPassword });
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Mouse tracking for BentoCard glow
  const handleMouseMove = (e) => {
    const cards = document.getElementsByClassName('card-glow');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  return (
    <Box 
      onMouseMove={handleMouseMove}
      sx={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}
    >
      {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ fontWeight: 900, letterSpacing: -1.5, color: '#FFFFFF' }}
          >
            Studio Config
          </Typography>
          <Box sx={{ px: 1, py: 0.2, bgcolor: alpha('#BF5AF2', 0.1), border: `1px solid ${alpha('#BF5AF2', 0.2)}`, borderRadius: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#BF5AF2', fontWeight: 800, letterSpacing: 1, fontSize: '0.65rem' }}>SYSTEM ACL</Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 600, letterSpacing: -0.1 }}>
          Manage your global identity and secure access tokens.
        </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)', 
        gridAutoRows: 'minmax(160px, auto)',
        gap: 3 
      }}>
        
        {/* Security / Password Action Block */}
        <BentoCard sx={{ gridColumn: { xs: 'span 12', lg: 'span 7' }, gridRow: 'span 3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha('#007AFF', 0.05), border: `1px solid ${alpha('#007AFF', 0.1)}`, color: '#007AFF' }}>
              <ShieldCheck size={24} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>Identity Security</Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 800, fontSize: '0.625rem' }}>ENABLE MANUAL OVERRIDE LOGIN</Typography>
            </Box>
          </Box>

          <form onSubmit={handleSetPassword}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                fullWidth
                type="password"
                placeholder="Secure Password"
                variant="standard"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
                sx={{ 
                  '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) },
                  '& .MuiInput-underline:hover:before': { borderColor: alpha('#FFF', 0.2) + ' !important' },
                }}
              />
              <TextField
                fullWidth
                type="password"
                placeholder="Confirm Credentials"
                variant="standard"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
                sx={{ 
                  '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) },
                  '& .MuiInput-underline:hover:before': { borderColor: alpha('#FFF', 0.2) + ' !important' },
                }}
              />
              
              <Button 
                fullWidth 
                type="submit"
                disabled={loading}
                variant="contained" 
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowRight size={20} />}
                sx={{ 
                  mt: 2,
                  py: 1.5, 
                  borderRadius: 0.5, 
                  bgcolor: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: alpha('#FFFFFF', 0.9), transform: 'translateY(-1px)' }
                }}
              >
                Provision Account Credentials
              </Button>
            </Box>
          </form>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 4, borderRadius: 1, bgcolor: alpha('#ff4b4b', 0.1), color: '#ff4b4b', border: 'none' }}
            >
              {error}
            </Alert>
          )}
        </BentoCard>

        {/* Protocol Info Card */}
        <BentoCard sx={{ gridColumn: { xs: 'span 12', lg: 'span 5' }, gridRow: 'span 1', bgcolor: alpha('#BF5AF2', 0.02) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Lock size={18} color="#BF5AF2" />
            <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Security Protocol</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5), fontWeight: 500, lineHeight: 1.6 }}>
            Updating credentials will re-sync your local Analytica Studio identity with our distributed security cluster. This action is irreversible.
          </Typography>
        </BentoCard>

        {/* Support Block */}
        <BentoCard sx={{ gridColumn: { xs: 'span 12', lg: 'span 5' }, gridRow: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <User size={48} color={alpha('#FFFFFF', 0.1)} style={{ marginBottom: 24 }} />
          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 1 }}>Need Provisioning Help?</Typography>
          <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.4), mb: 4, maxWidth: 300 }}>
            Contact the Analytica Ops team for manual credential resets and node recovery.
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              borderColor: alpha('#FFFFFF', 0.1), 
              color: alpha('#FFFFFF', 0.4),
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { borderColor: alpha('#FFFFFF', 0.3), color: '#FFFFFF' }
            }}
          >
            View Documentation
          </Button>
        </BentoCard>

      </Box>

      {/* Persistence Notification */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ borderRadius: 3, bgcolor: '#00ffc3', color: '#000000', fontWeight: 800 }}
        >
          Credentials Synchronized Successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
