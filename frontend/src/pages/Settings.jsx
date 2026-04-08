import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  TextField, 
  Button, 
  alpha, 
  Alert, 
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Lock, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';

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

  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: -1, 
            color: '#FFFFFF',
            mb: 1
          }}
        >
          System Settings
        </Typography>
        <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.5), fontWeight: 500 }}>
          Manage your account security and clinical preferences.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
        
        {/* Security / Password Card */}
        <Card 
          sx={{ 
            p: 3, 
            bgcolor: alpha('#1C1C1E', 0.4), 
            backdropFilter: 'blur(20px)',
            border: `0.5px solid ${alpha('#FFFFFF', 0.1)}`,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#007AFF', 0.1), 
                color: '#007AFF',
                display: 'flex'
              }}
            >
              <ShieldCheck size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#FFFFFF' }}>Account Security</Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4) }}>
                Enable manual email/password login
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSetPassword}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                slotProps={{
                  input: {
                    style: { color: '#FFFFFF', borderRadius: 12 },
                  },
                  inputLabel: {
                    style: { color: alpha('#FFFFFF', 0.5) }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) },
                    '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  }
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    style: { color: '#FFFFFF', borderRadius: 12 },
                  },
                  inputLabel: {
                    style: { color: alpha('#FFFFFF', 0.5) }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) },
                    '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  }
                }}
              />
              
              <Button 
                fullWidth 
                type="submit"
                disabled={loading}
                variant="contained" 
                sx={{ 
                  mt: 1,
                  py: 1.5, 
                  borderRadius: 3, 
                  bgcolor: '#007AFF',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: `0 8px 20px ${alpha('#007AFF', 0.3)}`,
                  '&:hover': {
                    bgcolor: '#0062CC',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Security Credentials'}
              </Button>
            </Box>
          </form>

          {error && (
            <Alert 
              severity="error" 
              variant="filled" 
              sx={{ borderRadius: 3, bgcolor: alpha('#FF453A', 0.9) }}
            >
              {error}
            </Alert>
          )}
        </Card>

        {/* Info Card */}
        <Card 
          sx={{ 
            p: 3, 
            bgcolor: alpha('#1C1C1E', 0.2), 
            border: `0.5px dashed ${alpha('#FFFFFF', 0.1)}`,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 2
          }}
        >
          <User size={40} color={alpha('#FFFFFF', 0.2)} />
          <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontSize: '0.85rem', maxWidth: 200 }}>
            Updates made here will apply to your global Analytica Studio identity.
          </Typography>
        </Card>

      </Box>

      {/* Notifications */}
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
          sx={{ borderRadius: 3, bgcolor: '#30D158' }}
        >
          Security credentials updated. You can now use manual login.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
