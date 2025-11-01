import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

export const LoadingScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
      }}
    >
      <Typography
        variant='h3'
        sx={{
          fontWeight: 700,
          mb: 3,
          background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.7) 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        AIFEED
      </Typography>

      <CircularProgress
        size={48}
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mb: 2,
        }}
      />

      <Typography
        variant='body1'
        sx={{
          opacity: 0.8,
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        Loading your AI intelligence dashboard...
      </Typography>
    </Box>
  );
};
