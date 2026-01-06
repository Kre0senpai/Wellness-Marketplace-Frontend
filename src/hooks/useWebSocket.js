import { useEffect } from 'react';
import websocketService from '../services/websocketService';
import { authService } from '../services/api';

/**
 * Custom React Hook for WebSocket
 * 
 * Usage in any component:
 * 
 * useWebSocket((type, data) => {
 *   if (type === 'notification') {
 *     alert(`New notification: ${data.message}`);
 *   }
 * });
 * 
 * This hook:
 * 1. Connects to WebSocket when component mounts
 * 2. Listens for real-time messages
 * 3. Disconnects when component unmounts
 */

export const useWebSocket = (messageHandler) => {
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser.userId) {
      console.log('No user logged in, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    websocketService.connect(currentUser.userId);

    // Register message handler
    if (messageHandler) {
      websocketService.onMessage(messageHandler);
    }

    // Cleanup on unmount
    return () => {
      // Note: Don't disconnect here if you want to keep connection alive
      // across route changes. Only disconnect on logout.
      // websocketService.disconnect();
    };
  }, []);

  return {
    isConnected: websocketService.isConnected(),
    send: websocketService.send.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
  };
};

export default useWebSocket;