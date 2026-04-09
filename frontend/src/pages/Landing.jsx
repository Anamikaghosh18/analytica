import React, { useState } from 'react';
import { Box, Typography, Button, Container, Stack, alpha, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Activity, Bell, BarChart2, CheckCircle2, Search, Zap, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';
import Hero3D from '../components/Hero3D';
import api from '../services/api';

// ── Shared UI Components ──

const StatusBadge = () => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 1.5,
    px: 2, py: 0.75, borderRadius: 100,
    bgcolor: alpha('#FFFFFF', 0.03), border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
    mb: 4
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34C759', boxShadow: '0 0 10px #34C759' }} />
      <Typography sx={{ color: alpha('#FFFFFF', 0.8), fontWeight: 600, fontSize: '0.75rem' }}>
        All monitoring systems online
      </Typography>
    </Box>
  </Box>
);

const FeatureCard = ({ icon: Icon, title, desc, span = 1, visual }) => (
  <Box sx={{
    p: { xs: 3, md: 4 }, borderRadius: 4,
    gridColumn: { xs: 'span 1', md: `span ${span}` },
    bgcolor: alpha('#111111', 0.6), border: `1px solid ${alpha('#FFFFFF', 0.08)}`,
    transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden', minHeight: 280,
    '&:hover': {
      bgcolor: alpha('#1A1A1A', 0.8),
      transform: 'translateY(-2px)',
      boxShadow: `0 20px 40px ${alpha('#000000', 0.5)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.1)}`,
      borderColor: alpha('#FFFFFF', 0.15),
    }
  }}>
    {/* Inner subtle glow line */}
    <Box sx={{
      position: 'absolute', top: 0, left: '10%', width: '80%', height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    }} />

    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', zIndex: 1, position: 'relative' }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: alpha('#FFFFFF', 0.05), color: '#FFFFFF', mb: 3, border: `1px solid ${alpha('#FFFFFF', 0.1)}`
      }}>
        <Icon size={20} />
      </Box>
      <Box sx={{ mt: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1.5, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: alpha('#FFF', 0.5), lineHeight: 1.6, fontWeight: 500 }}>
          {desc}
        </Typography>
      </Box>
    </Box>

    {visual && (
      <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.8 }}>
        {visual}
      </Box>
    )}
  </Box>
);

const ServerLogMockup = () => (
  <Box sx={{
    position: 'relative', flex: 1.5, maxWidth: { xs: 700, md: 'none' }, borderRadius: 2, overflow: 'hidden',
    border: `1px solid ${alpha('#FFFFFF', 0.08)}`, bgcolor: '#0A0A0A', textAlign: 'left'
  }}>
    <Box sx={{
      display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 1,
      borderBottom: `1px solid ${alpha('#FFFFFF', 0.05)}`, bgcolor: alpha('#FFFFFF', 0.02)
    }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F56' }} />
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27C93F' }} />
      <Typography sx={{ ml: 2, fontSize: '0.7rem', color: alpha('#FFF', 0.3), fontFamily: '"JetBrains Mono", monospace' }}>
        backend/app.main
      </Typography>
    </Box>
    <Box sx={{ p: 4, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', lineHeight: 2.0 }}>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.8) }}>INFO:     Started server process [25868]</Typography>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.8) }}>INFO:     Waiting for application startup.</Typography>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.8) }}>INFO:     Background monitoring engine started...</Typography>
      <Typography component="div" sx={{ color: '#34C759' }}>INFO:     Application startup complete.</Typography>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.6), mt: 2 }}>[Engine] Checking https://api.example.com... <span style={{ color: '#34C759' }}>200 OK (112ms)</span></Typography>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.6) }}>[Engine] Checking https://my-service.app... <span style={{ color: '#34C759' }}>200 OK (85ms)</span></Typography>
      <Typography component="div" sx={{ color: alpha('#FFF', 0.6) }}>[WebSocket] Pushing live update to Dashboard client</Typography>
    </Box>
  </Box>
);

// ── Bento Visuals ──
const MiniChart = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 40 }}>
    {[30, 45, 20, 60, 50, 80, 45].map((val, i) => (
      <Box key={i} sx={{ width: 8, bgcolor: alpha('#34C759', 0.6), height: `${val}%`, borderRadius: '2px 2px 0 0' }} />
    ))}
  </Box>
);

