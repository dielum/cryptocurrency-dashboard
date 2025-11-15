import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * CryptoGateway
 *
 * WebSocket gateway for real-time cryptocurrency data streaming.
 * Uses Socket.IO to broadcast price updates to all connected clients.
 *
 * Events emitted to clients:
 * - 'priceUpdate': Sent whenever a new price is received from Finnhub
 * - 'connectionStatus': Connection status updates (Finnhub connection)
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

    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
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

    // Broadcast to all connected clients
    this.server.emit('priceUpdate', {
      ...priceData,
      timestamp: priceData.timestamp.toISOString(),
    });

    this.logger.debug(
      `Broadcasted price update: ${symbol} = ${priceData.price}`,
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
   * Broadcast hourly average update to all connected clients
   * Called by SchedulerService when hourly averages are calculated
   *
   * @param averageData The hourly average data to broadcast
   */
  broadcastHourlyAverage(averageData: {
    symbol: string;
    id: string;
    pairId: string;
    average: number;
    high: number;
    low: number;
    count: number;
    hour: Date;
  }) {
    this.server.emit('hourlyAverage', {
      ...averageData,
      hour: averageData.hour.toISOString(),
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Broadcasted hourly average for ${averageData.symbol}: ${averageData.average.toFixed(2)}`,
    );
  }
}
