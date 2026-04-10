import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, alpha, CircularProgress, IconButton, 
  Drawer, TextField, Chip
} from '@mui/material';
import { 
  Brain, X, Sparkles, Terminal, Send as SendIcon 
} from 'lucide-react';
import api from '../services/api';

const CocoSidebar = ({ open, onClose }) => {
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open && !aiDiagnosis) {
      fetchAIDiagnosis();
    }
  }, [open]);

  const fetchAIDiagnosis = async () => {
    setAiLoading(true);
    try {
        const res = await api.post('/ai/analyze');
        setTimeout(() => {
            setAiDiagnosis(res.data);
            setAiLoading(false);
        }, 800);
    } catch (err) {
        setAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsSending(true);

    try {
        const res = await api.post('/ai/chat', { message: chatMessage });
        setChatHistory(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
        setChatHistory(prev => [...prev, { role: 'system', content: "INTELLIGENCE ERROR: Stream interrupted." }]);
    } finally {
        setIsSending(false);
    }
  };

  return (
    <Drawer
        anchor="right"
        open={open}
        onClose={() => !aiLoading && onClose()}
        slotProps={{ 
            paper: { 
                sx: { 
                    width: 650, 
                    bgcolor: '#0A0A0A', 
                    borderLeft: `1px solid ${alpha('#007AFF', 0.2)}`, 
                    backgroundImage: 'none', 
                    display: 'flex', 
                    flexDirection: 'column' 
                } 
            } 
        }}
      >
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha('#fff', 0.05)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Brain size={24} color="#007AFF" />
                <Box>
                    <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.1rem' }}>COCO Intelligence</Typography>
                    <Typography sx={{ color: alpha('#fff', 0.2), fontSize: '0.6rem', fontWeight: 900, letterSpacing: 2 }}>L3-PROBE STATUS: NOMINAL</Typography>
                </Box>
            </Box>
            <IconButton onClick={onClose} sx={{ color: alpha('#fff', 0.2) }}><X size={20} /></IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
            {aiLoading ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <CircularProgress size={40} thickness={2} sx={{ color: '#007AFF', mb: 4 }} />
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.4), fontWeight: 900 }}>SYNCHRONIZING...</Typography>
                </Box>
            ) : aiDiagnosis && (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Box sx={{ flex: 1, p: 2, bgcolor: alpha('#fff', 0.02), border: `1px solid ${alpha('#fff', 0.05)}`, borderRadius: 1.5 }}>
                            <Typography sx={{ color: alpha('#fff', 0.2), fontSize: '0.55rem', fontWeight: 900, mb: 1 }}>STATUS</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: aiDiagnosis.status === 'CRITICAL' ? '#ff375f' : '#00ffc3' }} />
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{aiDiagnosis.status}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, p: 2, bgcolor: alpha('#fff', 0.02), border: `1px solid ${alpha('#fff', 0.05)}`, borderRadius: 1.5 }}>
                            <Typography sx={{ color: alpha('#fff', 0.2), fontSize: '0.55rem', fontWeight: 900, mb: 1 }}>CONFIDENCE</Typography>
                            <Typography sx={{ color: '#007AFF', fontWeight: 900, fontSize: '0.8rem' }}>{(aiDiagnosis.confidence * 100).toFixed(0)}%</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ color: alpha('#fff', 0.3), fontWeight: 900, fontSize: '0.65rem', mb: 2 }}>DIAGNOSIS</Typography>
                    <Typography sx={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.6, mb: 4, bgcolor: alpha('#fff', 0.02), p: 2, borderRadius: 1.5 }}>{aiDiagnosis.diagnosis}</Typography>

                    {aiDiagnosis.recommendation && (
                        <Box sx={{ mb: 4 }}>
                            <Typography sx={{ color: '#BF5AF2', fontWeight: 900, fontSize: '0.65rem', mb: 2 }}>RECOMMENDATION</Typography>
                            <Typography sx={{ color: alpha('#fff', 0.8), fontSize: '0.85rem', fontWeight: 700 }}>{aiDiagnosis.recommendation}</Typography>
                        </Box>
                    )}
                    
                    {aiDiagnosis.detected_patterns && aiDiagnosis.detected_patterns.length > 0 && (
                        <Box sx={{ borderBottom: `1px solid ${alpha('#fff', 0.05)}`, mb: 4, pb: 4 }}>
                            <Typography sx={{ color: alpha('#fff', 0.1), fontWeight: 900, fontSize: '0.6rem', mb: 2 }}>DETECTED PATTERNS</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {aiDiagnosis.detected_patterns.map(p => (
                                    <Chip key={p} label={p} size="small" sx={{ bgcolor: alpha('#fff', 0.05), color: alpha('#fff', 0.4), height: 20, fontSize: '0.6rem', fontWeight: 900 }} />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Chat Stream */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box sx={{ p: 0.5, bgcolor: alpha('#BF5AF2', 0.1), color: '#BF5AF2', borderRadius: 1 }}><Terminal size={12} /></Box>
                        <Typography sx={{ color: alpha('#fff', 0.4), fontWeight: 900, fontSize: '0.6rem', letterSpacing: 2 }}>INTERACTIVE STREAM</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                        {chatHistory.map((chat, i) => (
                            <Box key={i} sx={{ alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '95%' }}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderRadius: 2, 
                                    bgcolor: chat.role === 'user' ? alpha('#007AFF', 0.05) : alpha('#fff', 0.02),
                                    border: `1px solid ${chat.role === 'user' ? alpha('#007AFF', 0.2) : alpha('#fff', 0.05)}`,
                                    fontFamily: chat.role !== 'user' ? '"JetBrains Mono", monospace' : 'inherit'
                                }}>
                                    <Typography sx={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.6 }}>{chat.content}</Typography>
                                </Box>
                            </Box>
                        ))}
                         {isSending && (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <CircularProgress size={12} thickness={5} />
                                <Typography variant="caption" sx={{ color: alpha('#fff', 0.2), fontWeight: 900 }}>PROCESSING...</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>

        <Box sx={{ p: 3, borderTop: `1px solid ${alpha('#fff', 0.05)}`, bgcolor: alpha('#fff', 0.01) }}>
            <Box sx={{ 
                display: 'flex', 
                bgcolor: alpha('#fff', 0.02), 
                borderRadius: 2, 
                border: `1px solid ${alpha('#fff', 0.05)}`,
                overflow: 'hidden'
            }}>
                <TextField 
                    fullWidth 
                    placeholder="Message COCO..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    variant="standard"
                    slotProps={{ 
                        input: { 
                            disableUnderline: true, 
                            sx: { color: '#fff', px: 2, py: 1.5, fontSize: '0.85rem' } 
                        } 
                    }}
                />
                <IconButton onClick={handleSendMessage} sx={{ color: '#007AFF' }}><SendIcon size={18} /></IconButton>
            </Box>
        </Box>
      </Drawer>
  );
};

export default CocoSidebar;