const MiniCommand = () => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <Box sx={{ px: 1, py: 0.5, bgcolor: alpha('#FFF', 0.1), borderRadius: 1, border: `1px solid ${alpha('#FFF', 0.2)}`, fontSize: '0.7rem', fontWeight: 800 }}>⌘</Box>
    <Box sx={{ px: 1, py: 0.5, bgcolor: alpha('#FFF', 0.1), borderRadius: 1, border: `1px solid ${alpha('#FFF', 0.2)}`, fontSize: '0.7rem', fontWeight: 800 }}>K</Box>
  </Box>
);

const MiniStatus = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box sx={{ px: 2, py: 1, bgcolor: alpha('#34C759', 0.1), border: `1px solid ${alpha('#34C759', 0.2)}`, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34C759', boxShadow: '0 0 10px #34C759' }} />
      <Typography sx={{ color: '#34C759', fontSize: '0.65rem', fontWeight: 700 }}>api.stripe.com</Typography>
    </Box>
    <Box sx={{ px: 2, py: 1, bgcolor: alpha('#34C759', 0.1), border: `1px solid ${alpha('#34C759', 0.2)}`, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34C759', boxShadow: '0 0 10px #34C759' }} />
      <Typography sx={{ color: '#34C759', fontSize: '0.65rem', fontWeight: 700 }}>database-east</Typography>
    </Box>
  </Box>
);

// ── Main Layout ──

const Landing = () => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    
    setIsLoading(true);
    try {
      await api.post('/feedback/', { email: email || null, message });
      setFeedbackSent(true);
    } catch (err) {
      console.error(err);
      // Fallback to success visual anyway to not block user flow on landing page error
      setFeedbackSent(true); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#050505', color: '#FFFFFF', overflowX: 'hidden', position: 'relative', fontFamily: '"Inter", sans-serif'
    }}>
      {/* Global 3D Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: 0 }}>
        <Hero3D />
      </Box>

      {/* Top Navigation */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: `1px solid ${alpha('#FFFFFF', 0.05)}`, bgcolor: alpha('#050505', 0.8), backdropFilter: 'blur(20px)'
      }}>
        <Container maxWidth="xl" sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Logo size={24} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>Analytica</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/login" sx={{ color: alpha('#fff', 0.8), fontWeight: 600, fontSize: '0.85rem', textTransform: 'none' }}>
              Sign In
            </Button>
            <Button component={RouterLink} to="/register" variant="contained" sx={{
              bgcolor: '#FFFFFF', color: '#000000', fontWeight: 700, fontSize: '0.85rem', px: 2.5, py: 0.75, borderRadius: 100, textTransform: 'none', '&:hover': { bgcolor: alpha('#FFFFFF', 0.9) }
            }}>
              Register
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', zIndex: 1, pt: { xs: 14, md: 16 }, pb: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <StatusBadge />

          <Typography variant="h1" sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', mb: 3, color: '#FFFFFF'
          }}>
            Keep track of your APIs<br />in real-time.
          </Typography>

          <Typography sx={{
            color: alpha('#FFF', 0.5), fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 600, mx: 'auto', mb: 6, fontWeight: 400, lineHeight: 1.6
          }}>
            Analytica is a straightforward monitoring dashboard. Add your API endpoints, set an interval, and we will automatically ping them to track uptime and response times.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 10 }}>
            <Button component={RouterLink} to="/register" variant="contained" sx={{
              height: 48, px: 5, fontSize: '0.95rem', fontWeight: 700, bgcolor: '#FFFFFF', color: '#000000', borderRadius: 100,
              textTransform: 'none', '&:hover': { bgcolor: alpha('#FFFFFF', 0.9) },
              boxShadow: `0 0 30px ${alpha('#FFFFFF', 0.2)}`
            }}>
              Start Monitoring
            </Button>
          </Box>

          {/* Simple Terminal Output */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', mt: 8 }}>
            <ServerLogMockup />

            {/* Direct Dashboard Visual */}
            <Box sx={{
              flex: 1, maxWidth: 400, borderRadius: 2, overflow: 'hidden',
              border: `1px solid ${alpha('#FFFFFF', 0.08)}`, bgcolor: '#0A0A0A',
              display: { xs: 'none', md: 'flex' }, flexDirection: 'column', p: 3,
              boxShadow: `0 20px 40px ${alpha('#00ffc3', 0.05)}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Global Payments API</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34C759', boxShadow: '0 0 10px #34C759' }} />
                  <Typography sx={{ color: '#34C759', fontSize: '0.75rem', fontWeight: 600 }}>Operational</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography sx={{ color: alpha('#FFF', 0.4), fontSize: '0.7rem', textTransform: 'uppercase' }}>Uptime</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>100%</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: alpha('#FFF', 0.4), fontSize: '0.7rem', textTransform: 'uppercase' }}>Avg Latency</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>45ms</Typography>
                </Box>
              </Box>

              {/* Fake Bar Chart */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 60, mt: 'auto' }}>
                {[30, 45, 42, 60, 50, 48, 80, 45, 30, 40, 45, 55, 35].map((val, i) => (
                  <Box key={i} sx={{
                    flex: 1, bgcolor: alpha('#34C759', 0.5), height: `${val}%`, borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s ease', '&:hover': { bgcolor: '#34C759' }
                  }} />
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Actual Features */}
      <Box id="features" sx={{ py: 12, bgcolor: '#020202', borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, mb: 2 }}>
              What Analytica actually does
            </Typography>
            <Typography sx={{ color: alpha('#FFF', 0.5), fontSize: '1rem', maxWidth: 500, mx: 'auto' }}>
              No marketing buzzwords. Just the features you need to monitor if your websites and backend services are healthy.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <FeatureCard
              span={2} icon={Activity} title="Status Ping Checks"
              desc="We send HTTP requests to your URLs at your chosen intervals and record if they return a 200 OK or an error."
              visual={<MiniStatus />}
            />
            <FeatureCard
              span={1} icon={CheckCircle2} title="Uptime Tracking"
              desc="See your overall success rate to quickly tell if your services are having a bad day."
              visual={<Typography sx={{ fontSize: '3rem', fontWeight: 900, color: alpha('#34C759', 0.2), lineHeight: 1 }}>100<span style={{ fontSize: '1.5rem' }}>%</span></Typography>}
            />
            <FeatureCard
              span={1} icon={Search} title="Command Palette"
              desc="Press ⌘K anywhere in the app to quickly search your monitors and navigate around."
              visual={<MiniCommand />}
            />
            <FeatureCard
              span={2} icon={BarChart2} title="Response Time Charts"
              desc="Track how long your APIs take to respond over time. The dashboard graphs your average latencies simply and clearly."
              visual={<MiniChart />}
            />
            <FeatureCard
              span={2} icon={Zap} title="Live WebSockets"
              desc="The dashboard updates automatically without refreshing the page whenever a new ping finishes."
              visual={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#007AFF', boxShadow: '0 0 20px #007AFF', animation: 'pulse 2s infinite' }} />}
            />
            <FeatureCard
              span={1} icon={Bell} title="Email & Google Login"
              desc="Create an account your way. We support standard email/password or single-click Google Sign-In."
            />
          </Box>
        </Container>
      </Box>

      {/* How it Works / Steps */}
      <Box sx={{ py: 12, bgcolor: '#050505', borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, mb: 6, textAlign: 'center' }}>
            Getting started in 3 steps
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            {[
              { step: '01', title: 'Add your URL', desc: 'Enter the endpoint you want to monitor, like https://api.yourdomain.com.' },
              { step: '02', title: 'Set interval', desc: 'Choose how often we should check the endpoint (e.g. every 60 seconds).' },
              { step: '03', title: 'Watch it live', desc: 'Our engine instantly begins collecting latency metrics and tracking availability.' }
            ].map((item, i) => (
              <Box key={i} sx={{ position: 'relative', p: 4, borderRadius: 3, bgcolor: alpha('#FFFFFF', 0.02), border: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
                <Typography sx={{ position: 'absolute', top: 20, right: 20, fontSize: '3rem', fontWeight: 900, color: alpha('#FFFFFF', 0.05), lineHeight: 1 }}>{item.step}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ color: alpha('#FFF', 0.5), fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 12, bgcolor: '#020202', borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 800, mb: 6, textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { q: "How does the monitoring work?", a: "Analytica sets up a background engine on the server. It makes HTTP requests to your target endpoints at intervals you set, verifying the HTTP status codes and measuring response latency." },
              { q: "Is it really real-time?", a: "Yes. The dashboard establishes a secure WebSocket connection with the backend. Whenever a ping finishes, the database updates and the fresh latency metrics are immediately pushed to your browser without reloading." },
              { q: "Do I need to install an agent on my servers?", a: "No installation is required. We monitor your URLs externally via standard HTTP/HTTPS protocols, mimicking exactly what your real users would experience." },
              { q: "Can I monitor private / internal APIs?", a: "Because the monitoring engine runs from your backend server, any endpoint that your backend server can resolve on the local network can be monitored securely." }
            ].map((faq, i) => (
              <Accordion
                key={i}
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: 'transparent',
                  border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  transition: 'all 0.2s',
                  '&.Mui-expanded': { borderColor: alpha('#FFF', 0.2), bgcolor: alpha('#FFFFFF', 0.02) }
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown color={alpha('#FFFFFF', 0.5)} />} sx={{ py: 1, px: 3 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#FFF' }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography sx={{ color: alpha('#FFF', 0.6), lineHeight: 1.7 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Feedback Form */}
      <Box sx={{ py: 12, bgcolor: '#000000', borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
        <Container maxWidth="sm">
          <Typography variant="h3" sx={{ fontSize: '1.75rem', fontWeight: 700, mb: 1, textAlign: 'center', letterSpacing: '-0.02em' }}>
            Have feedback?
          </Typography>
          <Typography sx={{ color: alpha('#FFF', 0.5), mb: 5, textAlign: 'center', fontSize: '0.95rem' }}>
            We're actively building Analytica. Let us know what you want to see next.
          </Typography>

          {feedbackSent ? (
            <Box sx={{ p: 4, borderRadius: 2, bgcolor: alpha('#34C759', 0.05), border: `1px solid ${alpha('#34C759', 0.2)}`, textAlign: 'center' }}>
              <CheckCircle2 color="#34C759" size={32} style={{ marginBottom: 16 }} />
              <Typography sx={{ fontWeight: 600 }}>Thank you for your thoughts!</Typography>
              <Typography sx={{ color: alpha('#FFF', 0.5), fontSize: '0.9rem', mt: 1 }}>Our product team will review this shortly.</Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleFeedbackSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                fullWidth 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email (Optional)" 
                variant="outlined" 
                inputProps={{ style: { color: '#FFF', fontSize: '0.95rem', padding: '12px 16px' } }}
                sx={{ 
                  bgcolor: '#050505', 
                  '& fieldset': { borderColor: alpha('#FFFFFF', 0.1), transition: 'border-color 0.2s' },
                  '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
                  '& .Mui-focused fieldset': { borderColor: '#FFFFFF !important', borderWidth: '1px !important' },
                  borderRadius: 1
                }} 
              />
              <TextField 
                required
                fullWidth 
                multiline 
                rows={4} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what we can do better..." 
                variant="outlined" 
                inputProps={{ style: { color: '#FFF', fontSize: '0.95rem', padding: '12px 16px' } }}
                sx={{ 
                  bgcolor: '#050505', 
                  '& fieldset': { borderColor: alpha('#FFFFFF', 0.1), transition: 'border-color 0.2s' },
                  '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) },
                  '& .Mui-focused fieldset': { borderColor: '#FFFFFF !important', borderWidth: '1px !important' },
                  borderRadius: 1
                }} 
              />
              <Button type="submit" variant="contained" disabled={isLoading} sx={{
                height: 48, mt: 2, bgcolor: '#FFFFFF', color: '#000000', fontWeight: 600, textTransform: 'none',
                boxShadow: 'none', borderRadius: 1.5,
                '&:hover': { bgcolor: alpha('#FFFFFF', 0.9), boxShadow: 'none' },
                '&:disabled': { bgcolor: alpha('#FFFFFF', 0.2), color: alpha('#FFFFFF', 0.5) }
              }}>
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: '#000000' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Logo size={18} opacity={0.5} />
            <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.8rem', fontWeight: 500 }}>
              © {new Date().getFullYear()} Analytica. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
