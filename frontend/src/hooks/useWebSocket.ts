/**
 * WebSocket Hook
 *
 * Custom React hook for Socket.IO connection and real-time updates
 */

import { useEffect, useState} from 'react';
import { io, Socket } from 'socket.io-client';
import type { PriceUpdate, ConnectionStatus, HourlyAverage } from '../types/crypto';

const WS_URL = import.meta.env.VITE_WS_URL || '/crypto';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  priceUpdates: PriceUpdate[];
  finnhubStatus: ConnectionStatus | null;
  error: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [finnhubStatus, setFinnhubStatus] = useState<ConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create Socket.IO connection
    const socketInstance = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('✓ Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('connected', (data) => {
      console.log('Server welcome message:', data);
    });

    socketInstance.on('disconnect', () => {
      console.log('✗ Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('error', (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error occurred');
    });

    // Price update handler
    socketInstance.on('priceUpdate', (data: PriceUpdate) => {
      setPriceUpdates((prev) => {
        // Keep only last 100 updates
        const updated = [data, ...prev].slice(0, 100);
        return updated;
      });
    });

    // Hourly average handler
    socketInstance.on('hourlyAverage', (data: HourlyAverage) => {
      console.log('Received hourly average:', data);
      // Can be handled separately if needed
    });

    // Connection status handler (Finnhub connection)
    socketInstance.on('connectionStatus', (data: ConnectionStatus) => {
      console.log('Finnhub status:', data);
      setFinnhubStatus(data);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    priceUpdates,
    finnhubStatus,
    error,
  };
};

