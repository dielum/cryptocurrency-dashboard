import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataService } from './data.service';
import { PrismaService } from '../prisma/prisma.service';
import { PriceUpdateDto } from './dto';

describe('DataService', () => {
  let service: DataService;
  let mockPrismaService: {
    cryptoPair: {
      upsert: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    price: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    hourlyAverage: {
      upsert: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    // Create fresh mocks for each test
    mockPrismaService = {
      cryptoPair: {
        upsert: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      price: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      hourlyAverage: {
        upsert: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    // Create service manually with mock
    service = new DataService(mockPrismaService as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializePairs', () => {
    it('should initialize all cryptocurrency pairs', async () => {
      mockPrismaService.cryptoPair.upsert.mockResolvedValue({});

      await service.initializePairs();

      expect(mockPrismaService.cryptoPair.upsert).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.cryptoPair.upsert).toHaveBeenCalledWith({
        where: { symbol: 'ETH/USDC' },
        update: { isActive: true },
        create: {
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
        },
      });
    });
  });

  describe('getActivePairs', () => {
    it('should return all active pairs', async () => {
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

      mockPrismaService.cryptoPair.findMany.mockResolvedValue(mockPairs);

      const result = await service.getActivePairs();

      expect(result).toEqual(mockPairs);
      expect(mockPrismaService.cryptoPair.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { symbol: 'asc' },
      });
    });
  });

  describe('getPairBySymbol', () => {
    it('should return a pair by symbol', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);

      const result = await service.getPairBySymbol('ETH/USDC');

      expect(result).toEqual(mockPair);
      expect(mockPrismaService.cryptoPair.findUnique).toHaveBeenCalledWith({
        where: { symbol: 'ETH/USDC' },
      });
    });

    it('should return null if pair not found', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      const result = await service.getPairBySymbol('INVALID/PAIR');

      expect(result).toBeNull();
    });
  });

  describe('savePrice', () => {
    it('should save a price successfully', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const priceData: PriceUpdateDto = {
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      const mockPrice = {
        id: '1',
        pairId: '1',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.create.mockResolvedValue(mockPrice);

      const result = await service.savePrice(priceData);

      expect(result).toEqual(mockPrice);
      expect(mockPrismaService.price.create).toHaveBeenCalledWith({
        data: {
          pairId: '1',
          price: 2500.5,
          volume: 100.5,
          timestamp: priceData.timestamp,
        },
      });
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      const priceData: PriceUpdateDto = {
        symbol: 'INVALID/PAIR',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date(),
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(service.savePrice(priceData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.savePrice(priceData)).rejects.toThrow(
        'Cryptocurrency pair INVALID/PAIR not found',
      );
    });
  });

  describe('getCurrentPrice', () => {
    it('should return the most recent price', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockPrice = {
        id: '1',
        pairId: '1',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findFirst.mockResolvedValue(mockPrice);

      const result = await service.getCurrentPrice('ETH/USDC');

      expect(result).toEqual(mockPrice);
      expect(mockPrismaService.price.findFirst).toHaveBeenCalledWith({
        where: { pairId: '1' },
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentPrice('INVALID/PAIR')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRecentPricesByMinutes', () => {
    it('should return prices from the last N minutes', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockPrices = [
        {
          id: '1',
          pairId: '1',
          price: 2500.5,
          volume: 100.5,
          timestamp: new Date('2024-01-01T00:04:00Z'),
        },
        {
          id: '2',
          pairId: '1',
          price: 2501.0,
          volume: 101.0,
          timestamp: new Date('2024-01-01T00:05:00Z'),
        },
      ];

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findMany.mockResolvedValue(mockPrices);

      const result = await service.getRecentPricesByMinutes('ETH/USDC', 5);

      expect(result).toEqual(mockPrices);
      expect(mockPrismaService.price.findMany).toHaveBeenCalledWith({
        where: {
          pairId: '1',
          timestamp: {
            gte: expect.any(Date) as Date,
          },
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should use default 5 minutes if not specified', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findMany.mockResolvedValue([]);

      await service.getRecentPricesByMinutes('ETH/USDC');

      expect(mockPrismaService.price.findMany).toHaveBeenCalled();
      const callArgs = mockPrismaService.price.findMany.mock.calls[0]?.[0] as {
        where: { timestamp: { gte: Date } };
      };
      expect(callArgs?.where?.timestamp?.gte).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(
        service.getRecentPricesByMinutes('INVALID/PAIR', 5),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateHourlyAverage', () => {
    it('should calculate and save hourly average', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockPrices = [
        {
          id: '1',
          pairId: '1',
          price: 2500.0,
          volume: 100.0,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: '2',
          pairId: '1',
          price: 2510.0,
          volume: 101.0,
          timestamp: new Date('2024-01-01T10:30:00Z'),
        },
        {
          id: '3',
          pairId: '1',
          price: 2490.0,
          volume: 99.0,
          timestamp: new Date('2024-01-01T10:45:00Z'),
        },
      ];

      const mockHourlyAverage = {
        id: '1',
        pairId: '1',
        hour: new Date('2024-01-01T10:00:00Z'),
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 3,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findMany.mockResolvedValue(mockPrices);
      mockPrismaService.hourlyAverage.upsert.mockResolvedValue(
        mockHourlyAverage,
      );

      const targetHour = new Date('2024-01-01T10:30:00Z');
      const result = await service.calculateHourlyAverage(
        'ETH/USDC',
        targetHour,
      );

      expect(result).toEqual(mockHourlyAverage);
      expect(mockPrismaService.price.findMany).toHaveBeenCalled();
      expect(mockPrismaService.hourlyAverage.upsert).toHaveBeenCalledWith({
        where: {
          unique_pair_hour: {
            pairId: '1',
            hour: expect.any(Date) as Date,
          },
        },
        update: {
          average: 2500.0,
          high: 2510.0,
          low: 2490.0,
          count: 3,
        },
        create: {
          pairId: '1',
          hour: expect.any(Date) as Date,
          average: 2500.0,
          high: 2510.0,
          low: 2490.0,
          count: 3,
        },
      });
    });

    it('should return null if no prices found for the hour', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findMany.mockResolvedValue([]);

      const result = await service.calculateHourlyAverage('ETH/USDC');

      expect(result).toBeNull();
      expect(mockPrismaService.hourlyAverage.upsert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateHourlyAverage('INVALID/PAIR'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHourlyAverages', () => {
    it('should return hourly averages for a pair', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockAverages = [
        {
          id: '1',
          pairId: '1',
          hour: new Date('2024-01-01T10:00:00Z'),
          average: 2500.0,
          high: 2510.0,
          low: 2490.0,
          count: 100,
        },
      ];

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.hourlyAverage.findMany.mockResolvedValue(mockAverages);

      const result = await service.getHourlyAverages('ETH/USDC', 24);

      expect(result).toEqual(mockAverages);
      expect(mockPrismaService.hourlyAverage.findMany).toHaveBeenCalledWith({
        where: {
          pairId: '1',
          hour: { gte: expect.any(Date) as Date },
        },
        orderBy: { hour: 'asc' },
      });
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(service.getHourlyAverages('INVALID/PAIR')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLatestHourlyAverage', () => {
    it('should return the latest hourly average', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockAverage = {
        id: '1',
        pairId: '1',
        hour: new Date('2024-01-01T10:00:00Z'),
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.hourlyAverage.findFirst.mockResolvedValue(mockAverage);

      const result = await service.getLatestHourlyAverage('ETH/USDC');

      expect(result).toEqual(mockAverage);
      expect(mockPrismaService.hourlyAverage.findFirst).toHaveBeenCalledWith({
        where: { pairId: '1' },
        orderBy: { hour: 'desc' },
      });
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(
        service.getLatestHourlyAverage('INVALID/PAIR'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCryptoData', () => {
    it('should return complete crypto data', async () => {
      const mockPair = {
        id: '1',
        symbol: 'ETH/USDC',
        name: 'Ethereum to USD Coin',
        isActive: true,
      };

      const mockCurrentPrice = {
        id: '1',
        pairId: '1',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      const mockHourlyAverages = [
        {
          id: '1',
          pairId: '1',
          hour: new Date('2024-01-01T10:00:00Z'),
          average: 2500.0,
          high: 2510.0,
          low: 2490.0,
          count: 100,
        },
      ];

      const mockLatestHourlyAverage = {
        id: '1',
        pairId: '1',
        hour: new Date('2024-01-01T10:00:00Z'),
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
      };

      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(mockPair);
      mockPrismaService.price.findFirst.mockResolvedValue(mockCurrentPrice);
      mockPrismaService.hourlyAverage.findMany.mockResolvedValue(
        mockHourlyAverages,
      );
      mockPrismaService.hourlyAverage.findFirst.mockResolvedValue(
        mockLatestHourlyAverage,
      );

      const result = await service.getCryptoData('ETH/USDC', 24);

      expect(result).toEqual({
        pair: mockPair,
        currentPrice: mockCurrentPrice,
        hourlyAverages: mockHourlyAverages,
        latestHourlyAverage: mockLatestHourlyAverage,
      });
    });

    it('should throw NotFoundException if pair does not exist', async () => {
      mockPrismaService.cryptoPair.findUnique.mockResolvedValue(null);

      await expect(service.getCryptoData('INVALID/PAIR')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllPairs', () => {
    it('should return all active pairs', async () => {
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
        {
          id: '3',
          symbol: 'ETH/BTC',
          name: 'Ethereum to Bitcoin',
          isActive: true,
        },
      ];

      mockPrismaService.cryptoPair.findMany.mockResolvedValue(mockPairs);

      const result = await service.getAllPairs();

      expect(result).toEqual(mockPairs);
      expect(mockPrismaService.cryptoPair.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { symbol: 'asc' },
      });
    });
  });
});
