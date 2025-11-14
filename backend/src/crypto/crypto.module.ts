import { Module, OnModuleInit } from '@nestjs/common';
import { DataService } from './data.service';
import { FinnhubService } from './finnhub.service';

/**
 * CryptoModule
 *
 * Feature module that encapsulates all cryptocurrency-related functionality.
 * This module handles data management for cryptocurrency trading pairs,
 * prices, and hourly averages, as well as real-time data fetching from Finnhub.
 *
 * Services:
 * - DataService: Core business logic for crypto data operations
 * - FinnhubService: WebSocket connection to Finnhub API for real-time prices
 *
 * Future additions:
 * - ScheduledTasks: Periodic calculations and data cleanup
 *
 * The module implements OnModuleInit to initialize cryptocurrency pairs
 * when the application starts up. The FinnhubService will automatically
 * connect to Finnhub WebSocket and start receiving real-time price updates.
 */
@Module({
  providers: [DataService, FinnhubService],
  exports: [DataService, FinnhubService],
})
export class CryptoModule implements OnModuleInit {
  constructor(private readonly dataService: DataService) {}

  /**
   * Initialize module
   * Ensures all required cryptocurrency pairs exist in the database
   * FinnhubService will automatically connect via its own OnModuleInit
   */
  async onModuleInit() {
    await this.dataService.initializePairs();
  }
}
