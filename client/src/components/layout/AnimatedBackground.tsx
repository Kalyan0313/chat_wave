import React from 'react';
import { Box } from '@mui/material';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f5f3ff',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      {/* Background Static Glow Canvas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Top Electric Cyber Violet Glow Arch */}
        <Box
          sx={{
            position: 'absolute',
            top: '-70px',
            left: '-20%',
            right: '-20%',
            height: '400px',
            background: 'radial-gradient(ellipse at 50% 10%, #7c3aed 0%, #8b5cf6 35%, #c084fc 65%, rgba(192, 132, 252, 0) 80%)',
            filter: 'blur(38px)',
            opacity: 0.95,
          }}
        />

        {/* Middle Cosmic Magenta & Lavender Aura */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '-15%',
            right: '-15%',
            height: '520px',
            transform: 'translateY(-50%)',
            background: 'radial-gradient(ellipse at 50% 50%, #e879f9 0%, #f472b6 30%, #e0e7ff 65%, rgba(245, 243, 255, 0) 85%)',
            filter: 'blur(50px)',
            opacity: 0.85,
          }}
        />

        {/* Bottom Organic Curved Violet Arch Glow */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-120px',
            left: '-15%',
            right: '-15%',
            height: '460px',
            borderRadius: '50% 50% 0 0',
            background: 'radial-gradient(ellipse at 50% 85%, #5b21b6 0%, #7c3aed 35%, #a855f7 65%, rgba(168, 85, 247, 0) 90%)',
            filter: 'blur(55px)',
            opacity: 0.75,
          }}
        />
      </Box>

      {/* Page Content */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AnimatedBackground;
