import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 0.5
      }}
    >
      <img 
        src="/favicon.png" 
        alt="Analytica Logo" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain'
        }} 
      />
    </Box>
  );
};

export default Logo;
