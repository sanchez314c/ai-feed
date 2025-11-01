import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const { addNotification } = useAppStore();

  useEffect(() => {
    // In development, don't try to connect to WebSocket
    if (process.env.NODE_ENV === 'development') {
      console.log('WebSocket disabled in development mode');
      return;
    }

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8080/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Real-time updates enabled',
            duration: 3000,
          });
        };

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          wsRef.current = null;

          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = error => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };

    const handleWebSocketMessage = (message: any) => {
      switch (message.type) {
        case 'content:new':
          addNotification({
            type: 'info',
            title: 'New Content',
            message: `${message.payload.title}`,
            duration: 5000,
          });
          break;

        case 'content:updated':
          // Handle content updates
          break;

        case 'analysis:completed':
          addNotification({
            type: 'success',
            title: 'Analysis Complete',
            message: 'Content analysis finished',
            duration: 3000,
          });
          break;

        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    };

    // connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [addNotification]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
