import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DataService } from './data.service';

/**
 * CryptoController
 *
 * REST API endpoint for cryptocurrency data.
 * Provides initial exchange rates for the frontend.
 * Real-time updates are handled via WebSocket.
 *
 * Endpoint:
 * - GET /api/crypto/exchange_rates: Get initial exchange rates for all pairs
 */
@Controller('api/crypto')
export class CryptoController {
  private readonly logger = new Logger(CryptoController.name);

  constructor(private readonly dataService: DataService) {}

  /**
   * Get initial exchange rates for all cryptocurrency pairs
   *
   * This endpoint provides the initial data load for the frontend.
   * After this, all updates are received via WebSocket.
   *
   * @returns Complete dataset for all pairs with current prices and latest hourly averages
   *
   * Example response:
   * {
   *   "success": true,
   *   "data": {
   *     "ETH/USDC": {
   *       "pair": { "symbol": "ETH/USDC", "name": "Ethereum/USDC", ... },
   *       "currentPrice": { "price": 2500.50, "timestamp": "...", ... },
   *       "latestHourlyAverage": { "average": 2498.23, "high": 2510, "low": 2485, ... }
   *     },
   *     "ETH/USDT": { ... },
   *     "ETH/BTC": { ... }
   *   },
   *   "pairCount": 3,
   *   "timestamp": "2024-01-01T00:00:00.000Z"
   * }
   */
  @Get('exchange_rates')
  async getExchangeRates() {
    try {
      this.logger.log('Fetching initial exchange rates');

      const pairs = await this.dataService.getAllPairs();
      const result: Record<string, any> = {};

      // Fetch current data and recent prices (last 5 minutes) for each pair in parallel
      await Promise.all(
        pairs.map(async (pair) => {
          const [cryptoData, recentPrices] = await Promise.all([
            this.dataService.getCryptoData(pair.symbol, 1),
            this.dataService.getRecentPricesByMinutes(pair.symbol, 5),
          ]);

          // Add recent prices to the response
          result[pair.symbol] = {
            ...cryptoData,
            recentPrices: recentPrices.map((price) => ({
              price: price.price,
              volume: price.volume,
              timestamp: price.timestamp.toISOString(),
            })),
          };
        }),
      );

      return {
        success: true,
        data: result,
        pairCount: pairs.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Error fetching exchange rates',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch exchange rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
