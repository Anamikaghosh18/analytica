import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  CircularProgress,
  IconButton,
  Button,
  Chip,
  Tooltip as MuiTooltip
} from '@mui/material';
import { 
  Globe,
  Zap,
  Cpu,
  Server,
  Terminal,
  AlertTriangle,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Monitor,
  Search,
  Trash2,
  X,
  MapPin,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  Shield
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  Snackbar, Alert as MuiAlert, Slide, Drawer
} from '@mui/material';
import api from '../services/api';
import BentoCard from '../components/BentoCard';

const WS_URL = 'ws://127.0.0.1:8000/ws/telemetry';

const StatusDot = ({ online }) => (
  <Box sx={{
    width: 8, height: 8, borderRadius: '50%',
    bgcolor: online ? '#00ffc3' : '#ff4b4b',
    boxShadow: online ? '0 0 8px #00ffc3' : '0 0 8px #ff4b4b',
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

  // Modals
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);
  
  // Feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [newMonitor, setNewMonitor] = useState({ name: '', url: '', method: 'GET', check_interval_seconds: 60 });
  const [newNode, setNewNode] = useState({ name: '', region: 'us-east-1', provider: 'AWS' });

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
      
      // Transform historical data: Map global average to each monitor for initial context
      const initialTimeseries = timeRes.data.map(p => {
        const point = { timestamp: p.timestamp };
        monRes.data.forEach(m => {
          point[`m_${m.id}`] = p.avg_latency;
        });
        return point;
      });
      setTimeseries(initialTimeseries);
      
      // Auto-select first few monitors if none selected
      if (monRes.data.length > 0 && selectedMonitors.length === 0) {
        setSelectedMonitors(monRes.data.slice(0, 3).map(m => m.id));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    let isMounted = true;
    let reconnectTimer = null;
    let initTimer = null;

    const connectWS = () => {
      if (!isMounted) return;
      if (socketRef.current && socketRef.current.readyState < 2) {
        socketRef.current.close();
      }

      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => { if (isMounted) setWsConnected(true); };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry') {
            setTelemetryLogs(prev => [data, ...prev].slice(0, 20));
            if (data.success && data.response_time_ms) {
              setTimeseries(prev => {
                const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const lastIdx = prev.length - 1;
                const monitorKey = `m_${data.monitor_id}`;
                
                if (lastIdx >= 0 && prev[lastIdx].timestamp === timeStr) {
                  const newArr = [...prev];
                  newArr[lastIdx] = { ...newArr[lastIdx], [monitorKey]: data.response_time_ms };
                  return newArr;
                } else {
                  const newPoint = { timestamp: timeStr, [monitorKey]: data.response_time_ms };
                  return [...prev.slice(-14), newPoint];
                }
              });
            }
          }
        } catch (e) { /* ignore */ }
      };

      socket.onclose = (e) => {
        if (isMounted) {
          setWsConnected(false);
          if (e.code !== 1000) reconnectTimer = setTimeout(connectWS, 5000);
        }
      };

      socket.onerror = () => {
        if (isMounted) setWsConnected(false);
      };
    };

    initTimer = setTimeout(connectWS, 0);

    return () => {
      isMounted = false;
      if (initTimer) clearTimeout(initTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close(1000, 'unmounted');
      }
    };
  }, []);

  const handleNodeSubmit = async () => {
    if (!newNode.name.trim()) return;
    try {
      await api.post('/nodes/', newNode);
      setShowNodeModal(false);
      setNewNode({ name: '', region: 'us-east-1', provider: 'AWS' });
      setSnackbar({ open: true, message: `Node "${newNode.name}" registered in ${newNode.region}`, severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Node registration failed.', severity: 'error' });
    }
  };

  const handleMonitorSubmit = async () => {
    if (!newMonitor.name.trim() || !newMonitor.url.trim()) return;
    try {
      await api.post('/monitors/', newMonitor);
      setShowMonitorModal(false);
      setNewMonitor({ name: '', url: '', method: 'GET', check_interval_seconds: 60 });
      setSnackbar({ open: true, message: `Monitor "${newMonitor.name}" is now active`, severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create monitor.', severity: 'error' });
    }
  };

  const handleDeleteMonitor = async (id, name) => {
    try {
      await api.delete(`/monitors/${id}`);
      setSnackbar({ open: true, message: `Monitor "${name}" removed`, severity: 'info' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/resolve`);
      setSnackbar({ open: true, message: 'Alert acknowledged', severity: 'success' });
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to resolve alert.', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress sx={{ color: '#007AFF' }} thickness={2} size={40} />
        <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.8rem', fontWeight: 600 }}>
          Initializing telemetry...
        </Typography>
      </Box>
    );
  }

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <Box sx={{ maxWidth: 1600, margin: '0 auto', position: 'relative' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1.5, color: '#FFFFFF' }}>
              Control Center
            </Typography>
            <Box sx={{ px: 1.2, py: 0.3, bgcolor: alpha('#007AFF', 0.1), border: `1px solid ${alpha('#007AFF', 0.2)}`, borderRadius: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 800, letterSpacing: 1, fontSize: '0.625rem' }}>
                LIVE
              </Typography>
            </Box>
            {/* WS status badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.2, py: 0.3, bgcolor: alpha(wsConnected ? '#00ffc3' : '#ff4b4b', 0.08), border: `1px solid ${alpha(wsConnected ? '#00ffc3' : '#ff4b4b', 0.2)}`, borderRadius: 0.5 }}>
              {wsConnected ? <Wifi size={11} color="#00ffc3" /> : <WifiOff size={11} color="#ff4b4b" />}
              <Typography variant="caption" sx={{ color: wsConnected ? '#00ffc3' : '#ff4b4b', fontWeight: 800, fontSize: '0.6rem', letterSpacing: 0.5 }}>
                {wsConnected ? 'STREAM ACTIVE' : 'RECONNECTING'}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.35), fontWeight: 500 }}>
            Real-time API monitoring · {monitors.length} endpoints tracked · {nodes.length} node{nodes.length !== 1 ? 's' : ''} active
          </Typography>
        </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <MuiTooltip title="Configure visible endpoints">
              <Button
                variant="outlined"
                onClick={() => setShowInventoryDrawer(true)}
                startIcon={<Globe size={16} />}
                sx={{ 
                  color: '#FFFFFF', 
                  borderColor: alpha('#007AFF', 0.4), 
                  bgcolor: alpha('#007AFF', 0.05),
                  borderRadius: 0.5, px: 2, py: 0.75, fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', 
                  '&:hover': { borderColor: '#007AFF', bgcolor: alpha('#007AFF', 0.1) } 
                }}
              >
                Endpoints {selectedMonitors.length > 0 && `(${selectedMonitors.length})`}
              </Button>
            </MuiTooltip>
            <MuiTooltip title="Refresh data">
              <IconButton
                onClick={() => { setRefreshing(true); fetchData(); }}
                sx={{ width: 38, height: 38, bgcolor: alpha('#FFFFFF', 0.03), color: '#FFFFFF', borderRadius: 0.5, border: `1px solid ${alpha('#FFFFFF', 0.08)}`, '&:hover': { bgcolor: alpha('#FFFFFF', 0.08) } }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </IconButton>
            </MuiTooltip>
            <Button
              variant="contained"
              onClick={() => setShowNodeModal(true)}
              startIcon={<Server size={16} />}
              sx={{ bgcolor: '#007AFF', color: '#FFFFFF', borderRadius: 0.5, px: 2.5, py: 0.75, fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#0066D6' } }}
            >
              Add Node
            </Button>
          </Box>
      </Box>

      {/* ── KPI Row ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: 'Total Monitors', value: summary?.total_monitors ?? 0, sub: `${summary?.active_monitors ?? 0} active`, icon: <Globe size={16} />, color: '#007AFF' },
          { label: 'Avg Latency', value: summary?.avg_latency_ms != null ? `${summary.avg_latency_ms}ms` : '--', sub: 'across all endpoints', icon: <Clock size={16} />, color: '#FF9F0A' },
          { label: 'Uptime', value: summary?.uptime_percentage != null ? `${summary.uptime_percentage}%` : '--', sub: 'all-time success rate', icon: <Zap size={16} />, color: '#00ffc3' },
          { label: 'Active Alerts', value: activeAlerts.length, sub: activeAlerts.length === 0 ? 'all systems nominal' : 'require attention', icon: <AlertTriangle size={16} />, color: activeAlerts.length > 0 ? '#FFD60A' : '#00ffc3' },
        ].map((kpi) => (
          <BentoCard key={kpi.label} sx={{ py: 2.5, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
              <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                {kpi.label}
              </Typography>
            </Box>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.75rem', letterSpacing: -1, lineHeight: 1 }}>
              {kpi.value}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.25), fontWeight: 600 }}>
              {kpi.sub}
            </Typography>
          </BentoCard>
        ))}
      </Box>

      {/* ── Main Grid ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>

        {/* Latency Chart — EXPANDED */}
        <BentoCard sx={{ gridColumn: 'span 12', minHeight: 400 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Activity size={16} color="#007AFF" />
                <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Latency Telemetry
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 800, letterSpacing: -0.5 }}>
                Global Response Times
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.5rem', letterSpacing: -1 }}>
                {selectedMonitors.length}
                <span style={{ fontSize: '0.85rem', opacity: 0.3, marginLeft: '4px' }}>active in chart</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#00ffc3', fontWeight: 800, fontSize: '0.6rem' }}>
                {wsConnected ? 'LIVE STREAM' : 'OFFLINE'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: 220, width: '100%' }}>
            {timeseries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeseries}>
                  <defs>
                    {[0,1,2,3,4].map(i => (
                      <linearGradient key={i} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={['#007AFF', '#BF5AF2', '#00ffc3', '#FF9F0A', '#FF375F'][i]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={['#007AFF', '#BF5AF2', '#00ffc3', '#FF9F0A', '#FF375F'][i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#FFFFFF', 0.04)} vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: alpha('#FFFFFF', 0.25), fontSize: 10, fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: alpha('#FFFFFF', 0.25), fontSize: 10, fontWeight: 600 }}
                    width={40}
                    tickFormatter={(v) => `${v}ms`}
                  />
                  <Tooltip
                    cursor={{ stroke: alpha('#FFFFFF', 0.08), strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#0F0F0F', border: `1px solid ${alpha('#FFFFFF', 0.1)}`, borderRadius: 8, padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 700, padding: '2px 0' }}
                    labelStyle={{ color: alpha('#FFFFFF', 0.4), fontSize: '10px', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase' }}
                    formatter={(value) => [`${value}ms`, 'Latency']}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span style={{ color: alpha('#FFFFFF', 0.6), fontSize: '11px', fontWeight: 700 }}>{value}</span>}
                  />
                  {selectedMonitors.map((id, idx) => {
                    const monitor = monitors.find(m => m.id === id);
                    const color = ['#007AFF', '#BF5AF2', '#00ffc3', '#FF9F0A', '#FF375F'][idx % 5];
                    return (
                      <Area 
                        key={id}
                        type="monotone" 
                        dataKey={`m_${id}`} 
                        name={monitor?.name || `Monitor ${id}`}
                        stroke={color} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill={`url(#grad_${idx % 5})`} 
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Activity size={28} color={alpha('#FFFFFF', 0.1)} />
                <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.8rem' }}>
                  {monitors.length === 0 ? 'Add a monitor to start collecting data' : 'Waiting for first check results...'}
                </Typography>
              </Box>
            )}
          </Box>
        </BentoCard>

        {/* System Health */}
        <BentoCard sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, minHeight: 360 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Shield size={16} color="#00ffc3" />
            <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              System Health
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '3rem', letterSpacing: -2, lineHeight: 1 }}>
              {summary?.uptime_percentage ?? '--'}
            </Typography>
            {summary?.uptime_percentage != null && (
              <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontWeight: 700, fontSize: '1.2rem' }}>%</Typography>
            )}
          </Box>
          <Typography variant="caption" sx={{ color: '#00ffc3', fontWeight: 800, fontSize: '0.6rem', letterSpacing: 1 }}>
            AVAILABILITY RATE
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700 }}>Total checks</Typography>
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 800 }}>—</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700 }}>Monitors tracked</Typography>
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 800 }}>{summary?.active_monitors ?? 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700 }}>Active alerts</Typography>
              <Typography variant="caption" sx={{ color: activeAlerts.length > 0 ? '#FFD60A' : '#00ffc3', fontWeight: 800 }}>
                {activeAlerts.length}
              </Typography>
            </Box>
          </Box>

          {/* Nodes list */}
          {nodes.length > 0 && (
            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}` }}>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.3), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.6rem' }}>
                Registered Nodes
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {nodes.slice(0, 3).map(n => (
                  <Box key={n.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusDot online={n.is_active} />
                      <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}>{n.name}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.65rem' }}>{n.region}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </BentoCard>


        {/* Active Alerts */}
        <BentoCard sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, minHeight: 360 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AlertTriangle size={16} color="#FFD60A" />
              <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Active Incidents
              </Typography>
            </Box>
            {activeAlerts.length > 0 && (
              <Box sx={{ px: 1.2, py: 0.2, bgcolor: alpha('#FFD60A', 0.1), borderRadius: 0.5, border: `1px solid ${alpha('#FFD60A', 0.2)}` }}>
                <Typography sx={{ color: '#FFD60A', fontWeight: 800, fontSize: '0.65rem' }}>
                  {activeAlerts.length} OPEN
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '3px' }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#FFFFFF', 0.1) } }}>
            {activeAlerts.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 2 }}>
                <CheckCircle2 size={32} color={alpha('#00ffc3', 0.25)} />
                <Typography sx={{ color: alpha('#FFFFFF', 0.25), fontSize: '0.85rem' }}>All systems operational</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {activeAlerts.map((alert) => (
                  <Box key={alert.id} sx={{
                    p: 2, bgcolor: alpha('#FFFFFF', 0.02), borderRadius: 0.5,
                    borderLeft: `3px solid #FFD60A`, border: `1px solid ${alpha('#FFD60A', 0.15)}`,
                    borderLeftWidth: 3
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: '#FFD60A', fontWeight: 800, fontSize: '0.75rem' }}>
                        {alert.monitor_name || `Monitor #${alert.monitor_id}`}
                      </Typography>
                      <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.65rem' }}>
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: alpha('#FFFFFF', 0.7), fontSize: '0.8rem', mb: 1.5 }}>
                      {alert.message}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleResolveAlert(alert.id)}
                      sx={{
                        color: '#00ffc3', fontSize: '0.65rem', fontWeight: 900, textTransform: 'none', p: 0,
                        minWidth: 0, '&:hover': { color: '#00ffc3', opacity: 0.7 }
                      }}
                    >
                      ACKNOWLEDGE →
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </BentoCard>

        {/* Live Telemetry Log */}
        <BentoCard sx={{ gridColumn: 'span 12', minHeight: 280 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Terminal size={16} color="#BF5AF2" />
              <Typography sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Live Telemetry Stream
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusDot online={wsConnected} />
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.3), fontWeight: 700, fontSize: '0.65rem' }}>
                {telemetryLogs.length} packets received
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{
            height: 220, bgcolor: '#050505', borderRadius: 0.5, p: 2,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            overflowY: 'auto', border: `1px solid ${alpha('#FFFFFF', 0.05)}`,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#FFFFFF', 0.08) }
          }}>
            {telemetryLogs.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: wsConnected ? '#00ffc3' : alpha('#FFFFFF', 0.1), animation: wsConnected ? 'pulse 1.5s infinite' : 'none' }} />
                <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '12px' }}>
                  {wsConnected ? 'Stream connected — waiting for check results...' : 'Connecting to telemetry stream...'}
                </Typography>
              </Box>
            ) : (
              telemetryLogs.map((log, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.75, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: alpha('#FFFFFF', 0.15), fontSize: '11px', minWidth: 55, flexShrink: 0 }}>
                    [{log.timestamp?.slice(11, 19) || '--:--:--'}]
                  </Typography>
                  <Typography sx={{ color: '#BF5AF2', fontSize: '11px', fontWeight: 700, minWidth: 80, flexShrink: 0 }}>
                    {log.node_name || 'local'}
                  </Typography>
                  <Typography sx={{ color: alpha('#FFFFFF', 0.6), fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.monitor_name || log.url}
                  </Typography>
                  <Typography sx={{ color: log.success ? '#00ffc3' : '#ff4b4b', fontSize: '11px', fontWeight: 900, flexShrink: 0 }}>
                    {log.status_code || (log.success ? '200' : 'ERR')} · {log.response_time_ms}ms
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </BentoCard>

      </Box>

      {/* ── Deploy Node Modal ── */}
      <Dialog
        open={showNodeModal}
        onClose={() => setShowNodeModal(false)}
        PaperProps={{ sx: { bgcolor: '#0A0A0A', backgroundImage: 'none', border: `1px solid ${alpha('#FFFFFF', 0.08)}`, borderRadius: 0.5, minWidth: 400 } }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 900, px: 3, pt: 3, fontSize: '1rem' }}>
          Register Monitoring Node
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.35), mb: 3, fontSize: '0.8rem' }}>
            Nodes represent monitoring agents. Currently all checks run from the local master node.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Node Name" fullWidth variant="outlined"
              placeholder="e.g. Edge-Node-01"
              value={newNode.name}
              onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: '#FFFFFF', '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) }, '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) } }, '& label': { color: alpha('#FFFFFF', 0.4) } }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: alpha('#FFFFFF', 0.4) }}>Region</InputLabel>
              <Select value={newNode.region} label="Region" onChange={(e) => setNewNode({ ...newNode, region: e.target.value })}
                sx={{ color: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#FFFFFF', 0.1) } }}>
                <MenuItem value="local">Local (this machine)</MenuItem>
                <MenuItem value="us-east-1">US East (N. Virginia)</MenuItem>
                <MenuItem value="eu-west-1">EU West (Ireland)</MenuItem>
                <MenuItem value="ap-southeast-1">Asia Pacific (Singapore)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: alpha('#FFFFFF', 0.4) }}>Provider</InputLabel>
              <Select value={newNode.provider} label="Provider" onChange={(e) => setNewNode({ ...newNode, provider: e.target.value })}
                sx={{ color: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#FFFFFF', 0.1) } }}>
                <MenuItem value="Local">Local</MenuItem>
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="GCP">Google Cloud</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setShowNodeModal(false)} sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleNodeSubmit} variant="contained" disabled={!newNode.name.trim()}
            sx={{ bgcolor: '#007AFF', color: '#FFFFFF', fontWeight: 900, borderRadius: 0.5, textTransform: 'none', '&:hover': { bgcolor: '#0066D6' }, '&:disabled': { bgcolor: alpha('#007AFF', 0.3) } }}>
            Register Node
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── New Monitor Modal ── */}
      <Dialog
        open={showMonitorModal}
        onClose={() => setShowMonitorModal(false)}
        PaperProps={{ sx: { bgcolor: '#0A0A0A', backgroundImage: 'none', border: `1px solid ${alpha('#FFFFFF', 0.08)}`, borderRadius: 0.5, minWidth: 480 } }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 900, px: 3, pt: 3, fontSize: '1rem' }}>
          Add Endpoint Monitor
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              label="Service Name" fullWidth
              placeholder="My API"
              value={newMonitor.name}
              onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { color: '#FFFFFF', '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) }, '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) } }, '& label': { color: alpha('#FFFFFF', 0.4) } }}
            />
            <TextField
              label="Endpoint URL" fullWidth
              placeholder="https://api.yourservice.com/health"
              value={newMonitor.url}
              onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
              helperText="Supports http://, https://, and localhost URLs"
              FormHelperTextProps={{ sx: { color: alpha('#FFFFFF', 0.2) } }}
              sx={{ '& .MuiOutlinedInput-root': { color: '#FFFFFF', '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) }, '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.2) } }, '& label': { color: alpha('#FFFFFF', 0.4) } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel sx={{ color: alpha('#FFFFFF', 0.4) }}>Method</InputLabel>
                <Select value={newMonitor.method} label="Method" onChange={(e) => setNewMonitor({ ...newMonitor, method: e.target.value })}
                  sx={{ color: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#FFFFFF', 0.1) } }}>
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="HEAD">HEAD</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Check interval (seconds)" type="number" sx={{ flex: 2, '& .MuiOutlinedInput-root': { color: '#FFFFFF', '& fieldset': { borderColor: alpha('#FFFFFF', 0.1) } }, '& label': { color: alpha('#FFFFFF', 0.4) } }}
                value={newMonitor.check_interval_seconds}
                inputProps={{ min: 10 }}
                onChange={(e) => setNewMonitor({ ...newMonitor, check_interval_seconds: Math.max(10, parseInt(e.target.value) || 60) })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setShowMonitorModal(false)} sx={{ color: alpha('#FFFFFF', 0.4), fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleMonitorSubmit} variant="contained" disabled={!newMonitor.name.trim() || !newMonitor.url.trim()}
            sx={{ bgcolor: '#007AFF', color: '#FFFFFF', fontWeight: 900, borderRadius: 0.5, textTransform: 'none', '&:hover': { bgcolor: '#0066D6' }, '&:disabled': { bgcolor: alpha('#007AFF', 0.3) } }}>
            Start Monitoring
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          severity={snackbar.severity}
          sx={{ bgcolor: '#111', color: '#FFFFFF', border: `1px solid ${alpha('#FFFFFF', 0.1)}`, borderRadius: 0.5, fontWeight: 600, '& .MuiAlert-icon': { color: snackbar.severity === 'success' ? '#00ffc3' : snackbar.severity === 'error' ? '#ff4b4b' : '#007AFF' } }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* ── Inventory Drawer — PREMIUM SIDE PANEL ── */}
      <Drawer
        anchor="right"
        open={showInventoryDrawer}
        onClose={() => setShowInventoryDrawer(false)}
        PaperProps={{
          sx: {
            width: 420,
            bgcolor: alpha('#050505', 0.95),
            backdropFilter: 'blur(30px)',
            borderLeft: `1px solid ${alpha('#FFFFFF', 0.08)}`,
            backgroundImage: 'none',
            p: 0, // Controlled padding
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-20px 0 50px rgba(0,0,0,0.5)'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: -1.5, mb: 0.5, fontSize: '1.75rem' }}>
              Inventory
            </Typography>
            <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem' }}>
              {monitors.length} ENDPOINTS TARGETED
            </Typography>
          </Box>
          <IconButton onClick={() => setShowInventoryDrawer(false)} sx={{ color: alpha('#FFFFFF', 0.2), p: 1, '&:hover': { color: '#FFFFFF', bgcolor: alpha('#FFFFFF', 0.05) } }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Search & Bulk Actions */}
        <Box sx={{ px: 4, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name or URL..."
            value={monitorSearch}
            onChange={(e) => setMonitorSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 12, opacity: 0.3 }} />,
              sx: { 
                bgcolor: alpha('#FFFFFF', 0.03),
                borderRadius: 1,
                fontSize: '0.85rem',
                color: '#FFFFFF',
                '& fieldset': { borderColor: alpha('#FFFFFF', 0.08) },
                '&:hover fieldset': { borderColor: alpha('#FFFFFF', 0.15) },
                '&.Mui-focused fieldset': { borderColor: alpha('#007AFF', 0.5) }
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
            <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.7rem', fontWeight: 600 }}>
              {selectedMonitors.length} SELECTED
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => setSelectedMonitors(monitors.map(m => m.id))}
                sx={{ color: '#007AFF', fontSize: '0.65rem', fontWeight: 900, p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', opacity: 0.7 } }}
              >
                SELECT ALL
              </Button>
              <Typography sx={{ color: alpha('#FFFFFF', 0.1), fontSize: '0.65rem' }}>|</Typography>
              <Button 
                size="small" 
                onClick={() => setSelectedMonitors([])}
                sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.65rem', fontWeight: 900, p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', color: '#FFFFFF' } }}
              >
                CLEAR
              </Button>
            </Box>
          </Box>
        </Box>

        {/* List Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 4, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#FFFFFF', 0.08), borderRadius: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 4 }}>
            {monitors.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.2 }}>
                <Globe size={48} style={{ marginBottom: 16 }} />
                <Typography variant="body2" fontWeight={600}>No endpoints configured</Typography>
              </Box>
            ) : (
              monitors
                .filter(m => m.name.toLowerCase().includes(monitorSearch.toLowerCase()) || m.url.toLowerCase().includes(monitorSearch.toLowerCase()))
                .map((m) => {
                  const isSelected = selectedMonitors.includes(m.id);
                  return (
                    <Box
                      key={m.id}
                      onClick={() => {
                        setSelectedMonitors(prev => 
                          prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]
                        );
                      }}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, p: 2,
                        bgcolor: isSelected ? alpha('#007AFF', 0.08) : alpha('#FFFFFF', 0.02), 
                        borderRadius: 1,
                        border: `1px solid ${isSelected ? alpha('#007AFF', 0.3) : alpha('#FFFFFF', 0.05)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          bgcolor: isSelected ? alpha('#007AFF', 0.1) : alpha('#FFFFFF', 0.05),
                          transform: 'translateX(-4px)',
                          '& .delete-btn': { opacity: 1 }
                        }
                      }}
                    >
                      {/* Checkbox / Initial */}
                      <Box sx={{ 
                        width: 24, height: 24, borderRadius: 0.5, 
                        border: `2px solid ${isSelected ? '#007AFF' : alpha('#FFFFFF', 0.1)}`,
                        bgcolor: isSelected ? '#007AFF' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }}>
                        {isSelected && <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={3} />}
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.875rem', lineHeight: 1.1, letterSpacing: -0.2 }}>
                            {m.name}
                          </Typography>
                          {!m.is_active && (
                            <Box sx={{ px: 0.5, py: 0.05, bgcolor: alpha('#ff4b4b', 0.1), borderRadius: 0.25, border: `1px solid ${alpha('#ff4b4b', 0.2)}` }}>
                              <Typography sx={{ color: '#ff4b4b', fontSize: '0.55rem', fontWeight: 900 }}>PAUSED</Typography>
                            </Box>
                          )}
                        </Box>
                        <Typography sx={{ color: alpha('#FFFFFF', 0.3), fontSize: '0.72rem', fontFamily: '"JetBrains Mono", monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>
                          {m.url.replace('https://', '').replace('http://', '')}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          className="delete-btn"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDeleteMonitor(m.id, m.name); }}
                          sx={{ 
                            color: alpha('#FFFFFF', 0.1), 
                            opacity: 0.3,
                            transition: 'all 0.2s',
                            '&:hover': { color: '#ff4b4b', bgcolor: alpha('#ff4b4b', 0.1), opacity: 1 } 
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })
            )}
          </Box>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 4, borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}`, bgcolor: alpha('#000000', 0.2) }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowMonitorModal(true)}
            startIcon={<Plus size={18} />}
            sx={{ 
              bgcolor: '#007AFF', color: '#FFFFFF', 
              borderRadius: 1, py: 1.5, fontWeight: 900, 
              fontSize: '0.85rem', textTransform: 'none',
              boxShadow: `0 4px 20px ${alpha('#007AFF', 0.3)}`,
              '&:hover': { bgcolor: '#0066D6', transform: 'translateY(-1px)' } 
            }}
          >
            Register Endpoint
          </Button>
        </Box>
      </Drawer>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
};

export default Dashboard;
