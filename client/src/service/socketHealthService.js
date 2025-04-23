// socketHealthService.js
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketHealth = (user) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(true); // Default to true initially
  const [serverStatus, setServerStatus] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Add notification to state
  const addNotification = (message, type = 'success') => {
    const newNotification = {
      id: Date.now(),
      message,
      type
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // Function to handle retry connection manually
  const retryConnection = () => {
    if (!user) return;
    
    addNotification('Attempting to reconnect...', 'info');
    
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }
    
    // Reset reconnect attempts
    setReconnectAttempts(0);
    
    // Create new socket connection
    setupSocketConnection();
  };

  // Set up regular ping to check connection
  const setupPing = (socket) => {
    // Clear any existing ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Set up new ping interval (every 30 seconds)
    pingIntervalRef.current = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('ping', (response) => {
          if (response && response.status === 'ok') {
            // Connection is good
            setSocketConnected(true);
          } else {
            // Bad response, might be disconnected
            setSocketConnected(false);
          }
        });
        
        // Also check server status occasionally
        socket.emit('checkServerStatus', (status) => {
          setServerStatus(status);
        });
      } else {
        setSocketConnected(false);
      }
    }, 30000);
  };

  // Setup socket connection
  const setupSocketConnection = () => {
    if (!user) return null;

    try {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
      
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected successfully with ID:', newSocket.id);
        setSocketConnected(true);
        setReconnectAttempts(0);
        
        if (reconnectAttempts > 0) {
          addNotification('Connection restored!', 'success');
        }
        
        // Set up ping to keep connection alive and monitor health
        setupPing(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
        
        // Only show one connection error notification
        if (reconnectAttempts === 0) {
          addNotification(`Connection error: ${error.message}`, 'error');
        }
        
        // Increment reconnect attempts
        setReconnectAttempts(prev => prev + 1);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocketConnected(false);
        
        if (reason === 'io server disconnect') {
          addNotification('Disconnected by server. Attempting to reconnect...', 'error');
          
          // Server disconnected us, try reconnecting after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            newSocket.connect();
          }, 2000);
        } else if (reason === 'transport close') {
          addNotification('Server connection lost. Check your network.', 'error');
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        addNotification(`Socket error: ${error.message}`, 'error');
      });

      return newSocket;
    } catch (error) {
      console.error('Error setting up socket:', error);
      addNotification(`Failed to setup connection: ${error.message}`, 'error');
      return null;
    }
  };

  // Initialize connection when user is available
  useEffect(() => {
    let socketInstance = null;
    
    if (user) {
      socketInstance = setupSocketConnection();
    }

    return () => {
      // Cleanup
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return {
    socket,
    socketConnected,
    serverStatus,
    notifications,
    retryConnection,
    addNotification,
    reconnectAttempts
  };
};