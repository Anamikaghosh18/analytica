import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, Stack, alpha, Divider } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { ShieldCheck, User, ArrowRight, Activity, Cpu, Shield } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      await googleLogin(tokenResponse.access_token);
      navigate('/');
    } catch (err) {
      setError('Social access failed');
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Social entry failed'),
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      height: '100vh',
      bgcolor: 'transparent',
      color: '#FFFFFF',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Global Studio Effects */}
      <div className="studio-noise" />
      <div className="studio-glow" />

      {/* Left Panel: Visual Identity (60%) */}
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
        borderRight: `1px solid ${alpha('#FFFFFF', 0.08)}`,
        background: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '140%', 
          height: '140%',
          opacity: 0.2,
          background: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <Box sx={{ my: 'auto', position: 'relative', zIndex: 1 }}>
          <Stack spacing={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Logo size={48} />
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -2, color: '#FFFFFF' }}>Analytica</Typography>
            </Box>
            
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: 'clamp(2rem, 4vw, 3rem)' }, 
              fontWeight: 900, 
              lineHeight: 1.1, 
              letterSpacing: -3,
              background: 'linear-gradient(180deg, #FFFFFF 30%, rgba(255,255,255,0.1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Re-establish<br />Command Link.
            </Typography>

            <Typography variant="body1" sx={{ color: alpha('#FFF', 0.4), maxWidth: 400, fontWeight: 500, lineHeight: 1.5, letterSpacing: -0.1 }}>
              Secure authentication layer for distributed infrastructure nodes. 
              Verified military-grade monitoring protocols active.
            </Typography>

            <Stack direction="row" spacing={8} sx={{ pt: 6 }}>
              <Box>
                <Cpu size={24} color="#007AFF" />
                <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>Clinical</Typography>
                <Typography variant="caption" sx={{ color: alpha('#FFF', 0.3), fontWeight: 700, letterSpacing: 1 }}>TELEMETRY HUB</Typography>
              </Box>
              <Box>
                <Shield size={24} color="#00ffc3" />
                <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>Encrypted</Typography>
                <Typography variant="caption" sx={{ color: alpha('#FFF', 0.3), fontWeight: 700, letterSpacing: 1 }}>AES-512 TUNNEL</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ opacity: 0.15 }}>
          <Typography variant="caption" sx={{ letterSpacing: 3, fontWeight: 900 }}>ANALYTICA STUDIO — v4.0 CORE</Typography>
        </Box>
      </Box>

      {/* Right Panel: Login Form (40%) */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: { xs: 3, md: 8 },
        bgcolor: 'transparent',
        position: 'relative'
      }}>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1 }}>Sign In</Typography>
            <Typography variant="body2" sx={{ color: alpha('#FFF', 0.4), fontWeight: 600 }}>Authenticate to access your dashboard.</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: alpha('#FF3B30', 0.1), color: '#FF3B30', border: 'none' }}>
            {error}
          </Alert>}

          <Stack spacing={4}>
            <Button
              fullWidth
              onClick={() => googleSignIn()}
              disabled={loading}
              variant="outlined"
              startIcon={
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
              sx={{
                borderColor: alpha('#FFF', 0.1),
                color: '#fff',
                height: 44,
                borderRadius: 1,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': { borderColor: alpha('#FFF', 0.3), bgcolor: alpha('#fff', 0.04) },
                '&:disabled': { opacity: 0.4 }
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Divider sx={{ flex: 1, borderColor: alpha('#FFF', 0.1) }} />
              <Typography variant="caption" sx={{ px: 2, color: alpha('#FFF', 0.2), fontWeight: 700 }}>OR EMAIL</Typography>
              <Divider sx={{ flex: 1, borderColor: alpha('#FFF', 0.1) }} />
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  slotProps={{ input: { sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } } }}
                  sx={{ 
                    '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) },
                    '& .MuiInput-underline:hover:before': { borderColor: alpha('#FFF', 0.2) + ' !important' },
                  }}
                />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  slotProps={{ input: { sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } } }}
                  sx={{ 
                    '& .MuiInput-underline:before': { borderColor: alpha('#FFF', 0.1) },
                    '& .MuiInput-underline:hover:before': { borderColor: alpha('#FFF', 0.2) + ' !important' },
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={<ArrowRight size={20} />}
                  sx={{ 
                    height: 56, 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    bgcolor: '#007AFF', 
                    borderRadius: 0.5, 
                    mt: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0062CC' }
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: alpha('#FFF', 0.4) }}>
                New to the platform?{' '}
                <Link component={RouterLink} to="/register" sx={{ color: '#007AFF', fontWeight: 700, textDecoration: 'none' }}>
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
