import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * CryptoGateway
 *
 * WebSocket gateway for real-time cryptocurrency data streaming.
 * Uses Socket.IO to broadcast price updates and hourly averages to connected clients.
 *
 * Events emitted to clients:
 * - 'priceUpdate': Sent whenever a new price is received from Finnhub
 * - 'hourlyAverage': Sent when new hourly averages are calculated
 * - 'connectionStatus': Connection status updates (Finnhub connection)
 *
 * Events received from clients:
 * - 'subscribe': Client requests to subscribe to specific pairs
 * - 'unsubscribe': Client requests to unsubscribe from specific pairs
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/crypto',
})
export class CryptoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CryptoGateway.name);
  private connectedClients: Set<string> = new Set();
  // Track which symbols each client is subscribed to
  private clientSubscriptions: Map<string, Set<string>> = new Map();

  /**
   * Called after the gateway is initialized
   */
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    this.logger.log(`WebSocket server listening on namespace: /crypto`);
  }

  /**
   * Called when a client connects
   */
  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.clientSubscriptions.set(client.id, new Set());

    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);

    // Send welcome message with connection info
    client.emit('connected', {
      message: 'Connected to crypto data stream',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Called when a client disconnects
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.clientSubscriptions.delete(client.id);

    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  /**
   * Handle client subscription to specific crypto pairs
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { symbols: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { symbols } = data;
    const clientSubs = this.clientSubscriptions.get(client.id);

    if (clientSubs) {
      symbols.forEach((symbol) => clientSubs.add(symbol));
      this.logger.log(
        `Client ${client.id} subscribed to: ${symbols.join(', ')}`,
      );

      client.emit('subscribed', {
        symbols,
        message: 'Successfully subscribed',
      });
    }
  }

  /**
   * Handle client unsubscription from specific crypto pairs
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { symbols: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { symbols } = data;
    const clientSubs = this.clientSubscriptions.get(client.id);

    if (clientSubs) {
      symbols.forEach((symbol) => clientSubs.delete(symbol));
      this.logger.log(
        `Client ${client.id} unsubscribed from: ${symbols.join(', ')}`,
      );

      client.emit('unsubscribed', {
        symbols,
        message: 'Successfully unsubscribed',
      });
    }
  }

  /**
   * Broadcast a price update to all connected clients
   * Called by FinnhubService when new price data arrives
   *
   * @param priceData The price update to broadcast
   */
  broadcastPriceUpdate(priceData: {
    symbol: string;
    price: number;
    volume?: number;
    timestamp: Date;
  }) {
    const { symbol } = priceData;

    // Send to all connected clients (or filter by subscription)
    this.server.emit('priceUpdate', {
      ...priceData,
      timestamp: priceData.timestamp.toISOString(),
    });

    this.logger.debug(
      `Broadcasted price update: ${symbol} = ${priceData.price}`,
    );
  }

  /**
   * Broadcast hourly average data to all connected clients
   * Called by scheduled tasks when hourly averages are calculated
   *
   * @param averageData The hourly average data to broadcast
   */
  broadcastHourlyAverage(averageData: {
    symbol: string;
    hour: Date;
    average: number;
    high: number;
    low: number;
    count: number;
  }) {
    this.server.emit('hourlyAverage', {
      ...averageData,
      hour: averageData.hour.toISOString(),
    });

    this.logger.log(
      `Broadcasted hourly average: ${averageData.symbol} = ${averageData.average}`,
    );
  }

  /**
   * Broadcast Finnhub connection status updates
   *
   * @param status The connection status
   */
  broadcastConnectionStatus(status: {
    connected: boolean;
    message: string;
    timestamp?: Date;
  }) {
    this.server.emit('connectionStatus', {
      ...status,
      timestamp: (status.timestamp || new Date()).toISOString(),
    });

    this.logger.log(`Broadcasted connection status: ${status.message}`);
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Check if there are any connected clients
   */
  hasConnectedClients(): boolean {
    return this.connectedClients.size > 0;
  }

  /**
   * Get all client subscriptions (for debugging/monitoring)
   */
  getClientSubscriptions(): Map<string, Set<string>> {
    return this.clientSubscriptions;
  }
}
