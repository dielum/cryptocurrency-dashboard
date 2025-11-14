import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DataService } from './data.service';

/**
 * CryptoController
 *
 * REST API endpoints for cryptocurrency data.
 * Provides initial and historical data for the frontend.
 *
 * Endpoints:
 * - GET /api/crypto/pairs: List all available trading pairs
 * - GET /api/crypto/prices/:symbol: Get recent prices for a specific pair
 * - GET /api/crypto/hourly-averages/:symbol: Get hourly averages for a specific pair
 * - GET /api/crypto/all: Get all data (pairs, current prices, hourly averages)
 * - GET /api/crypto/stats: Get database statistics
 */
@Controller('api/crypto')
export class CryptoController {
  private readonly logger = new Logger(CryptoController.name);

  constructor(private readonly dataService: DataService) {}

  /**
   * Get all available cryptocurrency pairs
   *
   * @returns Array of crypto pairs
   *
   * Example response:
   * [
   *   { id: "uuid", symbol: "ETH/USDC", name: "Ethereum/USDC", isActive: true },
   *   { id: "uuid", symbol: "ETH/USDT", name: "Ethereum/USDT", isActive: true }
   * ]
   */
  @Get('pairs')
  async getPairs() {
    try {
      this.logger.log('Fetching all crypto pairs');
      const pairs = await this.dataService.getAllPairs();
      return {
        success: true,
        data: pairs,
        count: pairs.length,
      };
    } catch (error) {
      this.logger.error(
        'Error fetching pairs',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch crypto pairs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recent prices for a specific cryptocurrency pair
   *
   * @param symbol The trading pair symbol (e.g., "ETH/USDC")
   * @param limit Maximum number of prices to return (default: 100)
   * @returns Array of recent prices
   *
   * Example: GET /api/crypto/prices/ETH%2FUSDC?limit=50
   */
  @Get('prices/:symbol')
  async getPrices(
    @Param('symbol') symbol: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const priceLimit = limit ? parseInt(limit, 10) : 100;
      this.logger.log(`Fetching ${priceLimit} prices for ${symbol}`);

      const prices = await this.dataService.getRecentPrices(symbol, priceLimit);

      if (prices.length === 0) {
        throw new HttpException(
          `No prices found for symbol ${symbol}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: {
          symbol,
          prices,
          count: prices.length,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Error fetching prices for ${symbol}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch prices',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get hourly averages for a specific cryptocurrency pair
   *
   * @param symbol The trading pair symbol (e.g., "ETH/USDC")
   * @param hours Number of hours to look back (default: 24)
   * @returns Array of hourly averages
   *
   * Example: GET /api/crypto/hourly-averages/ETH%2FUSDC?hours=48
   */
  @Get('hourly-averages/:symbol')
  async getHourlyAverages(
    @Param('symbol') symbol: string,
    @Query('hours') hours?: string,
  ) {
    try {
      const hoursBack = hours ? parseInt(hours, 10) : 24;
      this.logger.log(`Fetching ${hoursBack} hourly averages for ${symbol}`);

      const averages = await this.dataService.getHourlyAverages(
        symbol,
        hoursBack,
      );

      return {
        success: true,
        data: {
          symbol,
          averages,
          count: averages.length,
          hoursBack,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching hourly averages for ${symbol}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch hourly averages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get complete data for all cryptocurrency pairs
   * Includes pairs, current prices, and hourly averages
   *
   * This is the primary endpoint for initial frontend load
   *
   * @param hours Number of hours of historical data (default: 24)
   * @returns Complete dataset for all pairs
   *
   * Example response:
   * {
   *   "ETH/USDC": {
   *     pair: { symbol: "ETH/USDC", ... },
   *     currentPrice: { price: 2500.50, ... },
   *     hourlyAverages: [...]
   *   },
   *   "ETH/USDT": { ... }
   * }
   */
  @Get('all')
  async getAllData(@Query('hours') hours?: string) {
    try {
      const hoursBack = hours ? parseInt(hours, 10) : 24;
      this.logger.log(`Fetching complete data for last ${hoursBack} hours`);

      const pairs = await this.dataService.getAllPairs();
      const result: Record<string, any> = {};

      // Fetch data for each pair in parallel
      await Promise.all(
        pairs.map(async (pair) => {
          const cryptoData = await this.dataService.getCryptoData(
            pair.symbol,
            hoursBack,
          );
          result[pair.symbol] = cryptoData;
        }),
      );

      return {
        success: true,
        data: result,
        pairCount: pairs.length,
        hoursBack,
      };
    } catch (error) {
      this.logger.error(
        'Error fetching all crypto data',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch crypto data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get database statistics
   * Useful for monitoring and debugging
   *
   * @returns Database record counts
   */
  @Get('stats')
  async getStats() {
    try {
      this.logger.log('Fetching database statistics');
      const stats = await this.dataService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(
        'Error fetching stats',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        'Failed to fetch statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
