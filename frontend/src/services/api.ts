/**
 * API Service
 *
 * Handles all REST API calls to the backend
 */

import axios from 'axios';
import type { AllCryptoData, ApiResponse } from '../types/crypto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get initial exchange rates for all pairs
 *
 * This is the only REST endpoint needed. After the initial load,
 * all updates come through WebSocket in real-time.
 *
 * @returns Initial exchange rates with current prices and latest hourly averages
 */
export const getExchangeRates = async (): Promise<AllCryptoData> => {
  const response = await api.get<ApiResponse<AllCryptoData>>(
    '/crypto/exchange_rates',
  );
  return response.data.data;
};

export default api;
