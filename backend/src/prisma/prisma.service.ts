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
}
