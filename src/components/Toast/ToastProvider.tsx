import React, { createContext, useContext } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useAppStore } from '@/store/app';

interface ToastContextType {
  showToast: (message: string, type?: AlertColor, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { notifications, removeNotification, addNotification } = useAppStore();

  const showToast = (message: string, type: AlertColor = 'info', duration = 5000) => {
    addNotification({
      type,
      title: message,
      message: '',
      duration,
    });
  };

  const handleClose = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const contextValue: ToastContextType = {
    showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications as snackbars */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 5000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            mt: index * 7, // Stack multiple notifications
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.title}
            {notification.message && ` - ${notification.message}`}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};