import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService
 *
 * Extends PrismaClient to integrate with NestJS lifecycle hooks.
 * This service handles database connection and disconnection automatically.
 *
 * Features:
 * - Automatic connection on module initialization
 * - Automatic disconnection on module destruction
 * - Built-in logging for database operations
 * - Utility methods for data management
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'], // Log warnings and errors only
    });
  }

  /**
   * Connect to database when module initializes
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
    }
  }

  /**
   * Clean old data from the database
   * Removes price records older than specified number of days
   *
   * @param days - Number of days to retain data (default: 7)
   * @returns Number of deleted records
   */
  async cleanOldData(days: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      const result = await this.price.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(
        `Cleaned ${result.count} price records older than ${days} days`,
      );
      return result.count;
    } catch (error) {
      this.logger.error('Failed to clean old data', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   * Returns counts for all main entities
   *
   * @returns Object with entity counts
   */
  async getDatabaseStats() {
    try {
      const [pairsCount, pricesCount, hourlyAveragesCount] = await Promise.all([
        this.cryptoPair.count(),
        this.price.count(),
        this.hourlyAverage.count(),
      ]);

      return {
        pairs: pairsCount,
        prices: pricesCount,
        hourlyAverages: hourlyAveragesCount,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error);
      throw error;
    }
  }
}
