import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceUpdateDto } from './dto';
import { ICryptoData, IPriceStats } from './interfaces/crypto-data.interface';

/**
 * DataService
 *
 * Core business logic service for cryptocurrency data management.
 * Handles all database operations related to crypto pairs, prices, and hourly averages.
 *
 * Responsibilities:
 * - Initialize and manage cryptocurrency pairs
 * - Store incoming price data from external sources
 * - Calculate hourly statistics and averages
 * - Provide historical data and analytics
 * - Data cleanup and maintenance
 */
@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize cryptocurrency pairs in database
   * Creates or updates the default trading pairs we're tracking
   *
   * This should be called on application startup to ensure
   * all required pairs exist in the database
   */
  async initializePairs(): Promise<void> {
    this.logger.log('Initializing cryptocurrency pairs...');

    const pairs = [
      { symbol: 'ETH/USDC', name: 'Ethereum to USD Coin' },
      { symbol: 'ETH/USDT', name: 'Ethereum to Tether' },
      { symbol: 'ETH/BTC', name: 'Ethereum to Bitcoin' },
    ];

    for (const pair of pairs) {
      await this.prisma.cryptoPair.upsert({
        where: { symbol: pair.symbol },
        update: { isActive: true }, // Reactivate if it was disabled
        create: {
          symbol: pair.symbol,
          name: pair.name,
          isActive: true,
        },
      });

      this.logger.log(`✓ Initialized ${pair.symbol}`);
    }

    this.logger.log('All cryptocurrency pairs initialized successfully');
  }

  /**
   * Get all active cryptocurrency pairs
   *
   * @returns Array of active crypto pairs
   */
  async getActivePairs() {
    return await this.prisma.cryptoPair.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' },
    });
  }

  /**
   * Get a specific cryptocurrency pair by symbol
   *
   * @param symbol - Trading pair symbol (e.g., "ETH/USDC")
   * @returns Crypto pair or null if not found
   */
  async getPairBySymbol(symbol: string) {
    return await this.prisma.cryptoPair.findUnique({
      where: { symbol },
    });
  }

  /**
   * Save a new price data point
   * Called when receiving real-time price updates from Finnhub
   *
   * @param priceData - Price update data
   * @returns Created price record
   * @throws NotFoundException if the crypto pair doesn't exist
   */
  async savePrice(priceData: PriceUpdateDto) {
    // Find the cryptocurrency pair
    const pair = await this.getPairBySymbol(priceData.symbol);

    if (!pair) {
      throw new NotFoundException(
        `Cryptocurrency pair ${priceData.symbol} not found`,
      );
    }

    // Create price record
    const price = await this.prisma.price.create({
      data: {
        pairId: pair.id,
        price: priceData.price,
        volume: priceData.volume,
        timestamp: priceData.timestamp,
      },
    });

    this.logger.debug(
      `Saved price for ${priceData.symbol}: ${priceData.price}`,
    );

    return price;
  }

  /**
   * Get the most recent price for a cryptocurrency pair
   *
   * @param symbol - Trading pair symbol
   * @returns Most recent price or null
   */
  async getCurrentPrice(symbol: string) {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    const price = await this.prisma.price.findFirst({
      where: { pairId: pair.id },
      orderBy: { timestamp: 'desc' },
    });

    return price;
  }

  /**
   * Get recent prices for a cryptocurrency pair
   * Useful for displaying short-term price history
   *
   * @param symbol - Trading pair symbol
   * @param limit - Maximum number of prices to return (default: 100)
   * @returns Array of recent prices
   */
  async getRecentPrices(symbol: string, limit: number = 100) {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    return await this.prisma.price.findMany({
      where: { pairId: pair.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Calculate and save hourly average for a cryptocurrency pair
   * Should be called every hour or when requested
   *
   * @param symbol - Trading pair symbol
   * @param hour - Specific hour to calculate (defaults to current hour)
   * @returns Created or updated hourly average
   */
  async calculateHourlyAverage(symbol: string, hour?: Date) {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    // Determine the hour to calculate
    const targetHour = hour ? new Date(hour) : new Date();
    targetHour.setMinutes(0, 0, 0); // Round to start of hour

    const hourEnd = new Date(targetHour);
    hourEnd.setHours(hourEnd.getHours() + 1);

    // Get all prices for this hour
    const prices = await this.prisma.price.findMany({
      where: {
        pairId: pair.id,
        timestamp: {
          gte: targetHour,
          lt: hourEnd,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (prices.length === 0) {
      this.logger.warn(
        `No prices found for ${symbol} in hour ${targetHour.toISOString()}`,
      );
      return null;
    }

    // Calculate statistics
    const priceValues = prices.map((p) => p.price);
    const sum = priceValues.reduce((a, b) => a + b, 0);
    const average = sum / priceValues.length;
    const high = Math.max(...priceValues);
    const low = Math.min(...priceValues);

    // Save or update hourly average
    const hourlyAverage = await this.prisma.hourlyAverage.upsert({
      where: {
        unique_pair_hour: {
          pairId: pair.id,
          hour: targetHour,
        },
      },
      update: {
        average,
        high,
        low,
        count: prices.length,
      },
      create: {
        pairId: pair.id,
        hour: targetHour,
        average,
        high,
        low,
        count: prices.length,
      },
    });

    this.logger.log(
      `Calculated hourly average for ${symbol} at ${targetHour.toISOString()}: ${average.toFixed(2)} (${prices.length} data points)`,
    );

    return hourlyAverage;
  }

  /**
   * Get hourly averages for a cryptocurrency pair
   *
   * @param symbol - Trading pair symbol
   * @param hours - Number of hours to retrieve (default: 24)
   * @returns Array of hourly averages
   */
  async getHourlyAverages(symbol: string, hours: number = 24) {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return await this.prisma.hourlyAverage.findMany({
      where: {
        pairId: pair.id,
        hour: { gte: cutoffTime },
      },
      orderBy: { hour: 'asc' },
    });
  }

  /**
   * Get complete cryptocurrency data
   * Includes current price and hourly averages
   *
   * @param symbol - Trading pair symbol
   * @param hoursHistory - Number of hours of history to include (default: 24)
   * @returns Complete crypto data
   */
  async getCryptoData(
    symbol: string,
    hoursHistory: number = 24,
  ): Promise<ICryptoData> {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    const [currentPrice, hourlyAverages] = await Promise.all([
      this.getCurrentPrice(symbol),
      this.getHourlyAverages(symbol, hoursHistory),
    ]);

    return {
      pair,
      currentPrice: currentPrice ?? undefined,
      hourlyAverages,
    };
  }

  /**
   * Get all cryptocurrency data for all active pairs
   * Used for initial data load on frontend
   *
   * @param hoursHistory - Number of hours of history to include
   * @returns Array of complete crypto data for all pairs
   */
  async getAllCryptoData(hoursHistory: number = 24): Promise<ICryptoData[]> {
    const pairs = await this.getActivePairs();

    const dataPromises = pairs.map((pair) =>
      this.getCryptoData(pair.symbol, hoursHistory),
    );

    return await Promise.all(dataPromises);
  }

  /**
   * Calculate price statistics for a time period
   *
   * @param symbol - Trading pair symbol
   * @param startDate - Start of the period
   * @param endDate - End of the period
   * @returns Price statistics
   */
  async getPriceStats(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<IPriceStats | null> {
    const pair = await this.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundException(`Cryptocurrency pair ${symbol} not found`);
    }

    const prices = await this.prisma.price.findMany({
      where: {
        pairId: pair.id,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (prices.length === 0) {
      return null;
    }

    const priceValues = prices.map((p) => p.price);
    const sum = priceValues.reduce((a, b) => a + b, 0);
    const average = sum / priceValues.length;
    const high = Math.max(...priceValues);
    const low = Math.min(...priceValues);
    const firstPrice = prices[0].price;
    const lastPrice = prices[prices.length - 1].price;
    const changeAmount = lastPrice - firstPrice;
    const change = (changeAmount / firstPrice) * 100;

    return {
      average,
      high,
      low,
      count: prices.length,
      firstPrice,
      lastPrice,
      change,
      changeAmount,
    };
  }

  /**
   * Clean old price data
   * Removes price records older than specified days
   * Should be called periodically (e.g., daily via cron job)
   *
   * @param days - Number of days to retain data
   * @returns Number of deleted records
   */
  async cleanOldPrices(days: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.price.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    this.logger.log(
      `Cleaned ${result.count} price records older than ${days} days`,
    );

    return result.count;
  }

  /**
   * Clean old hourly averages
   * Removes hourly average records older than specified days
   *
   * @param days - Number of days to retain data
   * @returns Number of deleted records
   */
  async cleanOldHourlyAverages(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.hourlyAverage.deleteMany({
      where: {
        hour: { lt: cutoffDate },
      },
    });

    this.logger.log(
      `Cleaned ${result.count} hourly average records older than ${days} days`,
    );

    return result.count;
  }

  /**
   * Get database statistics for monitoring
   *
   * @returns Statistics object with counts
   */
  async getStatistics() {
    const [pairs, prices, hourlyAverages, recentPrices] = await Promise.all([
      this.prisma.cryptoPair.count({ where: { isActive: true } }),
      this.prisma.price.count(),
      this.prisma.hourlyAverage.count(),
      this.prisma.price.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      activePairs: pairs,
      totalPrices: prices,
      totalHourlyAverages: hourlyAverages,
      pricesLast24Hours: recentPrices,
    };
  }
}
