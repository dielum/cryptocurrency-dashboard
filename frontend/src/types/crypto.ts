/**
 * Type definitions for cryptocurrency data
 */

export interface CryptoPair {
  id: string;
  symbol: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  pairId: string;
  price: number;
  volume: number | null;
  timestamp: string;
}

export interface HourlyAverage {
  id: string;
  pairId: string;
  hour: string;
  average: number;
  high: number;
  low: number;
  count: number;
}

export interface RecentPrice {
  price: number;
  volume?: number | null;
  timestamp: string;
}

export interface CryptoData {
  pair: CryptoPair;
  currentPrice?: Price;
  hourlyAverages: HourlyAverage[];
  latestHourlyAverage?: HourlyAverage | null;
  recentPrices?: RecentPrice[]; // Prices from last 5 minutes
}

export interface AllCryptoData {
  [symbol: string]: CryptoData;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

