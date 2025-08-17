import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../auth/AuthProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { WebSocketMessage, WebSocketMessageType, WebSocketPayload, Notification, ApiResponse } from '../../types';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (type: WebSocketMessageType, payload: WebSocketPayload) => void;
  subscribe: (eventType: WebSocketMessageType, callback: (data: WebSocketPayload) => void) => () => void;
  unsubscribe: (eventType: WebSocketMessageType, callback: (data: WebSocketPayload) => void) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<WebSocketMessageType, Set<(data: WebSocketPayload) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    const subscribers = subscriptionsRef.current.get(message.type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message.payload);
        } catch (error) {
          console.error('Error in WebSocket message handler:', error);
        }
      });
    }

    // Handle system messages
    switch (message.type) {
      case 'connection.established':
        toast.success('Connected to real-time updates');
        break;
      case 'notification.new':
        // Show toast notification for new messages/updates
        if (message.payload.message) {
          toast.info(
            `New message from ${message.payload.message.senderName}`,
            {
              description: message.payload.message.content.substring(0, 100),
              action: {
                label: 'View',
                onClick: () => {
                  // Navigate to chat - this could be enhanced with proper navigation
                  window.dispatchEvent(new CustomEvent('navigate-to-chat', {
                    detail: { roomId: message.payload.room?.id }
                  }));
                }
              }
            }
          );
        }
        break;
      case 'property.updated':
        toast.info('Property information updated');
        break;
      case 'booking.status_changed':
        toast.info(`Booking status changed to ${message.payload.status || 'updated'}`);
        break;
    }
  }, []);

  const sendMessage = useCallback((type: WebSocketMessageType, payload: WebSocketPayload) => {
    if (!isConnected || !user) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId: user.id,
      priority: 'normal'
    };

    // In a real WebSocket implementation:
    // wsRef.current?.send(JSON.stringify(message));
    
    console.log('Sending WebSocket message:', message);
    
    // Simulate server acknowledgment
    setTimeout(() => {
      handleMessage({
        id: `ack-${message.id}`,
        type: 'message.acknowledged',
        payload: { 
          data: { originalType: type, success: true }
        },
        timestamp: new Date().toISOString(),
        userId: user.id,
        priority: 'normal'
      });
    }, 100);
  }, [isConnected, user, handleMessage]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (isConnected && user) {
        // Send heartbeat directly without using sendMessage to avoid circular dependency
        console.log('Sending heartbeat:', { userId: user.id, timestamp: new Date().toISOString() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }, [isConnected, user]);

  const startPolling = useCallback(() => {
    if (!user) return;

    // Simulate real-time updates by polling the server
    const poll = async () => {
      try {
        // Check for new notifications
        const notificationsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/chat/notifications/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (notificationsResponse.ok) {
          const data: ApiResponse<{ notifications: Notification[] }> = await notificationsResponse.json();
          if (data.success && data.data?.notifications && data.data.notifications.length > 0) {
            // Check for new notifications since last poll
            const lastNotificationTime = localStorage.getItem(`lastNotificationTime_${user.id}`);
            const newNotifications = data.data.notifications.filter((notification: Notification) => {
              return !lastNotificationTime || new Date(notification.timestamp) > new Date(lastNotificationTime);
            });

            if (newNotifications.length > 0) {
              newNotifications.forEach((notification: Notification) => {
                handleMessage({
                  id: `notif-${notification.id}`,
                  type: 'notification.new',
                  payload: { notification },
                  timestamp: notification.timestamp,
                  userId: user.id,
                  priority: notification.priority || 'normal'
                });
              });

              // Update last notification time
              const latestTime = Math.max(...newNotifications.map((n: Notification) => new Date(n.timestamp).getTime()));
              localStorage.setItem(`lastNotificationTime_${user.id}`, new Date(latestTime).toISOString());
            }
          }
        }
      } catch (error) {
        console.warn('Polling error:', error);
      }
    };

    // Poll every 5 seconds for real-time feel
    const pollingInterval = setInterval(poll, 5000);
    
    // Store interval reference for cleanup
    return () => clearInterval(pollingInterval);
  }, [user, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setConnectionState('error');
      toast.error('Real-time connection failed after multiple attempts. Please refresh the page to restore connectivity.');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current += 1;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, []);

  const connect = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      setConnectionState('connecting');
      
      // In a real implementation, you would connect to your WebSocket server
      // For this demo, we'll simulate WebSocket behavior with polling
      console.log(`Establishing real-time connection for user ${user.id}...`);
      
      // Simulate WebSocket connection
      const simulateConnection = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        startHeartbeat();
        
        // Simulate receiving initial connection message
        const connectMessage: WebSocketMessage = {
          id: `conn-${Date.now()}`,
          type: 'connection.established',
          payload: { 
            user: { id: user.id },
            data: { timestamp: new Date().toISOString() }
          },
          timestamp: new Date().toISOString(),
          userId: user.id,
          priority: 'high'
        };
        
        handleMessage(connectMessage);
        
        // Start polling for real-time updates (simulating WebSocket)
        startPolling();
      };

      // Simulate connection delay
      setTimeout(simulateConnection, 1000);
      
    } catch (error) {
      console.error('Real-time connection failed during initialization:', error);
      setConnectionState('error');
      handleReconnect();
    }
  }, [user, startHeartbeat, handleMessage, startPolling, handleReconnect]);

  const subscribe = useCallback((eventType: WebSocketMessageType, callback: (data: WebSocketPayload) => void) => {
    if (!subscriptionsRef.current.has(eventType)) {
      subscriptionsRef.current.set(eventType, new Set());
    }
    subscriptionsRef.current.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = subscriptionsRef.current.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscriptionsRef.current.delete(eventType);
        }
      }
    };
  }, []);

  const unsubscribe = useCallback((eventType: WebSocketMessageType, callback: (data: WebSocketPayload) => void) => {
    const subscribers = subscriptionsRef.current.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        subscriptionsRef.current.delete(eventType);
      }
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => connect(), 1000);
  }, [disconnect, connect]);

  // Connect when user logs in
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce polling frequency or pause
        console.log('Application backgrounded, reducing real-time activity');
      } else {
        // Page is visible, resume normal operation
        console.log('Application focused, resuming real-time activity');
        if (user && !isConnected) {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isConnected, reconnect]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionState,
    sendMessage,
    subscribe,
    unsubscribe,
    reconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketProvider;