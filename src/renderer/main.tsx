import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import App from './App';
import { lightTheme, darkTheme } from './theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import { useAppStore } from '@/store/app';
import '@/styles/global.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize logging
const isDev = window.location.hostname === 'localhost';

if (isDev) {
  console.log('🚀 AIFEED starting in development mode');
}

// Global error handler
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
  if (window.electronAPI) {
    window.electronAPI.log.error('Renderer error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    });
  }
});

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  if (window.electronAPI) {
    window.electronAPI.log.error('Unhandled promise rejection', {
      reason: event.reason,
    });
  }
});

// Theme wrapper component that responds to theme changes
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(state => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Apply theme to document root for CSS variables
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// React root
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeWrapper>
            <ToastProvider>
              <App />
            </ToastProvider>
            {isDev && <ReactQueryDevtools initialIsOpen={false} />}
          </ThemeWrapper>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
