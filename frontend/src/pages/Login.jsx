import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, Stack, alpha, Divider } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Social access failed');
    } finally {
      setLoading(false);
    }
  };

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
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Social entry failed')}
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
                  InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
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
                  InputProps={{ sx: { fontSize: '1.1rem', py: 1, color: '#FFF' } }}
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
