/**
 * Finnhub WebSocket Message Interfaces
 *
 * Type definitions for messages received from Finnhub WebSocket API
 * Documentation: https://finnhub.io/docs/api/websocket-trades
 */

/**
 * Trade data from Finnhub
 */
export interface IFinnhubTrade {
  /** Symbol - e.g., "BINANCE:ETHUSDC" */
  s: string;
  /** Price */
  p: number;
  /** Timestamp in milliseconds */
  t: number;
  /** Volume */
  v: number;
  /** Trade conditions (array of trade conditions) */
  c?: string[];
}

/**
 * Message received from Finnhub WebSocket
 */
export interface IFinnhubMessage {
  /** Message type - "trade" for price updates, "ping" for keepalive */
  type: string;
  /** Trade data array (only present for "trade" type) */
  data?: IFinnhubTrade[];
}

/**
 * Subscription message to send to Finnhub
 */
export interface IFinnhubSubscription {
  /** Action type - "subscribe" or "unsubscribe" */
  type: 'subscribe' | 'unsubscribe';
  /** Symbol to subscribe/unsubscribe - e.g., "BINANCE:ETHUSDC" */
  symbol: string;
}

/**
 * Mapping of our symbols to Finnhub symbols
 */
export const SYMBOL_MAPPING: Record<string, string> = {
  'ETH/USDC': 'BINANCE:ETHUSDC',
  'ETH/USDT': 'BINANCE:ETHUSDT',
  'ETH/BTC': 'BINANCE:ETHBTC',
};

/**
 * Reverse mapping from Finnhub symbols to our symbols
 */
export const REVERSE_SYMBOL_MAPPING: Record<string, string> = {
  'BINANCE:ETHUSDC': 'ETH/USDC',
  'BINANCE:ETHUSDT': 'ETH/USDT',
  'BINANCE:ETHBTC': 'ETH/BTC',
};
