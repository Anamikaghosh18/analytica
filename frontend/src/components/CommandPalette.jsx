import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, alpha, InputBase } from '@mui/material';
import { Monitor, Search, ArrowRight, X, Command, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CommandPalette = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setLoading(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      api.get('/monitors/')
        .then(r => setMonitors(r.data || []))
        .catch(() => setMonitors([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const nodeItems = monitors.map(m => ({
    id: `monitor-${m.id}`,
    type: 'monitor',
    label: m.name,
    sub: m.url,
    icon: m.is_active ? <CheckCircle2 size={15} /> : <XCircle size={15} />,
    color: m.is_active ? '#00ffc3' : '#ff4b4b',
    action: () => navigate(`/?monitor=${m.id}`),
  }));

  const filtered = monitors.filter(m => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.url?.toLowerCase().includes(q) ||
      m.method?.toLowerCase().includes(q)
    );
  });

  const executeItem = useCallback((m) => {
    navigate(`/?monitor=${m.id}`);
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[selected]) executeItem(filtered[selected]); }
      if (e.key === 'Escape')    { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, executeItem, onClose]);

  useEffect(() => { setSelected(0); }, [query]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed', inset: 0, zIndex: 9000,
          bgcolor: alpha('#000000', 0.7),
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Palette panel */}
      <Box sx={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9001,
        width: { xs: '92vw', sm: 600 },
        bgcolor: '#0D0D0D',
        border: `1px solid ${alpha('#FFFFFF', 0.1)}`,
        borderRadius: '6px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
        overflow: 'hidden',
      }}>

        {/* Search input row */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2.5, py: 1.75,
          borderBottom: `1px solid ${alpha('#FFFFFF', 0.07)}`,
        }}>
          <Search size={16} color={alpha('#FFFFFF', 0.35)} style={{ flexShrink: 0 }} />
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search monitored endpoints..."
            fullWidth
            sx={{
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 500,
              '& input::placeholder': { color: alpha('#FFFFFF', 0.22), opacity: 1 },
              '& input': { padding: 0 },
            }}
          />
          {query ? (
            <Box
              onClick={() => setQuery('')}
              sx={{ cursor: 'pointer', display: 'flex', color: alpha('#FFFFFF', 0.25), '&:hover': { color: alpha('#FFFFFF', 0.6) }, flexShrink: 0 }}
            >
              <X size={14} />
            </Box>
          ) : (
            <Box sx={{ px: 0.7, py: 0.2, bgcolor: alpha('#FFFFFF', 0.05), border: `1px solid ${alpha('#FFFFFF', 0.08)}`, borderRadius: '3px', flexShrink: 0 }}>
              <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.6rem', fontWeight: 800 }}>ESC</Typography>
            </Box>
          )}
        </Box>

        {/* Results list */}
        <Box sx={{
          maxHeight: 400, overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '3px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#FFFFFF', 0.1) }
        }}>
          {loading ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.82rem' }}>Loading endpoints...</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Monitor size={26} color={alpha('#FFFFFF', 0.1)} style={{ marginBottom: 10 }} />
              <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.82rem' }}>
                {monitors.length === 0 ? 'No monitors configured yet' : `No results for "${query}"`}
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Section header */}
              <Box sx={{ px: 2.5, pt: 1.5, pb: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Monitored Endpoints
                </Typography>
                <Typography sx={{ color: alpha('#FFFFFF', 0.15), fontSize: '0.65rem' }}>
                  {filtered.length} of {monitors.length}
                </Typography>
              </Box>

              {filtered.map((m, idx) => {
                const isSelected = idx === selected;
                return (
                  <Box
                    key={m.id}
                    onClick={() => executeItem(m)}
                    onMouseEnter={() => setSelected(idx)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      px: 2.5, py: 1.25, mx: 1, mb: 0.25,
                      borderRadius: '4px', cursor: 'pointer',
                      bgcolor: isSelected ? alpha('#007AFF', 0.08) : 'transparent',
                      border: `1px solid ${isSelected ? alpha('#007AFF', 0.15) : 'transparent'}`,
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {/* Status icon */}
                    <Box sx={{ flexShrink: 0 }}>
                      {m.is_active
                        ? <CheckCircle2 size={15} color="#00ffc3" />
                        : <XCircle size={15} color="#ff4b4b" />
                      }
                    </Box>

                    {/* Name + URL */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {m.name}
                      </Typography>
                      <Typography sx={{
                        color: alpha('#FFFFFF', 0.3), fontSize: '0.72rem',
                        fontFamily: '"JetBrains Mono", monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {m.url}
                      </Typography>
                    </Box>

                    {/* Method + interval badges */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Box sx={{ px: 0.8, py: 0.2, bgcolor: alpha('#007AFF', 0.1), border: `1px solid ${alpha('#007AFF', 0.2)}`, borderRadius: '3px' }}>
                        <Typography sx={{ color: '#007AFF', fontSize: '0.6rem', fontWeight: 900 }}>{m.method}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: alpha('#FFFFFF', 0.2) }}>
                        <Clock size={10} />
                        <Typography sx={{ color: alpha('#FFFFFF', 0.2), fontSize: '0.65rem' }}>{m.check_interval_seconds}s</Typography>
                      </Box>
                      {isSelected && <ArrowRight size={13} color={alpha('#FFFFFF', 0.3)} />}
                    </Box>
                  </Box>
                );
              })}
              <Box sx={{ height: 8 }} />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 2.5, py: 1.25,
          borderTop: `1px solid ${alpha('#FFFFFF', 0.05)}`,
          display: 'flex', alignItems: 'center', gap: 2.5
        }}>
          {[['↑↓', 'Navigate'], ['↵', 'Go to Dashboard'], ['Esc', 'Close']].map(([key, label]) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ px: 0.7, py: 0.2, bgcolor: alpha('#FFFFFF', 0.05), border: `1px solid ${alpha('#FFFFFF', 0.07)}`, borderRadius: '3px' }}>
                <Typography sx={{ color: alpha('#FFFFFF', 0.25), fontSize: '0.6rem', fontWeight: 700 }}>{key}</Typography>
              </Box>
              <Typography sx={{ color: alpha('#FFFFFF', 0.18), fontSize: '0.64rem' }}>{label}</Typography>
            </Box>
          ))}
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Command size={10} color={alpha('#FFFFFF', 0.12)} />
            <Typography sx={{ color: alpha('#FFFFFF', 0.12), fontSize: '0.64rem' }}>Analytica</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CommandPalette;
