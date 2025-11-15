import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CryptoController } from './crypto.controller';
import { DataService } from './data.service';
import { HttpException } from '@nestjs/common';

describe('CryptoController', () => {
  let controller: CryptoController;
  let mockDataService: {
    getAllPairs: ReturnType<typeof vi.fn>;
    getCryptoData: ReturnType<typeof vi.fn>;
    getRecentPricesByMinutes: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDataService = {
      getAllPairs: vi.fn(),
      getCryptoData: vi.fn(),
      getRecentPricesByMinutes: vi.fn(),
    };

    controller = new CryptoController(
      mockDataService as unknown as DataService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExchangeRates', () => {
    it('should return exchange rates for all pairs', async () => {
      const mockPairs = [
        {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
        },
        {
          id: '2',
          symbol: 'ETH/USDT',
          name: 'Ethereum to Tether',
          isActive: true,
        },
      ];

      const mockCryptoData1 = {
        pair: mockPairs[0],
        currentPrice: {
          id: '1',
          pairId: '1',
          price: 2500.5,
          volume: 100.5,
          timestamp: new Date('2024-01-01T00:00:00Z'),
        },
        hourlyAverages: [],
        latestHourlyAverage: null,
      };

      const mockCryptoData2 = {
        pair: mockPairs[1],
        currentPrice: null,
        hourlyAverages: [],
        latestHourlyAverage: null,
      };

      const mockRecentPrices1 = [
        {
          id: '1',
          pairId: '1',
          price: 2500.5,
          volume: 100.5,
          timestamp: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      const mockRecentPrices2: never[] = [];

      mockDataService.getAllPairs.mockResolvedValue(mockPairs);
      mockDataService.getCryptoData
        .mockResolvedValueOnce(mockCryptoData1)
        .mockResolvedValueOnce(mockCryptoData2);
      mockDataService.getRecentPricesByMinutes
        .mockResolvedValueOnce(mockRecentPrices1)
        .mockResolvedValueOnce(mockRecentPrices2);

      const result = await controller.getExchangeRates();

      expect(result.success).toBe(true);
      expect(result.pairCount).toBe(2);
      expect(result.data).toHaveProperty('ETH/USDC');
      expect(result.data).toHaveProperty('ETH/USDT');
      expect(
        (result.data['ETH/USDC'] as { recentPrices: unknown[] }).recentPrices,
      ).toEqual([
        {
          price: 2500.5,
          volume: 100.5,
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ]);
      expect(
        (result.data['ETH/USDT'] as { recentPrices: unknown[] }).recentPrices,
      ).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle errors and throw HttpException', async () => {
      mockDataService.getAllPairs.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getExchangeRates()).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getExchangeRates()).rejects.toThrow(
        'Failed to fetch exchange rates',
      );
    });

    it('should return empty data when no pairs exist', async () => {
      mockDataService.getAllPairs.mockResolvedValue([]);

      const result = await controller.getExchangeRates();

      expect(result.success).toBe(true);
      expect(result.pairCount).toBe(0);
      expect(result.data).toEqual({});
    });
  });
});
