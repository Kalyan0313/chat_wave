import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChatWaveLogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  textColor?: string;
  color?: string;
}

export const ChatWaveLogo: React.FC<ChatWaveLogoProps> = ({
  size = 'medium',
  showText = true,
  textColor = '#1e40af',
  color = '#1e40af',
}) => {
  // Determine pixel size
  let iconSize = 40;
  let fontSize = '1.75rem';

  if (typeof size === 'number') {
    iconSize = size;
    fontSize = `${size * 0.5}px`;
  } else if (size === 'small') {
    iconSize = 28;
    fontSize = '1.25rem';
  } else if (size === 'large') {
    iconSize = 56;
    fontSize = '2.25rem';
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        userSelect: 'none',
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Outer Chat Bubble Shield - Solid Color */}
        <rect
          x="4"
          y="4"
          width="56"
          height="48"
          rx="16"
          fill={color}
        />
        
        {/* Tail Indicator */}
        <path
          d="M16 52 L10 60 L26 52 Z"
          fill={color}
        />

        {/* Audio Soundwave Lines - Solid White */}
        <g fill="#ffffff">
          {/* Wave Bar 1 */}
          <rect x="18" y="24" width="4" height="16" rx="2" />
          {/* Wave Bar 2 */}
          <rect x="25" y="16" width="4" height="32" rx="2" />
          {/* Wave Bar 3 (Center Crest) */}
          <rect x="32" y="12" width="4" height="40" rx="2" />
          {/* Wave Bar 4 */}
          <rect x="39" y="18" width="4" height="28" rx="2" />
          {/* Wave Bar 5 */}
          <rect x="46" y="24" width="4" height="16" rx="2" />
        </g>
      </svg>

      {showText && (
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: fontSize,
            color: textColor,
            display: 'inline-block',
          }}
        >
          Chat Wave
        </Typography>
      )}
    </Box>
  );
};

export default ChatWaveLogo;
