/**
 * API Service
 *
 * Handles all REST API calls to the backend
 */

import axios from 'axios';
import type { AllCryptoData, CryptoPair, ApiResponse } from '../types/crypto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all cryptocurrency pairs
 */
export const getAllPairs = async (): Promise<CryptoPair[]> => {
  const response = await api.get<ApiResponse<CryptoPair[]>>('/crypto/pairs');
  return response.data.data;
};

/**
 * Get complete data for all pairs
 * Includes current prices and hourly averages
 */
export const getAllCryptoData = async (hours: number = 24): Promise<AllCryptoData> => {
  const response = await api.get<ApiResponse<AllCryptoData>>('/crypto/all', {
    params: { hours },
  });
  return response.data.data;
};

/**
 * Get recent prices for a specific symbol
 */
export const getRecentPrices = async (symbol: string, limit: number = 50) => {
  const response = await api.get<ApiResponse<{
    symbol: string;
    prices: Array<{ price: number; timestamp: string }>;
  }>>(`/crypto/prices/${encodeURIComponent(symbol)}`, {
    params: { limit },
  });
  return response.data.data.prices;
};

/**
 * Get database statistics
 */
export const getStats = async () => {
  const response = await api.get<ApiResponse<{
    activePairs: number;
    totalPrices: number;
    totalHourlyAverages: number;
    pricesLast24Hours: number;
  }>>('/crypto/stats');
  return response.data.data;
};

export default api;

