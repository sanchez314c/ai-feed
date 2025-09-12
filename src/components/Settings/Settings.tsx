import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const Settings: React.FC = () => {
  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Application settings and preferences coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};