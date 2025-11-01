import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { useAppStore } from '@/store/app';
import { SearchBar } from '@/components/SearchBar';

interface TopBarProps {
  sidebarWidth: number;
  isMobile: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ sidebarWidth, isMobile }) => {
  const theme = useTheme();
  const {
    toggleSidebar,
    toggleTheme,
    notifications,
    theme: appTheme,
    addNotification,
  } = useAppStore();

  const handleRefresh = () => {
    addNotification({
      type: 'info',
      title: 'Refreshing Data',
      message: 'Fetching latest AI content...',
      duration: 3000,
    });
    // TODO: Implement actual data refresh
  };

  const handleNotifications = () => {
    // TODO: Open notifications panel
    console.log('Open notifications');
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        ml: isMobile ? 0 : `${sidebarWidth}px`,
        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.standard,
        }),
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Menu Button */}
        <IconButton edge='start' onClick={toggleSidebar} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        {/* Logo/Title */}
        <Typography
          variant='h6'
          component='div'
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: 'fit-content',
          }}
        >
          AIFEED
        </Typography>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
          <SearchBar />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Refresh */}
          <Tooltip title='Refresh Content'>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title='Notifications'>
            <IconButton onClick={handleNotifications}>
              <Badge badgeContent={notifications.length} color='error' max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${appTheme === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleTheme}>
              {appTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
