import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { io } from 'socket.io-client';
import type {
  PriceUpdate,
  HourlyAverage,
  ConnectionStatus,
} from '../types/crypto';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
  id: 'test-socket-id',
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
  default: vi.fn(() => mockSocket),
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.disconnect.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize socket connection', () => {
    renderHook(() => useWebSocket());

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      }),
    );
  });

  it('should set isConnected to true on connect', async () => {
    const { result } = renderHook(() => useWebSocket());

    // Simulate connection
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'connect',
    )?.[1] as () => void;

    if (connectHandler) {
      act(() => {
        connectHandler();
      });
    }

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should set isConnected to false on disconnect', async () => {
    const { result } = renderHook(() => useWebSocket());

    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'connect',
    )?.[1] as () => void;
    if (connectHandler) {
      act(() => {
        connectHandler();
      });
    }

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'disconnect',
    )?.[1] as () => void;
    if (disconnectHandler) {
      act(() => {
        disconnectHandler();
      });
    }

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('should handle price updates', async () => {
    const { result } = renderHook(() => useWebSocket());

    const priceUpdateHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'priceUpdate',
    )?.[1] as (data: PriceUpdate) => void;

    const mockPriceUpdate: PriceUpdate = {
      symbol: 'ETH/USDC',
      price: 2500.5,
      volume: 100.5,
      timestamp: '2024-01-01T00:00:00Z',
    };

    if (priceUpdateHandler) {
      act(() => {
        priceUpdateHandler(mockPriceUpdate);
      });
    }

    await waitFor(() => {
      expect(result.current.priceUpdates.length).toBeGreaterThan(0);
      expect(result.current.priceUpdates[0].symbol).toBe('ETH/USDC');
      expect(result.current.priceUpdates[0].price).toBe(2500.5);
    });
  });

  it('should handle hourly average updates', async () => {
    const { result } = renderHook(() => useWebSocket());

    const hourlyAverageHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'hourlyAverage',
    )?.[1] as (
      data: HourlyAverage & { symbol: string; timestamp: string },
    ) => void;

    const mockHourlyAverage = {
      symbol: 'ETH/USDC',
      id: '1',
      pairId: '1',
      hour: '2024-01-01T00:00:00Z',
      average: 2500.0,
      high: 2510.0,
      low: 2490.0,
      count: 100,
      timestamp: '2024-01-01T00:00:00Z',
    };

    if (hourlyAverageHandler) {
      act(() => {
        hourlyAverageHandler(mockHourlyAverage);
      });
    }

    await waitFor(() => {
      expect(result.current.hourlyAverages['ETH/USDC']).toBeDefined();
      expect(result.current.hourlyAverages['ETH/USDC'].average).toBe(2500.0);
      expect(result.current.hourlyAverages['ETH/USDC'].high).toBe(2510.0);
      expect(result.current.hourlyAverages['ETH/USDC'].low).toBe(2490.0);
    });
  });

  it('should handle connection status updates', async () => {
    const { result } = renderHook(() => useWebSocket());

    const connectionStatusHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) =>
        Array.isArray(call) && call[0] === 'connectionStatus',
    )?.[1] as (data: ConnectionStatus) => void;

    const mockStatus: ConnectionStatus = {
      connected: true,
      message: 'Connected to Finnhub',
      timestamp: '2024-01-01T00:00:00Z',
    };

    if (connectionStatusHandler) {
      act(() => {
        connectionStatusHandler(mockStatus);
      });
    }

    await waitFor(() => {
      expect(result.current.finnhubStatus).toEqual(mockStatus);
    });
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useWebSocket());

    const errorHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'error',
    )?.[1] as (error: Error) => void;

    if (errorHandler) {
      act(() => {
        errorHandler(new Error('Connection error'));
      });
    }

    await waitFor(() => {
      expect(result.current.error).toBe('Connection error occurred');
    });
  });

  it('should limit price updates to 100', async () => {
    const { result } = renderHook(() => useWebSocket());

    const priceUpdateHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'priceUpdate',
    )?.[1] as (data: PriceUpdate) => void;

    // Send 110 updates
    if (priceUpdateHandler) {
      act(() => {
        for (let i = 0; i < 110; i++) {
          priceUpdateHandler({
            symbol: 'ETH/USDC',
            price: 2500 + i,
            timestamp: `2024-01-01T00:00:${i}Z`,
          });
        }
      });
    }

    await waitFor(() => {
      expect(result.current.priceUpdates.length).toBeLessThanOrEqual(100);
    });
  });

  it('should update hourly average for specific symbol', async () => {
    const { result } = renderHook(() => useWebSocket());

    const hourlyAverageHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'hourlyAverage',
    )?.[1] as (
      data: HourlyAverage & { symbol: string; timestamp: string },
    ) => void;

    // Update for ETH/USDC
    if (hourlyAverageHandler) {
      act(() => {
        hourlyAverageHandler({
          symbol: 'ETH/USDC',
          id: '1',
          pairId: '1',
          hour: '2024-01-01T00:00:00Z',
          average: 2500.0,
          high: 2510.0,
          low: 2490.0,
          count: 100,
          timestamp: '2024-01-01T00:00:00Z',
        });
      });
    }

    // Update for ETH/USDT
    if (hourlyAverageHandler) {
      act(() => {
        hourlyAverageHandler({
          symbol: 'ETH/USDT',
          id: '2',
          pairId: '2',
          hour: '2024-01-01T00:00:00Z',
          average: 2600.0,
          high: 2610.0,
          low: 2590.0,
          count: 100,
          timestamp: '2024-01-01T00:00:00Z',
        });
      });
    }

    await waitFor(() => {
      expect(result.current.hourlyAverages['ETH/USDC']).toBeDefined();
      expect(result.current.hourlyAverages['ETH/USDT']).toBeDefined();
      expect(result.current.hourlyAverages['ETH/USDC'].average).toBe(2500.0);
      expect(result.current.hourlyAverages['ETH/USDT'].average).toBe(2600.0);
    });
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket());

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should return socket instance', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.socket).toBe(mockSocket);
  });

  it('should handle server welcome message', async () => {
    const { result } = renderHook(() => useWebSocket());

    const connectedHandler = mockSocket.on.mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === 'connected',
    )?.[1] as (data: unknown) => void;

    const mockWelcome = {
      message: 'Connected to crypto data stream',
      clientId: 'test-id',
      timestamp: '2024-01-01T00:00:00Z',
    };

    if (connectedHandler) {
      act(() => {
        connectedHandler(mockWelcome);
      });
    }

    // Should not throw or cause errors
    await waitFor(() => {
      expect(result.current.socket).toBeDefined();
    });
  });
});
