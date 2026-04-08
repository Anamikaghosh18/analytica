import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress, Alert, Stack, alpha
} from '@mui/material';
import { Plus, Trash2, ExternalLink, Activity, Info, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const MonitorChart = ({ data }) => (
  <Box sx={{ width: '100%', height: 40, mt: 1 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#007AFF" 
          strokeWidth={1.5} 
          dot={false} 
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Box>
);

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', method: 'GET' });

  const mockChartData = Array.from({ length: 15 }, (_, i) => ({ value: Math.floor(Math.random() * 20) + 10 }));

  const fetchMonitors = async () => {
    try {
      const response = await api.get('/monitors/');
      setMonitors(response.data);
    } catch (err) {
      setError('Connection disrupted. Please check session health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/monitors/', formData);
      setOpen(false);
      setFormData({ name: '', url: '', method: 'GET' });
      fetchMonitors();
    } catch (err) {
      alert('Node initialization error.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('IRREVERSIBLE: Delete node?')) {
      try {
        await api.delete(`/monitors/${id}`);
        fetchMonitors();
      } catch (err) {
        alert('Node deletion error.');
      }
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress thickness={3} size={40} sx={{ color: '#007AFF' }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 6, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h2" sx={{ mb: 0.5, fontWeight: 800 }}>Overview</Typography>
          <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.45), fontWeight: 500 }}>
            Monitoring {monitors.length} active fleet nodes.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 1.5, px: 3, height: 40, fontWeight: 700 }}
        >
          Add Node
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 1.5, bgcolor: alpha('#EB5757', 0.1), color: '#EB5757', border: 'none' }}>{error}</Alert>}

      {monitors.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', border: `0.5px solid ${alpha('#FFFFFF', 0.1)}`, borderRadius: 3, bgcolor: alpha('#FFFFFF', 0.02) }}>
          <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.4), mb: 2 }}>Null Fleet State</Typography>
          <Button variant="outlined" onClick={() => setOpen(true)}>Initialize First Node</Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {monitors.map((monitor) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={monitor.id}>
              <Card sx={{ p: 0.5 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 1.2, 
                      bgcolor: '#007AFF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha('#007AFF', 0.3)}`
                    }}>
                      <ActivityIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </Box>
                    <IconButton size="small" sx={{ color: alpha('#FFFFFF', 0.15) }}><ChevronRight size={18} /></IconButton>
                  </Box>
                  
                  <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.2 }}>{monitor.name}</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.35), fontWeight: 600, fontFamily: 'monospace', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', mb: 2 }}>
                    {monitor.url.replace('https://', '').replace('/', '')}
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: alpha('#FFFFFF', 0.03), borderRadius: 1.5, border: `0.5px solid ${alpha('#FFFFFF', 0.05)}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, color: alpha('#FFFFFF', 0.25) }}>LATENCY</Typography>
                      <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 800 }}>STABLE</Typography>
                    </Stack>
                    <MonitorChart data={mockChartData} />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="small" 
                      startIcon={<ExternalLink size={14} />} 
                      href={monitor.url} 
                      target="_blank"
                      sx={{ borderRadius: 1.2, height: 32, fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Audit
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error" 
                      sx={{ borderRadius: 1.2, border: `0.5px solid ${alpha('#EB5757', 0.1)}`, '&:hover': { bgcolor: alpha('#EB5757', 0.1) } }}
                      onClick={() => handleDelete(monitor.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pt: 3 }}>Initialize Node</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.35), mb: 3, display: 'block', fontWeight: 600 }}>Specify endpoint parameters</Typography>
          <TextField
            fullWidth
            label="Node Identity"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Auth Node"
          />
          <TextField
            fullWidth
            label="Target Interface (URL)"
            margin="normal"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://api.system.io"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700 }}>Dismiss</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ borderRadius: 1.2, px: 3, fontWeight: 700 }}>Initialize</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
