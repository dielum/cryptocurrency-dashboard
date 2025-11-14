import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { DataService } from './data.service';
import {
  IFinnhubMessage,
  IFinnhubSubscription,
  SYMBOL_MAPPING,
  REVERSE_SYMBOL_MAPPING,
} from './interfaces/finnhub-message.interface';

/**
 * FinnhubService
 *
 * Manages WebSocket connection to Finnhub API for real-time cryptocurrency prices.
 *
 * Features:
 * - Automatic connection on module initialization
 * - Subscription to multiple cryptocurrency pairs
 * - Automatic reconnection with exponential backoff
 * - Message parsing and data persistence
 * - Graceful disconnection on module destruction
 *
 * WebSocket URL: wss://ws.finnhub.io
 * Documentation: https://finnhub.io/docs/api/websocket-trades
 */
@Injectable()
export class FinnhubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FinnhubService.name);
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  private readonly apiKey: string;
  private readonly wsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataService: DataService,
  ) {
    this.apiKey = this.configService.get<string>('FINNHUB_API_KEY') || '';
    this.wsUrl = this.configService.get<string>('FINNHUB_WS_URL') || 'wss://ws.finnhub.io';

    if (!this.apiKey) {
      throw new Error('FINNHUB_API_KEY is not defined in environment variables');
    }
  }

  /**
   * Initialize WebSocket connection when module starts
   */
  async onModuleInit() {
    this.logger.log('Initializing Finnhub WebSocket service...');
    await this.connect();
  }

  /**
   * Clean up WebSocket connection when module is destroyed
   */
  async onModuleDestroy() {
    this.logger.log('Shutting down Finnhub WebSocket service...');
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.disconnect();
  }

  /**
   * Connect to Finnhub WebSocket
   */
  private async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const url = `${this.wsUrl}?token=${this.apiKey}`;
      this.logger.log('Connecting to Finnhub WebSocket...');

      this.ws = new WebSocket(url);

      if (this.ws) {
        this.ws.on('open', () => this.handleOpen());
        this.ws.on('message', (data: WebSocket.Data) => this.handleMessage(data));
        this.ws.on('error', (error: Error) => this.handleError(error));
        this.ws.on('close', (code: number, reason: string) =>
          this.handleClose(code, reason),
        );
      }
    } catch (error) {
      this.logger.error('Failed to create WebSocket connection', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.logger.log('✓ Connected to Finnhub WebSocket');

    // Subscribe to all cryptocurrency pairs
    this.subscribeToAll();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message: IFinnhubMessage = JSON.parse(data.toString());

      // Handle ping messages (keepalive)
      if (message.type === 'ping') {
        this.logger.debug('Received ping from Finnhub');
        return;
      }

      // Handle trade data
      if (message.type === 'trade' && message.data) {
        this.processTrades(message.data);
      }
    } catch (error) {
      this.logger.error('Failed to parse message from Finnhub', error);
    }
  }

  /**
   * Process trade data and save to database
   */
  private async processTrades(trades: any[]): Promise<void> {
    for (const trade of trades) {
      try {
        // Convert Finnhub symbol to our symbol format
        const ourSymbol = REVERSE_SYMBOL_MAPPING[trade.s];

        if (!ourSymbol) {
          this.logger.warn(`Unknown symbol received: ${trade.s}`);
          continue;
        }

        // Save price to database
        await this.dataService.savePrice({
          symbol: ourSymbol,
          price: trade.p,
          volume: trade.v,
          timestamp: new Date(trade.t),
        });

        this.logger.debug(
          `Saved price: ${ourSymbol} = ${trade.p} at ${new Date(trade.t).toISOString()}`,
        );
      } catch (error) {
        this.logger.error('Failed to process trade', error);
      }
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Error): void {
    this.logger.error('WebSocket error:', error.message);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(code: number, reason: string): void {
    this.isConnecting = false;
    this.ws = null;

    const reasonStr = reason ? reason.toString() : 'No reason provided';
    this.logger.warn(`WebSocket closed. Code: ${code}, Reason: ${reasonStr}`);

    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`,
      );
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 2^attempts seconds (capped at 60 seconds)
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 60000);

    this.logger.log(
      `Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay / 1000}s...`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  private disconnect(): void {
    if (this.ws) {
      this.ws.removeAllListeners();
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      
      this.ws = null;
      this.logger.log('Disconnected from Finnhub WebSocket');
    }
  }

  /**
   * Subscribe to all cryptocurrency pairs
   */
  private subscribeToAll(): void {
    const symbols = Object.values(SYMBOL_MAPPING);

    this.logger.log(`Subscribing to ${symbols.length} cryptocurrency pairs...`);

    for (const symbol of symbols) {
      this.subscribe(symbol);
    }
  }

  /**
   * Subscribe to a specific symbol
   */
  private subscribe(finnhubSymbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn(`Cannot subscribe to ${finnhubSymbol} - WebSocket not open`);
      return;
    }

    const subscription: IFinnhubSubscription = {
      type: 'subscribe',
      symbol: finnhubSymbol,
    };

    try {
      this.ws.send(JSON.stringify(subscription));
      this.logger.log(`✓ Subscribed to ${finnhubSymbol}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${finnhubSymbol}`, error);
    }
  }

  /**
   * Unsubscribe from a specific symbol
   */
  private unsubscribe(finnhubSymbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const subscription: IFinnhubSubscription = {
      type: 'unsubscribe',
      symbol: finnhubSymbol,
    };

    try {
      this.ws.send(JSON.stringify(subscription));
      this.logger.log(`Unsubscribed from ${finnhubSymbol}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from ${finnhubSymbol}`, error);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    readyState: string;
  } {
    const readyStateMap = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED',
    };

    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws ? readyStateMap[this.ws.readyState] : 'DISCONNECTED',
    };
  }

  /**
   * Manually trigger reconnection
   */
  async reconnect(): Promise<void> {
    this.logger.log('Manual reconnection triggered');
    this.disconnect();
    this.reconnectAttempts = 0;
    await this.connect();
  }
}

