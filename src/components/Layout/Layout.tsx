import React from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '@/store/app';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useAppStore();

  const sidebarWidth = 280;
  const collapsedWidth = 72;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Top Bar */}
      <TopBar
        sidebarWidth={sidebarOpen ? sidebarWidth : collapsedWidth}
        isMobile={isMobile}
      />
      
      {/* Sidebar */}
      <Sidebar
        width={sidebarWidth}
        collapsedWidth={collapsedWidth}
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // Height of top bar
          ml: isMobile ? 0 : sidebarOpen ? `${sidebarWidth}px` : `${collapsedWidth}px`,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
          }),
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};