import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress, Alert 
} from '@mui/material';
import { Plus, Trash2, ExternalLink, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', method: 'GET' });

  const fetchMonitors = async () => {
    try {
      const response = await api.get('/monitors/');
      setMonitors(response.data);
    } catch (err) {
      setError('Failed to fetch monitors');
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
      alert('Failed to create monitor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this monitor?')) {
      try {
        await api.delete(`/monitors/${id}`);
        fetchMonitors();
      } catch (err) {
        alert('Failed to delete monitor');
      }
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your API endpoints and monitoring status
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />} 
          onClick={() => setOpen(true)}
        >
          Add Monitor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {monitors.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary">No monitors found. Start by adding one!</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {monitors.map((monitor) => (
            <Grid item xs={12} sm={6} md={4} key={monitor.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{monitor.name}</Typography>
                    <Chip size="small" label={monitor.method} color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {monitor.url}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button 
                      size="small" 
                      startIcon={<ExternalLink size={14} />} 
                      href={monitor.url} 
                      target="_blank"
                    >
                      Visit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<Trash2 size={14} />} 
                      onClick={() => handleDelete(monitor.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Monitor Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Monitor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Production API"
          />
          <TextField
            fullWidth
            label="URL"
            margin="normal"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://api.example.com/health"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create Monitor</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
