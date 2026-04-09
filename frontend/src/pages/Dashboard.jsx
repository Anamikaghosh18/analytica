import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  CircularProgress,
  IconButton,
  Button,
  Chip,
  Tooltip as MuiTooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  Snackbar, Alert as MuiAlert, Slide, Drawer, Switch, FormControlLabel,
  Portal,
  Stack
} from '@mui/material';
import { 
  Globe, Zap, Cpu, Server, Terminal, AlertTriangle, Activity, Clock, CheckCircle2,
  XCircle, Monitor, Search, Trash2, X, MapPin, RefreshCw, Plus, Wifi, WifiOff,
  Shield, HelpCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api';
import BentoCard from '../components/BentoCard';

// WebSocket connects via Vite proxy (/ws → ws://127.0.0.1:8000/ws) to avoid CORS
const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/telemetry`;

const StatusDot = ({ online }) => (
  <Box sx={{
    width: 10, height: 10, borderRadius: '50%',
    bgcolor: online ? '#00ffc3' : '#ff4b4b',
    boxShadow: online ? `0 0 15px ${online ? '#00ffc3' : '#ff4b4b'}` : 'none',
    animation: online ? 'pulse 2s ease-in-out infinite' : 'none',
    flexShrink: 0
  }} />
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedMonitors, setSelectedMonitors] = useState([]);
  const [monitorSearch, setMonitorSearch] = useState('');

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '', method: 'GET', check_interval_seconds: 60, headersText: '', is_public: false });

  const socketRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, timeRes, monRes, alertRes, nodeRes] = await Promise.all([
        api.get('/metrics/summary'),
        api.get('/metrics/timeseries'),
        api.get('/monitors/'),
        api.get('/alerts/'),
        api.get('/nodes/')
      ]);
      setSummary(sumRes.data);
      setMonitors(monRes.data);
      setAlerts(alertRes.data);
      setNodes(nodeRes.data);
      
      const initialTimeseries = timeRes.data.map(p => {
        const point = { timestamp: p.timestamp };
        monRes.data.forEach(m => { point[`m_${m.id}`] = p.avg_latency; });
        return point;
      });
      setTimeseries(initialTimeseries);
      if (monRes.data.length > 0 && selectedMonitors.length === 0) {
        setSelectedMonitors(monRes.data.slice(0, 5).map(m => m.id));
      }
    } catch (err) { } finally { setLoading(false); setRefreshing(false); }
  }, [selectedMonitors.length]);

  useEffect(() => {
    fetchData();
    const tourSeen = localStorage.getItem('analytica_tour_seen');
    if (!tourSeen) { setTimeout(() => { setShowTour(true); }, 1500); }

    let isMounted = true;
    const connectWS = () => {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;
      socket.onopen = () => { if (isMounted) setWsConnected(true); };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry') {
            setTelemetryLogs(prev => [data, ...prev].slice(0, 30));
            if (data.success && data.response_time_ms) {
              setTimeseries(prev => {
                const timeStr = data.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const monitorKey = `m_${data.monitor_id}`;
                const lastIdx = prev.length - 1;
                if (lastIdx >= 0 && prev[lastIdx].timestamp === timeStr) {
                  const newArr = [...prev]; newArr[lastIdx] = { ...newArr[lastIdx], [monitorKey]: data.response_time_ms }; return newArr;
                } else {
                  return [...prev.slice(-29), { timestamp: timeStr, [monitorKey]: data.response_time_ms }];
                }
              });
            }
          }
        } catch (e) { }
      };
      socket.onclose = () => { if (isMounted) { setWsConnected(false); setTimeout(connectWS, 5000); } };
    };
    connectWS();
    return () => { isMounted = false; if (socketRef.current) socketRef.current.close(); };
  }, []);

  const tourSteps = [
    { title: "Control Center", content: "Key health stats for your entire system.", targetId: "tour-header", position: "bottom" },
    { title: "Speed Pulse", content: "Real-time performance trends. Lower lines are faster!", targetId: "tour-chart", position: "top" },
    { title: "Active Sites List", content: "Compare different websites instantly in the chart above.", targetId: "tour-inventory", position: "top" },
    { title: "Live Activity Feed", content: "See exactly what our nodes are seeing, second by second.", targetId: "tour-feed", position: "top" },
    { title: "New Website", content: "Monitoring a new URL takes less than 10 seconds.", targetId: "tour-add-button", position: "bottom" }
  ];

  useEffect(() => {
    if (showTour) {
      const target = document.getElementById(tourSteps[tourStep].targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const pos = tourSteps[tourStep].position;
        if (pos === 'bottom') setPopoverPos({ top: rect.bottom + 20, left: Math.max(20, rect.left + rect.width / 2 - 200) });
        else setPopoverPos({ top: rect.top - 260, left: Math.max(20, rect.left + rect.width / 2 - 200) });
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showTour, tourStep]);

  const handleMonitorSubmit = async () => {
    try {
      const res = await api.post('/monitors/', { ...newMonitor, headers: newMonitor.headersText ? JSON.parse(newMonitor.headersText) : null });
      setShowMonitorModal(false);
      setSnackbar({ open: true, message: `"${newMonitor.name}" is now being monitored!`, severity: 'success' });
      fetchData();
    } catch (err) { }
  };

  const finishTour = () => { setShowTour(false); localStorage.setItem('analytica_tour_seen', 'true'); };

  const handleDeleteMonitor = async (id, name) => {
    try {
      await api.delete(`/monitors/${id}`);
      setSnackbar({ open: true, message: `Stopped monitoring "${name}"`, severity: 'info' });
      fetchData();
    } catch (err) {}
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress thickness={2} sx={{ color: '#007AFF' }} /></Box>;

  const activeAlerts = alerts.filter(a => !a.resolved);
  const filteredMonitors = monitors.filter(m => m.name.toLowerCase().includes(monitorSearch.toLowerCase()) || m.url.toLowerCase().includes(monitorSearch.toLowerCase()));

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 4, py: 6, position: 'relative' }}>

      {/* Header — Perfection Restored */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
        <Box id="tour-header">
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -2, color: '#FFFFFF', mb: 1, lineHeight: 1 }}>Control Center</Typography>
            <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.25), fontWeight: 600 }}>Real-time telemetry and global service status.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button onClick={() => { setShowTour(true); setTourStep(0); }} startIcon={<HelpCircle size={16} />} sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.75rem', fontWeight: 800 }}>Guide</Button>
            <Button variant="outlined" onClick={() => setShowInventoryDrawer(true)} startIcon={<Globe size={18} />} sx={{ color: '#FFFFFF', borderColor: alpha('#007AFF', 0.3), height: 48, borderRadius: 1.5, px: 3, fontWeight: 900, textTransform: 'none' }}>Inventory</Button>
            <Button id="tour-add-button" variant="contained" onClick={() => setShowMonitorModal(true)} startIcon={<Plus size={20} />} sx={{ bgcolor: '#007AFF', height: 48, borderRadius: 1.5, px: 4, fontWeight: 900, textTransform: 'none' }}>Watch New Site</Button>
            <IconButton onClick={() => { setRefreshing(true); fetchData(); }} sx={{ border: `1px solid ${alpha('#FFFFFF', 0.1)}`, width: 48, height: 48, borderRadius: 1.5 }}><RefreshCw size={20} color="#fff" className={refreshing ? 'animate-spin' : ''} /></IconButton>
        </Box>
      </Box>

      {/* KPI Cluster — 4x1 Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 4 }}>
        {[
          { label: 'Site Issues', value: activeAlerts.length, info: 'Unresolved incidents', icon: <AlertTriangle size={18} />, color: activeAlerts.length > 0 ? '#FF375f' : alpha('#fff', 0.1) },
          { label: 'Check Points', value: nodes.length, info: 'Monitoring regions', icon: <MapPin size={18} />, color: '#007AFF' },
          { label: 'Telemetry', value: wsConnected ? 'LIVE' : 'OFF', info: wsConnected ? 'Synced with stream' : 'Link inactive', icon: <Activity size={18} />, color: wsConnected ? '#00ffc3' : '#FF375F' },
          { label: 'Watched Sites', value: monitors.length, info: 'Total inventory', icon: <Globe size={18} />, color: '#BF5AF2' },
        ].map((kpi) => (
          <BentoCard key={kpi.label} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
              <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>{kpi.label}</Typography>
            </Box>
            <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 900, lineHeight: 1, mb: 1 }}>{kpi.value}</Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.15), fontWeight: 600 }}>{kpi.info}</Typography>
          </BentoCard>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <BentoCard id="tour-chart" sx={{ gridColumn: 'span 12', p: 4, minHeight: 450, minWidth: 0 }}>
             <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box><Typography sx={{ color: alpha('#FFFFFF', 0.3), fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', mb: 1, letterSpacing: 2 }}>latency tracking</Typography><Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 900 }}>Global Speed Pulse</Typography></Box>
                <Box sx={{ textAlign: 'right' }}><Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.65rem', fontWeight: 900 }}>AVERAGE RESPONSE</Typography><Typography variant="h4" sx={{ color: '#007AFF', fontWeight: 900 }}>{summary?.avg_latency_ms || 0}<span style={{ fontSize: '1rem', opacity: 0.4 }}>ms</span></Typography></Box>
             </Box>
             <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#FFFFFF', 0.03)} vertical={false} />
                        <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fill: alpha('#FFFFFF', 0.15), fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: alpha('#FFFFFF', 0.15), fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #111' }} />
                        <Legend verticalAlign="top" align="right" />
                        {selectedMonitors.map((id, idx) => {
                            const m = monitors.find(x => x.id === id);
                            const color = ['#007AFF', '#BF5AF2', '#00ffc3', '#FF9F0A', '#FF375F'][idx % 5];
                            return <Area key={id} type="monotone" dataKey={`m_${id}`} name={m?.name || 'Service'} stroke={color} fill={alpha(color, 0.05)} strokeWidth={3} dot={false} />;
                        })}
                    </AreaChart>
                </ResponsiveContainer>
             </Box>
        </BentoCard>

        {/* 📋 THE SCROLLABLE FIX (NO DISTORTION) */}
        <BentoCard id="tour-feed" sx={{ gridColumn: 'span 12', p: 4, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}><Terminal size={20} color="#BF5AF2" /><Typography sx={{ color: alpha('#FFFFFF', 0.8), fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2 }}>Live Diagnostic Feed</Typography></Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#050505', borderRadius: 2, border: `1px solid ${alpha('#fff', 0.03)}`, fontFamily: '"JetBrains Mono", monospace', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#fff', 0.05), borderRadius: 10 } }}>
                 {telemetryLogs.map((log, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 3, mb: 1, opacity: Math.max(0.1, 1 - i * 0.05) }}>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.1), minWidth: 80 }}>[{new Date().toLocaleTimeString()}]</Typography>
                        <Typography variant="caption" sx={{ color: '#BF5AF2', fontWeight: 800 }}>{log.monitor_name}</Typography>
                        <Typography variant="caption" sx={{ color: log.success ? '#00ffc3' : '#ff375f', fontWeight: 800 }}>{log.success ? 'PASSED' : 'DENIED'} · {log.response_time_ms}ms</Typography>
                    </Box>
                 ))}
            </Box>
        </BentoCard>
      </Box>

      {/* ── Watch New Site Modal ── */}
      <Dialog open={showMonitorModal} onClose={() => setShowMonitorModal(false)} PaperProps={{ sx: { bgcolor: '#0F0F0F', backgroundImage: 'none', border: `1px solid ${alpha('#FFFFFF', 0.1)}`, borderRadius: 2, minWidth: 450 } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 900 }}>Watch New Infrastructure</DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField fullWidth label="Service Name" placeholder="e.g. Primary API" value={newMonitor.name} onChange={e => setNewMonitor({...newMonitor, name: e.target.value})} variant="outlined" />
                <TextField fullWidth label="Target URL" placeholder="https://api.example.com" value={newMonitor.url} onChange={e => setNewMonitor({...newMonitor, url: e.target.value})} variant="outlined" />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth><InputLabel>Method</InputLabel><Select value={newMonitor.method} label="Method" onChange={e => setNewMonitor({...newMonitor, method: e.target.value})}><MenuItem value="GET">GET</MenuItem><MenuItem value="POST">POST</MenuItem></Select></FormControl>
                    <TextField fullWidth label="Interval (s)" type="number" value={newMonitor.check_interval_seconds} onChange={e => setNewMonitor({...newMonitor, check_interval_seconds: parseInt(e.target.value)})} />
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowMonitorModal(false)} sx={{ color: alpha('#fff', 0.2) }}>Cancel</Button>
            <Button onClick={handleMonitorSubmit} variant="contained" sx={{ bgcolor: '#007AFF', fontWeight: 900 }}>Initialize Monitor</Button>
        </DialogActions>
      </Dialog>

      {/* ── Inventory Drawer ── */}
      <Drawer anchor="right" open={showInventoryDrawer} onClose={() => setShowInventoryDrawer(false)} PaperProps={{ sx: { width: 500, bgcolor: '#0A0A0A', borderLeft: `1px solid ${alpha('#fff', 0.05)}`, backgroundImage: 'none' } }}>
        <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>Site Inventory</Typography>
                <IconButton onClick={() => setShowInventoryDrawer(false)} sx={{ color: alpha('#fff', 0.2) }}><X size={20} /></IconButton>
            </Box>
            <TextField fullWidth placeholder="Search inventory..." value={monitorSearch} onChange={e => setMonitorSearch(e.target.value)} slotProps={{ input: { startAdornment: <Search size={18} style={{ marginRight: 12, opacity: 0.2 }} />, sx: { bgcolor: alpha('#fff', 0.02), borderRadius: 2, mb: 4 } } }} />
            
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredMonitors.map(m => (
                    <Box key={m.id} sx={{ p: 2, bgcolor: alpha('#fff', 0.02), border: `1px solid ${alpha('#fff', 0.05)}`, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                            <Switch checked={selectedMonitors.includes(m.id)} onChange={() => setSelectedMonitors(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', noWrap: true }}>{m.name}</Typography>
                                <Typography sx={{ color: alpha('#fff', 0.2), fontSize: '0.7rem', noWrap: true }}>{m.url}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => handleDeleteMonitor(m.id, m.name)} size="small" sx={{ color: alpha('#ff375f', 0.4), '&:hover': { color: '#ff375f' } }}><Trash2 size={16} /></IconButton>
                    </Box>
                ))}
            </Box>
        </Box>
      </Drawer>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert severity={snackbar.severity} sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}>{snackbar.message}</MuiAlert>
      </Snackbar>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </Box>
  );
};

export default Dashboard;
