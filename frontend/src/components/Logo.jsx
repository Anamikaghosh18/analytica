import React from 'react';
import { Box, alpha } from '@mui/material';

const Logo = ({ size = 40, color = '#007AFF' }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract "A" / Network Pulse Logo */}
        <path
          d="M20 80L50 20L80 80"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 50H65"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <circle
          cx="50"
          cy="20"
          r="6"
          fill={color}
        />
        <circle
          cx="20"
          cy="80"
          r="6"
          fill={color}
        />
        <circle
          cx="80"
          cy="80"
          r="6"
          fill={color}
        />
        {/* Glow effect */}
        <path
          d="M50 20L50 80"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.3"
        />
      </svg>
    </Box>
  );
};

export default Logo;
