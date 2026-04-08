import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, Stack, alpha, Divider, Container } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, ArrowRight, Globe, Zap } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Account creation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      height: '100vh',
      bgcolor: '#000000',
      color: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* Left Panel: Visual Hero (60%) */}
      <Box sx={{ 
        flex: 1.5, 
        bgcolor: '#050505',
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: { md: 8, lg: 12 },
        py: { md: 6, lg: 8 },
        overflow: 'hidden',
        borderRight: `1px solid ${alpha('#FFFFFF', 0.05)}`,
        background: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '32px 32px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 122, 255, 0.05) 0%, transparent 70%)',
          animation: 'pulse 10s infinite alternate ease-in-out',
        },
        '@keyframes pulse': {
          '0%': { opacity: 0.5, transform: 'scale(1)' },
          '100%': { opacity: 1, transform: 'scale(1.2)' },
        }
      }}>
        {/* Animated Background Element */}
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '120%', 
          height: '120%',
          opacity: 0.4,
          background: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />

        <Box sx={{ my: 'auto', position: 'relative', zIndex: 1 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Logo size={42} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -1, color: alpha('#FFF', 0.9) }}>Analytica</Typography>
            </Box>
            
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: 'clamp(2.5rem, 5vw, 4.5rem)' }, 
              fontWeight: 900, 
              lineHeight: 1.2, 
              letterSpacing: -3,
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Infrastructure<br />Monitoring.
            </Typography>

            <Typography variant="h6" sx={{ color: alpha('#FFF', 0.4), maxWidth: 500, lineHeight: 1.6, fontWeight: 400 }}>
              Real-time insights for your distributed network. 
              Built for scale, designed for precision.
            </Typography>

            <Stack direction="row" spacing={6} sx={{ pt: 4 }}>
              <Box>
                <Globe size={20} color={alpha('#FFF', 0.2)} />
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: alpha('#FFF', 0.8) }}>Global</Typography>
                <Typography variant="caption" sx={{ color: alpha('#FFF', 0.3), fontWeight: 600 }}>Network Presence</Typography>
              </Box>
              <Box>
                <Zap size={20} color={alpha('#FFF', 0.2)} />
                <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: alpha('#FFF', 0.8) }}>Real-time</Typography>
                <Typography variant="caption" sx={{ color: alpha('#FFF', 0.3), fontWeight: 600 }}>Latencies & Logs</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ opacity: 0.2 }}>
          <Typography variant="caption" sx={{ letterSpacing: 2 }}>© 2026 ANALYTICA SYSTEMS</Typography>
        </Box>
      </Box>

      {/* Right Panel: Minimalist Form (40%) */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: { xs: 3, md: 8 },
        position: 'relative',
        zIndex: 2,
        bgcolor: '#000'
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, mb: 1 }}>Create Account</Typography>
            <Typography variant="body1" sx={{ color: alpha('#FFF', 0.4) }}>Join the fleet and start monitoring today.</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha('#FF3B30', 0.1), color: '#FF3B30', border: 'none' }}>
            {error}
          </Alert>}

          {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha('#34C759', 0.1), color: '#34C759', border: 'none' }}>
            Account ready! Redirecting...
          </Alert>}

          <Stack spacing={4}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Social entry failed')}
              width="100%"
              theme="filled_black"
              shape="rectangular"
              text="signup_with"
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Divider sx={{ flex: 1, borderColor: alpha('#FFF', 0.1) }} />
              <Typography variant="caption" sx={{ px: 2, color: alpha('#FFF', 0.2), fontWeight: 700 }}>OR EMAIL</Typography>
              <Divider sx={{ flex: 1, borderColor: alpha('#FFF', 0.1) }} />
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
                  sx={{ 
                    '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) },
                    '& .MuiInput-underline:hover:before': { borderColor: alpha('#FFF', 0.2) + ' !important' },
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
                    sx={{ '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) } }}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || success}
                    InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
                    sx={{ '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) } }}
                  />
                </Stack>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading || success}
                  endIcon={<ArrowRight size={20} />}
                  sx={{ 
                    height: 56, 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    bgcolor: '#007AFF', 
                    borderRadius: '12px',
                    mt: 2,
                    boxShadow: `0 8px 32px ${alpha('#007AFF', 0.3)}`,
                    '&:hover': { bgcolor: '#0062CC' }
                  }}
                >
                  {loading ? 'Initializing...' : 'Create Account'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: alpha('#FFF', 0.4) }}>
                Already registered?{' '}
                <Link component={RouterLink} to="/login" sx={{ color: '#007AFF', fontWeight: 700, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
