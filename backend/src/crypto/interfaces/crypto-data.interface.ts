/**
 * Crypto Data Interfaces
 *
 * Type definitions for cryptocurrency data structures
 * used throughout the application
 */

/**
 * Represents a cryptocurrency trading pair
 */
export interface ICryptoPair {
  id: string;
  symbol: string; // e.g., "ETH/USDC"
  name: string; // e.g., "Ethereum to USD Coin"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a single price data point
 */
export interface IPrice {
  id: string;
  pairId: string;
  price: number;
  volume?: number | null;
  timestamp: Date;
}

/**
 * Represents hourly statistics for a cryptocurrency pair
 */
export interface IHourlyAverage {
  id: string;
  pairId: string;
  hour: Date;
  average: number;
  high: number;
  low: number;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Complete cryptocurrency data with current price and averages
 */
export interface ICryptoData {
  pair: ICryptoPair;
  currentPrice?: IPrice;
  hourlyAverages: IHourlyAverage[];
  latestHourlyAverage?: IHourlyAverage | null;
}

/**
 * Price statistics for a given time period
 */
export interface IPriceStats {
  average: number;
  high: number;
  low: number;
  count: number;
  firstPrice: number;
  lastPrice: number;
  change: number; // Percentage change
  changeAmount: number; // Absolute change
}
