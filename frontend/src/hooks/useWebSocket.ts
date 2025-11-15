/**
 * WebSocket Hook
 *
 * Custom React hook for Socket.IO connection and real-time updates
 */

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  PriceUpdate,
  ConnectionStatus,
  HourlyAverage,
} from '../types/crypto';

const WS_URL = import.meta.env.VITE_WS_URL || '/crypto';
const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  priceUpdates: PriceUpdate[];
  hourlyAverages: Record<string, HourlyAverage>; // symbol -> latest hourly average
  finnhubStatus: ConnectionStatus | null;
  error: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [hourlyAverages, setHourlyAverages] = useState<
    Record<string, HourlyAverage>
  >({});
  const [finnhubStatus, setFinnhubStatus] = useState<ConnectionStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const cleanupIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Create Socket.IO connection
    const socketInstance = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        const now = Date.now();
        const fiveMinutesAgo = now - FIVE_MINUTES_MS;
        const dataTime = new Date(data.timestamp).getTime();

        // Only add new update if it's within the last 5 minutes
        if (dataTime < fiveMinutesAgo) {
          // If the new update is too old, just filter the existing ones
          return prev.filter((update) => {
            const updateTime = new Date(update.timestamp).getTime();
            return updateTime >= fiveMinutesAgo;
          });
        }

        // Add new update and filter out old ones (older than 5 minutes)
        const updated = [
          data,
          ...prev.filter((update) => {
            const updateTime = new Date(update.timestamp).getTime();
            return updateTime >= fiveMinutesAgo;
          }),
        ];

        return updated;
      });
    });

    // Hourly average handler
    socketInstance.on(
      'hourlyAverage',
      (data: HourlyAverage & { symbol: string; timestamp: string }) => {
        console.log('Received hourly average update for:', data.symbol);
        setHourlyAverages((prev) => ({
          ...prev,
          [data.symbol]: {
            id: data.id,
            pairId: data.pairId,
            hour: data.hour,
            average: data.average,
            high: data.high,
            low: data.low,
            count: data.count,
          },
        }));
      },
    );

    // Connection status handler (Finnhub connection)
    socketInstance.on('connectionStatus', (data: ConnectionStatus) => {
      console.log('Finnhub status:', data);
      setFinnhubStatus(data);
    });

    // Set up periodic cleanup to remove old price updates
    cleanupIntervalRef.current = setInterval(() => {
      setPriceUpdates((prev) => {
        const now = Date.now();
        const fiveMinutesAgo = now - FIVE_MINUTES_MS;

        return prev.filter((update) => {
          const updateTime = new Date(update.timestamp).getTime();
          return updateTime >= fiveMinutesAgo;
        });
      });
    }, 30000); // Clean up every 30 seconds

    // Cleanup on unmount
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    priceUpdates,
    hourlyAverages,
    finnhubStatus,
    error,
  };
};
