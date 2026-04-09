import React from 'react';
import { Box, alpha } from '@mui/material';

const BentoCard = ({ children, sx = {}, height = 'auto', noPadding = false }) => {
  return (
    <Box 
      sx={{ 
        height: height,
        position: 'relative',
        borderRadius: 0.5,
        bgcolor: alpha('#111111', 0.6),
        backdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${alpha('#FFFFFF', 0.08)}`,
        overflow: 'hidden',
        p: noPadding ? 0 : 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: alpha('#111111', 0.8),
          borderColor: alpha('#007AFF', 0.3),
          transform: 'translateY(-2px)',
          boxShadow: `0 20px 40px ${alpha('#000000', 0.6)}, 0 0 20px ${alpha('#007AFF', 0.1)}`,
          '& .card-glow': {
            opacity: 0.15,
          }
        },
        ...sx
      }}
    >
      {/* Dynamic Hover Glow */}
      <Box 
        className="card-glow"
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%)',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.5s ease',
          zIndex: 0
        }} 
      />
      
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default BentoCard;
