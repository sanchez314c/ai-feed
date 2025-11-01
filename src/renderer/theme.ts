import { createTheme, ThemeOptions } from '@mui/material/styles';
import { blue, grey, red, green, orange } from '@mui/material/colors';

// Custom blue color palette for AIFEED
const aifeedBlue = {
  50: '#e3f2fd',
  100: '#bbdefb',
  200: '#90caf9',
  300: '#64b5f6',
  400: '#42a5f5',
  500: '#2196f3', // Primary blue
  600: '#1e88e5',
  700: '#1976d2', // Main brand color
  800: '#1565c0',
  900: '#0d47a1',
};

// Common theme options
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: aifeedBlue[700],
      light: aifeedBlue[400],
      dark: aifeedBlue[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: grey[600],
      light: grey[400],
      dark: grey[800],
    },
    error: {
      main: red[600],
      light: red[400],
      dark: red[800],
    },
    warning: {
      main: orange[600],
      light: orange[400],
      dark: orange[800],
    },
    success: {
      main: green[600],
      light: green[400],
      dark: green[800],
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: aifeedBlue[400],
      light: aifeedBlue[300],
      dark: aifeedBlue[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: grey[400],
      light: grey[300],
      dark: grey[600],
    },
    error: {
      main: red[400],
      light: red[300],
      dark: red[600],
    },
    warning: {
      main: orange[400],
      light: orange[300],
      dark: orange[600],
    },
    success: {
      main: green[400],
      light: green[300],
      dark: green[600],
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
    divider: 'rgba(255,255,255,0.12)',
  },
});

// Default theme (light)
export const theme = lightTheme;
