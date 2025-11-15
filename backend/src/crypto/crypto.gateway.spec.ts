import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CryptoGateway } from './crypto.gateway';
import { Server, Socket } from 'socket.io';

describe('CryptoGateway', () => {
  let gateway: CryptoGateway;
  let mockServer: {
    emit: ReturnType<typeof vi.fn>;
  };
  let mockSocket: {
    id: string;
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockServer = {
      emit: vi.fn(),
    };

    mockSocket = {
      id: 'test-client-id',
      emit: vi.fn(),
    };

    gateway = new CryptoGateway();
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');

      gateway.afterInit();

      expect(logSpy).toHaveBeenCalledWith('WebSocket Gateway initialized');
    });
  });

  describe('handleConnection', () => {
    it('should add client to connected clients', () => {
      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(gateway['connectedClients'].has('test-client-id')).toBe(true);
    });

    it('should emit welcome message to client', () => {
      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to crypto data stream',
        clientId: 'test-client-id',
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connected clients', () => {
      gateway['connectedClients'].add('test-client-id');

      gateway.handleDisconnect(mockSocket as unknown as Socket);

      expect(gateway['connectedClients'].has('test-client-id')).toBe(false);
    });
  });

  describe('broadcastPriceUpdate', () => {
    it('should broadcast price update to all clients', () => {
      const priceData = {
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      gateway.broadcastPriceUpdate(priceData);

      expect(mockServer.emit).toHaveBeenCalledWith('priceUpdate', {
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle price update without volume', () => {
      const priceData = {
        symbol: 'ETH/USDT',
        price: 2600.0,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      gateway.broadcastPriceUpdate(priceData);

      expect(mockServer.emit).toHaveBeenCalledWith('priceUpdate', {
        symbol: 'ETH/USDT',
        price: 2600.0,
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('broadcastConnectionStatus', () => {
    it('should broadcast connection status', () => {
      const status = {
        connected: true,
        message: 'Connected to Finnhub',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      gateway.broadcastConnectionStatus(status);

      expect(mockServer.emit).toHaveBeenCalledWith('connectionStatus', {
        connected: true,
        message: 'Connected to Finnhub',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should use current timestamp if not provided', () => {
      const status = {
        connected: false,
        message: 'Disconnected from Finnhub',
      };

      gateway.broadcastConnectionStatus(status);

      expect(mockServer.emit).toHaveBeenCalledWith('connectionStatus', {
        connected: false,
        message: 'Disconnected from Finnhub',
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('broadcastHourlyAverage', () => {
    it('should broadcast hourly average update', () => {
      const averageData = {
        symbol: 'ETH/USDC',
        id: '1',
        pairId: '1',
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
        hour: new Date('2024-01-01T10:00:00Z'),
      };

      gateway.broadcastHourlyAverage(averageData);

      expect(mockServer.emit).toHaveBeenCalledWith('hourlyAverage', {
        symbol: 'ETH/USDC',
        id: '1',
        pairId: '1',
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
        hour: '2024-01-01T10:00:00.000Z',
        timestamp: expect.any(String) as string,
      });
    });
  });
});
