import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, alpha, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Tooltip as MuiTooltip, Button, TextField,
  FormControl, Select, MenuItem, InputLabel, Portal, Chip
} from '@mui/material';
import { 
  BarChart3, PieChart, Shield, AlertCircle, 
  CheckCircle2, Clock, Globe, ArrowUpRight, ArrowDownRight,
  FileDown, RefreshCw, Activity, Zap, Cpu, History,
  Fingerprint, Calendar, Search, HelpCircle, X, ChevronLeft, ChevronRight,
  Navigation, Map, Layers, Radio
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie,
  AreaChart, Area
} from 'recharts';
import api from '../services/api';
import BentoCard from '../components/BentoCard';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [timeRange, setTimeRange] = useState('24h');

  const tourSteps = [
    { title: "Health Insights", content: "Deep data on your website's worldwide performance.", targetId: "tour-ana-header", position: "bottom" },
    { title: "Uptime Pulse", content: "Your global reliability index based on node consensus.", targetId: "tour-ana-dial", position: "right" },
    { title: "Node Network", content: "How each verify station is performing in real-time.", targetId: "tour-ana-nodes", position: "top" },
    { title: "Audit Trace", content: "A scollable forensics log for every request made.", targetId: "tour-ana-history", position: "top" }
  ];

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const responses = await Promise.all([
        api.get('/metrics/summary', { params: { time_range: timeRange } }),
        api.get('/metrics/timeseries', { params: { time_range: timeRange } }),
        api.get('/metrics/audit-log'),
        api.get('/nodes/')
      ]);
      setSummary(responses[0].data);
      setTimeseries(responses[1].data);
      setAuditLog(responses[2].data);
      setNodes(responses[3].data);
    } catch (err) { } finally { setLoading(false); setRefreshing(false); }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
    const tourSeen = localStorage.getItem('analytica_analytics_tour_seen');
    if (!tourSeen) { setTimeout(() => { setShowTour(true); }, 1500); }
  }, [fetchData]);

  useEffect(() => {
    if (showTour) {
      const target = document.getElementById(tourSteps[tourStep].targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const pos = tourSteps[tourStep].position;
        if (pos === 'bottom') setPopoverPos({ top: rect.bottom + 20, left: Math.max(20, rect.left + rect.width / 2 - 200) });
        else if (pos === 'right') setPopoverPos({ top: rect.top + rect.height / 2 - 100, left: rect.right + 20 });
        else setPopoverPos({ top: rect.top - 240, left: Math.max(20, rect.left + rect.width / 2 - 200) });
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showTour, tourStep]);

  const finishTour = () => { setShowTour(false); localStorage.setItem('analytica_analytics_tour_seen', 'true'); };

  const getDiagnosis = (log) => {
    if (log.success) return "Operational Success";
    return log.status_code ? `Server Error: ${log.status_code}` : "Request Timeout";
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress thickness={2} sx={{ color: '#007AFF' }} /></Box>;

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 4, py: 6, position: 'relative' }}>
      
      {/* 🟢 Original Header Alignment (Distortion-Free) */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box id="tour-ana-header">
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: -1.5, mb: 1 }}>System Health Insights</Typography>
              <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.9rem', fontWeight: 500 }}>Forensic infrastructure monitoring and node telemetry.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button onClick={() => { setShowTour(true); setTourStep(0); }} startIcon={<HelpCircle size={16} />} sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.75rem', fontWeight: 700 }}>Tour</Button>
            <Box id="tour-ana-toggles" sx={{ display: 'flex', gap: 1, bgcolor: alpha('#FFFFFF', 0.03), p: 0.5, borderRadius: 1.5, border: `1px solid ${alpha('#fff', 0.05)}` }}>
                {['1H', '24H', '7D', '30D'].map(label => (
                    <Button key={label} size="small" onClick={() => setTimeRange(label.toLowerCase())} sx={{ minWidth: 60, color: timeRange === label.toLowerCase() ? '#FFFFFF' : alpha('#FFFFFF', 0.2) }}>{label}</Button>
                ))}
            </Box>
            <IconButton onClick={() => fetchData()} sx={{ width: 42, height: 42, bgcolor: '#007AFF', color: '#FFFFFF', borderRadius: 1.5 }}><RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} /></IconButton>
          </Box>
      </Box>

      {/* 🟢 Original Masterpiece Grid Proportions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        
        {/* KPI: Uptime Dial */}
        <BentoCard id="tour-ana-dial" sx={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress variant="determinate" value={summary?.uptime_percentage || 0} size={180} thickness={2.5} sx={{ color: '#00ffc3' }} />
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                    <Typography sx={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 900 }}>{summary?.uptime_percentage}%</Typography>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' }}>Uptime Index</Typography>
                </Box>
            </Box>
        </BentoCard>

        {/* CHART: Trends */}
        <BentoCard sx={{ gridColumn: 'span 8', p: 4, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6), fontWeight: 800, mb: 3, display: 'block' }}>LATENCY HISTORY TRACKER</Typography>
            <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries}>
                      <CartesianGrid stroke={alpha('#FFFFFF', 0.03)} vertical={false} />
                      <XAxis dataKey="timestamp" tick={{ fill: alpha('#FFFFFF', 0.2), fontSize: 10 }} />
                      <YAxis tick={{ fill: alpha('#FFFFFF', 0.2), fontSize: 10 }} />
                      <ReTooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                      <Area type="monotone" dataKey="avg_latency" stroke="#007AFF" fill={alpha('#007AFF', 0.1)} strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </BentoCard>

        {/* NODE GRID: Worldwide Nodes */}
        <BentoCard id="tour-ana-nodes" sx={{ gridColumn: 'span 12', p: 4 }}>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6), fontWeight: 800, mb: 3, display: 'block' }}>GLOBAL VERIFICATION NETWORK</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2.5 }}>
                {nodes.map((node) => (
                    <Box key={node.id} sx={{ p: 2.5, bgcolor: alpha('#FFFFFF', 0.02), border: `1px solid ${alpha('#FFFFFF', 0.05)}`, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.95rem', mb: 0.5 }}>{node.name}</Typography>
                            <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.65rem' }}>{node.region.toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ width: 8, height: 8, bgcolor: '#00ffc3', borderRadius: '50%', boxShadow: '0 0 10px #00ffc3', animation: 'pulse 2s infinite' }} />
                    </Box>
                ))}
            </Box>
        </BentoCard>

        {/* 📋 THE SCROLLABLE FIX (NO DISTORTION) */}
        <BentoCard id="tour-ana-history" sx={{ gridColumn: 'span 12', p: 4, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6), fontWeight: 800 }}>AUDIT TRACE LOGS</Typography>
                <TextField size="small" placeholder="Find result..." value={logSearch} onChange={(e) => setLogSearch(e.target.value)} InputProps={{ startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.2 }} />, sx: { bgcolor: alpha('#FFFFFF', 0.02), borderRadius: 1.5, color: '#fff', fontSize: '0.8rem', width: 220 } }} />
            </Box>
            
            {/* Scrollable Container with Max Height so it doesn't distord the card if empty */}
            <TableContainer sx={{ flex: 1, maxHeight: 450, overflowY: 'auto', bgcolor: '#050505', borderRadius: 2, '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#fff', 0.05), borderRadius: 10 } }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { bgcolor: '#0A0A0A', color: alpha('#FFFFFF', 0.2), fontWeight: 800, fontSize: '0.65rem', borderBottom: `1px solid ${alpha('#fff', 0.05)}` } }}>
                            <TableCell>TIME</TableCell><TableCell>ENDPOINT</TableCell><TableCell>SPEED</TableCell><TableCell align="right">RESULT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditLog.filter(l => l.monitor_name?.toLowerCase().includes(logSearch.toLowerCase())).map((log) => (
                            <TableRow key={log.id} sx={{ '& td': { py: 1.5, borderBottom: `1px solid ${alpha('#FFFFFF', 0.03)}` } }}>
                                <TableCell sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                                <TableCell sx={{ color: '#FFFFFF', fontWeight: 800 }}>{log.monitor_name}</TableCell>
                                <TableCell sx={{ color: '#007AFF', fontWeight: 900 }}>{log.latency}ms</TableCell>
                                <TableCell align="right">
                                    <Chip label={log.success ? 'PASSED' : 'FAILED'} size="small" sx={{ bgcolor: alpha(log.success ? '#00ffc3' : '#FF375F', 0.1), color: log.success ? '#00ffc3' : '#FF375F', fontWeight: 900, fontSize: '0.6rem' }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </BentoCard>
      </Box>

      {/* Tour Overlay — Masterpiece UI */}
      {showTour && (
        <Portal>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: alpha('#000', 0.5), zIndex: 9998, pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', top: popoverPos.top, left: popoverPos.left, width: 400, zIndex: 9999 }}>
                <Box sx={{ bgcolor: '#0F0F0F', border: '1px solid #007AFF', borderRadius: 2, p: 3, boxShadow: '0 20px 80px rgba(0,0,0,1)' }}>
                    <IconButton onClick={finishTour} sx={{ position: 'absolute', top: 10, right: 10, color: alpha('#fff', 0.1) }}><X size={16} /></IconButton>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, mb: 1.5 }}>{tourSteps[tourStep].title}</Typography>
                    <Typography sx={{ color: alpha('#fff', 0.5), fontSize: '0.9rem' }}>{tourSteps[tourStep].content}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}><Button size="small" onClick={() => setTourStep(s => s - 1)} disabled={tourStep === 0} sx={{ color: alpha('#fff', 0.2) }}>Back</Button><Button onClick={tourStep === tourSteps.length -1 ? finishTour : () => setTourStep(s => s + 1)} variant="contained" sx={{ bgcolor: '#007AFF' }}>{tourStep === tourSteps.length -1 ? 'Finish' : 'Next'}</Button></Box>
                </Box>
            </Box>
        </Portal>
      )}
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </Box>
  );
};

export default Analytics;
