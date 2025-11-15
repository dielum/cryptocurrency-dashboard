import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulerService } from './scheduler.service';
import { DataService } from './data.service';
import { CryptoGateway } from './crypto.gateway';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let mockDataService: {
    getActivePairs: ReturnType<typeof vi.fn>;
    calculateHourlyAverage: ReturnType<typeof vi.fn>;
  };
  let mockCryptoGateway: {
    broadcastHourlyAverage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDataService = {
      getActivePairs: vi.fn(),
      calculateHourlyAverage: vi.fn(),
    };

    mockCryptoGateway = {
      broadcastHourlyAverage: vi.fn(),
    };

    service = new SchedulerService(
      mockDataService as unknown as DataService,
      mockCryptoGateway as unknown as CryptoGateway,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleHourlyAverageCalculation', () => {
    it('should calculate hourly averages for all active pairs', async () => {
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

      const mockHourlyAverage1 = {
        id: '1',
        pairId: '1',
        hour: new Date('2024-01-01T10:00:00Z'),
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
      };

      const mockHourlyAverage2 = {
        id: '2',
        pairId: '2',
        hour: new Date('2024-01-01T10:00:00Z'),
        average: 2600.0,
        high: 2610.0,
        low: 2590.0,
        count: 100,
      };

      mockDataService.getActivePairs.mockResolvedValue(mockPairs);
      mockDataService.calculateHourlyAverage
        .mockResolvedValueOnce(mockHourlyAverage1)
        .mockResolvedValueOnce(mockHourlyAverage2);

      await service.handleHourlyAverageCalculation();

      expect(mockDataService.getActivePairs).toHaveBeenCalled();
      expect(mockDataService.calculateHourlyAverage).toHaveBeenCalledTimes(2);
      expect(mockDataService.calculateHourlyAverage).toHaveBeenCalledWith(
        'ETH/USDC',
      );
      expect(mockDataService.calculateHourlyAverage).toHaveBeenCalledWith(
        'ETH/USDT',
      );

      expect(mockCryptoGateway.broadcastHourlyAverage).toHaveBeenCalledTimes(2);
      expect(mockCryptoGateway.broadcastHourlyAverage).toHaveBeenCalledWith({
        symbol: 'ETH/USDC',
        id: '1',
        pairId: '1',
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
        hour: mockHourlyAverage1.hour,
      });
    });

    it('should handle pairs with no data', async () => {
      const mockPairs = [
        {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
        },
      ];

      mockDataService.getActivePairs.mockResolvedValue(mockPairs);
      mockDataService.calculateHourlyAverage.mockResolvedValue(null);

      await service.handleHourlyAverageCalculation();

      expect(mockDataService.calculateHourlyAverage).toHaveBeenCalledWith(
        'ETH/USDC',
      );
      expect(mockCryptoGateway.broadcastHourlyAverage).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockPairs = [
        {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
        },
      ];

      mockDataService.getActivePairs.mockResolvedValue(mockPairs);
      mockDataService.calculateHourlyAverage.mockRejectedValue(
        new Error('Calculation failed'),
      );

      await service.handleHourlyAverageCalculation();

      expect(mockDataService.calculateHourlyAverage).toHaveBeenCalled();
      expect(mockCryptoGateway.broadcastHourlyAverage).not.toHaveBeenCalled();
    });

    it('should handle errors when getting pairs', async () => {
      mockDataService.getActivePairs.mockRejectedValue(
        new Error('Failed to get pairs'),
      );

      await service.handleHourlyAverageCalculation();

      expect(mockDataService.getActivePairs).toHaveBeenCalled();
      expect(mockDataService.calculateHourlyAverage).not.toHaveBeenCalled();
    });
  });
});
