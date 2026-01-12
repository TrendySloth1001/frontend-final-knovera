/**
 * WebSocket Hook for Real-Time Messaging
 * Manages WebSocket connection for chat functionality
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { ServerMessage, IncomingClientMessage } from '@/types/chat';

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: ServerMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  userId,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('[WebSocket] Connection already in progress');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    if (!userId || userId.trim() === '') {
      console.warn('[WebSocket] Cannot connect: userId is required');
      return;
    }

    // Close existing connection if any (properly)
    if (wsRef.current) {
      const existingWs = wsRef.current;
      try {
        existingWs.onopen = null;
        existingWs.onmessage = null;
        existingWs.onerror = null;
        existingWs.onclose = null;
        if (existingWs.readyState !== WebSocket.CLOSED && existingWs.readyState !== WebSocket.CLOSING) {
          existingWs.close(1000, 'Reconnecting');
        }
      } catch (error) {
        // Ignore cleanup errors
      }
      wsRef.current = null;
    }

    isConnectingRef.current = true;

    try {
      // Get WebSocket URL from environment or derive from API URL
      let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) {
        // Get base URL without path
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        // Extract protocol and domain only
        const url = new URL(apiUrl);
        wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api.*$/, '');
      }
      
      const fullUrl = `${wsUrl}?userId=${userId}`;
      console.log('[WebSocket] Connecting to:', fullUrl.replace(/userId=[^&]+/, 'userId=***'));
      
      const ws = new WebSocket(fullUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        isConnectingRef.current = false;
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type);
          onMessage?.(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data);
        }
      };

      ws.onerror = (event) => {
        // Only log/show errors if we're actually trying to connect (not during cleanup)
        // This prevents noise during React Strict Mode double-invoke
        if (isConnectingRef.current && ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
          console.error('[WebSocket] Connection error:', {
            type: event.type,
            readyState: ws.readyState,
          });
          
          // Provide more specific error message
          let errorMessage = 'WebSocket connection failed';
          if (ws.readyState === WebSocket.CLOSED) {
            errorMessage = 'WebSocket server unreachable. Is the server running?';
          } else if (ws.readyState === WebSocket.CONNECTING) {
            errorMessage = 'WebSocket connection timeout';
          }
          
          onError?.(new Error(errorMessage));
        }
        
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        isConnectingRef.current = false;
        setIsConnected(false);
        onDisconnect?.();

        // Only attempt to reconnect if it wasn't a clean close and we haven't exceeded max attempts
        if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnection attempts reached. Please check if the server is running.');
          onError?.(new Error('Failed to connect after multiple attempts'));
        }
      };

      wsRef.current = ws;
    } catch (error) {
      isConnectingRef.current = false;
      onError?.(error as Error);
    }
  }, [userId, onMessage, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    isConnectingRef.current = false;
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket connection if it exists
    if (wsRef.current) {
      const ws = wsRef.current;
      
      // Remove event listeners first to prevent any callbacks during cleanup
      // This prevents console errors in React Strict Mode
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      
      // Close the connection silently
      // Only attempt to close if in a valid state
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try {
          ws.close(1000, 'Cleanup');
        } catch (e) {
          // Expected in React Strict Mode - ignore
        }
      }
      
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  const sendMessage = useCallback((message: IncomingClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);

  useEffect(() => {
    // Only attempt connection if we have a valid, non-empty userId
    if (userId && userId.trim() !== '') {
      connect();
    }
    // Silently skip connection if userId is empty (no need to log during auth loading)

    return () => {
      // Cleanup: disconnect when component unmounts or userId changes
      // This handles React Strict Mode double-invoke gracefully
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only re-connect when userId changes

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  };
}
