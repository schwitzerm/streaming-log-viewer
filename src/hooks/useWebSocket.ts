import { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LogMessage, Client } from '../types';
import React from 'react';
import { io, Socket } from 'socket.io-client';

const WebSocketContext = createContext<ReturnType<typeof useWebSocketState> | null>(null);

function useWebSocketState() {
  const [isConnected, setIsConnected] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [viewerId, setViewerId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io/'     });

        socketRef.current = socket;

        socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(`Connection error: ${err.message}`);
    });

    socket.on('client-id', (id) => {
      console.log(`Received viewer ID: ${id}`);
      setViewerId(id);
    });

    socket.on('clients-update', (clientsList) => {
      console.log('Received clients update:', clientsList);
            const clientObjects = clientsList.map((id: string) => ({
        id,
        name: id,
        connected: true
      }));
      setClients(clientObjects);
    });

    socket.on('log-message', (logData) => {
      console.log('Received log message:', logData);
      setLogs(prevLogs => [...prevLogs, logData]);
    });

        return () => {
      console.log('Cleaning up WebSocket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

      // @ts-ignore
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__websocketTestHelpers = {
      setIsConnected,
      setClients,
      addLog: (log: LogMessage) => setLogs(prev => [...prev, log]),
      clearLogs: () => setLogs([])
    };
  }

    const sendCommand = useCallback((clientId: string, command: string) => {
    if (!isConnected || !socketRef.current) {
      setError('Cannot send command: not connected');
      return false;
    }

    socketRef.current.emit('send-command', {
      clientId,
      command
    });

        const commandLog: LogMessage = {
      timestamp: new Date().toISOString(),
      clientId: 'system',
      level: 'debug',
      message: `Command sent to ${clientId}: ${command}`,
      id: uuidv4()
    };

    setLogs(prev => [commandLog, ...prev]);
    return true;
  }, [isConnected]);

    const simulateLog = useCallback((level: LogMessage['level'] = 'info', message: string = 'Test message') => {
    if (!isConnected) return;

    const testClientId = clients.length > 0 ? clients[0].id : 'test-client';
    const logData = {
      id: uuidv4(),
      clientId: testClientId,
      message,
      level,
      timestamp: new Date().toISOString()
    };

    setLogs(prevLogs => [...prevLogs, logData]);
  }, [isConnected, clients]);

    const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isConnected,
    viewerId,
    clients,
    logs,
    error,
    sendCommand,
    simulateLog,
    clearLogs
  };
}

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const websocketState = useWebSocketState();

  return React.createElement(
    WebSocketContext.Provider,
    { value: websocketState },
    children
  );
};

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
