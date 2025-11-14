import { Module, OnModuleInit } from '@nestjs/common';
import { DataService } from './data.service';
import { FinnhubService } from './finnhub.service';
import { CryptoController } from './crypto.controller';
import { CryptoGateway } from './crypto.gateway';

/**
 * CryptoModule
 *
 * Feature module that encapsulates all cryptocurrency-related functionality.
 * This module handles data management for cryptocurrency trading pairs,
 * prices, and hourly averages, as well as real-time data fetching from Finnhub.
 *
 * Controllers:
 * - CryptoController: REST API endpoints for initial and historical data
 *
 * Providers:
 * - DataService: Core business logic for crypto data operations
 * - FinnhubService: WebSocket connection to Finnhub API for real-time prices
 * - CryptoGateway: Socket.IO gateway for real-time data broadcasting to clients
 *
 * Architecture:
 * 1. Client loads page → HTTP GET to CryptoController → Gets historical data
 * 2. Client connects → Socket.IO to CryptoGateway → Establishes WebSocket
 * 3. Finnhub sends data → FinnhubService → DataService (saves) + CryptoGateway (broadcasts)
 * 4. Frontend receives → Real-time updates via Socket.IO
 *
 * Future additions:
 * - ScheduledTasks: Periodic calculations and data cleanup
 *
 * The module implements OnModuleInit to initialize cryptocurrency pairs
 * when the application starts up. The FinnhubService will automatically
 * connect to Finnhub WebSocket and start receiving real-time price updates.
 */
@Module({
  controllers: [CryptoController],
  providers: [DataService, FinnhubService, CryptoGateway],
  exports: [DataService, FinnhubService, CryptoGateway],
})
export class CryptoModule implements OnModuleInit {
  constructor(private readonly dataService: DataService) {}

  /**
   * Initialize module
   * Ensures all required cryptocurrency pairs exist in the database
   * FinnhubService will automatically connect via its own OnModuleInit
   * CryptoGateway will initialize WebSocket server automatically
   */
  async onModuleInit() {
    await this.dataService.initializePairs();
  }
}
