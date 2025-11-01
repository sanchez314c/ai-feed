import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAppStore } from '@/store/app';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Search } from '@/components/Search';
import { Collections } from '@/components/Collections';
import { Settings } from '@/components/Settings';
import { Analytics } from '@/components/Analytics';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const App: React.FC = () => {
  const { loading, error, initialize } = useAppStore();
  const { user, isLoading: authLoading } = useAuth();

  // Initialize WebSocket connection
  useWebSocket();

  // Set up keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    // Initialize the application
    const init = async () => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.log.info('Application initialized');
        }
        await initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        if (window.electronAPI) {
          await window.electronAPI.log.error('Failed to initialize app', error);
        }
      }
    };

    init();
  }, [initialize]);

  // Show loading screen while initializing
  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  // Show error if initialization failed
  if (error) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        height='100vh'
        p={3}
      >
        <h1>Initialization Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </Box>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/sources/:source' element={<Dashboard />} />
        <Route path='/topics/:topic' element={<Dashboard />} />
        <Route path='/search' element={<Search />} />
        <Route path='/collections' element={<Collections />} />
        <Route path='/collections/:id' element={<Collections />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
