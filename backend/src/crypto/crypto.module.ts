import { Module, OnModuleInit } from '@nestjs/common';
import { DataService } from './data.service';

/**
 * CryptoModule
 *
 * Feature module that encapsulates all cryptocurrency-related functionality.
 * This module handles data management for cryptocurrency trading pairs,
 * prices, and hourly averages.
 *
 * Services:
 * - DataService: Core business logic for crypto data operations
 *
 * Future additions:
 * - FinnhubService: WebSocket connection to Finnhub API
 * - ScheduledTasks: Periodic calculations and data cleanup
 *
 * The module implements OnModuleInit to initialize cryptocurrency pairs
 * when the application starts up.
 */
@Module({
  providers: [DataService],
  exports: [DataService],
})
export class CryptoModule implements OnModuleInit {
  constructor(private readonly dataService: DataService) {}

  /**
   * Initialize module
   * Ensures all required cryptocurrency pairs exist in the database
   */
  async onModuleInit() {
    await this.dataService.initializePairs();
  }
}

