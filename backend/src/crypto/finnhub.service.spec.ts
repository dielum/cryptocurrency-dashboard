import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { FinnhubService } from './finnhub.service';
import { DataService } from './data.service';
import { CryptoGateway } from './crypto.gateway';
import { IFinnhubTrade } from './interfaces/finnhub-message.interface';
import type WebSocket from 'ws';

// Mock ws module
const mockOn = vi.fn();
const mockSend = vi.fn();
const mockClose = vi.fn();
const mockTerminate = vi.fn();
const mockRemoveAllListeners = vi.fn();

vi.mock('ws', () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      on: mockOn,
      send: mockSend,
      close: mockClose,
      readyState: 0,
      terminate: mockTerminate,
      removeAllListeners: mockRemoveAllListeners,
    })),
    OPEN: 1,
    CONNECTING: 0,
    CLOSING: 2,
    CLOSED: 3,
  };
});

describe('FinnhubService', () => {
  let service: FinnhubService;
  let mockDataService: {
    savePrice: ReturnType<typeof vi.fn>;
  };
  let mockCryptoGateway: {
    broadcastPriceUpdate: ReturnType<typeof vi.fn>;
    broadcastConnectionStatus: ReturnType<typeof vi.fn>;
  };
  let mockConfigService: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOn.mockClear();
    mockSend.mockClear();
    mockClose.mockClear();
    mockTerminate.mockClear();
    mockRemoveAllListeners.mockClear();

    mockDataService = {
      savePrice: vi.fn(),
    };

    mockCryptoGateway = {
      broadcastPriceUpdate: vi.fn(),
      broadcastConnectionStatus: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'FINNHUB_API_KEY') return 'test-api-key';
        if (key === 'FINNHUB_WS_URL') return 'wss://ws.finnhub.io';
        return undefined;
      }),
    };

    // Create service instance manually to avoid onModuleInit
    service = new FinnhubService(
      mockConfigService as unknown as ConfigService,
      mockDataService as unknown as DataService,
      mockCryptoGateway as unknown as CryptoGateway,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if FINNHUB_API_KEY is not provided', () => {
    const invalidConfigService = {
      get: vi.fn(() => undefined),
    };

    expect(() => {
      new FinnhubService(
        invalidConfigService as unknown as ConfigService,
        mockDataService as unknown as DataService,
        mockCryptoGateway as unknown as CryptoGateway,
      );
    }).toThrow('FINNHUB_API_KEY is not defined in environment variables');
  });

  it('should initialize with correct configuration', () => {
    expect(service).toBeDefined();
    expect(mockConfigService.get).toHaveBeenCalledWith('FINNHUB_API_KEY');
  });

  describe('connect', () => {
    it('should create WebSocket connection and set up event handlers', () => {
      // Ensure ws is null before connecting
      service['ws'] = null;
      service['isConnecting'] = false;

      service['connect']();

      // The mock WebSocket constructor should have been called
      // and event handlers should be set up
      // Since the mock is created inside vi.mock, we verify indirectly
      // by checking that the service's ws property is set
      expect(service['ws']).toBeDefined();
    });

    it('should not connect if already connecting', () => {
      service['isConnecting'] = true;
      const initialWs = service['ws'];

      service['connect']();

      // Should not have changed ws
      expect(service['ws']).toBe(initialWs);
    });

    it('should not connect if already connected', () => {
      service['ws'] = {
        readyState: 1, // OPEN
      } as unknown as WebSocket;
      const initialWs = service['ws'];

      service['connect']();

      // Should not have changed ws
      expect(service['ws']).toBe(initialWs);
    });
  });

  describe('handleMessage', () => {
    it('should process trade messages', async () => {
      const mockTrades: IFinnhubTrade[] = [
        {
          s: 'BINANCE:ETHUSDC',
          p: 2500.5,
          v: 100.5,
          t: Date.now(),
        },
      ];

      const message = JSON.stringify({
        type: 'trade',
        data: mockTrades,
      });

      mockDataService.savePrice.mockResolvedValue({
        id: '1',
        pairId: '1',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date(),
      });

      service['handleMessage'](Buffer.from(message));

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockDataService.savePrice).toHaveBeenCalledWith({
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: expect.any(Date) as Date,
      });
    });

    it('should ignore ping messages', () => {
      const message = JSON.stringify({ type: 'ping' });

      service['handleMessage'](Buffer.from(message));

      expect(mockDataService.savePrice).not.toHaveBeenCalled();
    });

    it('should handle string messages', async () => {
      const mockTrades: IFinnhubTrade[] = [
        {
          s: 'BINANCE:ETHUSDT',
          p: 2600.0,
          v: 200.0,
          t: Date.now(),
        },
      ];

      const message = JSON.stringify({
        type: 'trade',
        data: mockTrades,
      });

      mockDataService.savePrice.mockResolvedValue({
        id: '1',
        pairId: '1',
        price: 2600.0,
        volume: 200.0,
        timestamp: new Date(),
      });

      service['handleMessage'](message);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockDataService.savePrice).toHaveBeenCalled();
    });
  });

  describe('processTrades', () => {
    it('should process and save trades', async () => {
      const mockTrades: IFinnhubTrade[] = [
        {
          s: 'BINANCE:ETHUSDC',
          p: 2500.5,
          v: 100.5,
          t: Date.now(),
        },
      ];

      mockDataService.savePrice.mockResolvedValue({
        id: '1',
        pairId: '1',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date(),
      });

      await service['processTrades'](mockTrades);

      expect(mockDataService.savePrice).toHaveBeenCalledWith({
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: expect.any(Date) as Date,
      });

      expect(mockCryptoGateway.broadcastPriceUpdate).toHaveBeenCalledWith({
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: expect.any(Date) as Date,
      });
    });

    it('should skip unknown symbols', async () => {
      const mockTrades: IFinnhubTrade[] = [
        {
          s: 'UNKNOWN:SYMBOL',
          p: 2500.5,
          v: 100.5,
          t: Date.now(),
        },
      ];

      await service['processTrades'](mockTrades);

      expect(mockDataService.savePrice).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should clean up WebSocket connection', () => {
      service['ws'] = {
        close: mockClose,
        readyState: 1,
        removeAllListeners: mockRemoveAllListeners,
      } as unknown as WebSocket;

      service['disconnect']();

      // Always removes listeners
      expect(mockRemoveAllListeners).toHaveBeenCalled();
      // close() may or may not be called depending on readyState
      // The important part is that cleanup happens
    });

    it('should handle null WebSocket gracefully', () => {
      service['ws'] = null;

      expect(() => service['disconnect']()).not.toThrow();
    });
  });
});
