/**
 * Dashboard Component
 *
 * Main dashboard that displays cryptocurrency data with real-time updates
 */

import { useEffect, useState } from 'react';
import { getExchangeRates } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { PriceCard } from './PriceCard';
import { PriceChart } from './PriceChart';
import { ConnectionStatus } from './ConnectionStatus';
import type { AllCryptoData } from '../types/crypto';

export const Dashboard = () => {
  const [cryptoData, setCryptoData] = useState<AllCryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, priceUpdates, hourlyAverages, finnhubStatus } =
    useWebSocket();

  // Fetch initial exchange rates on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getExchangeRates();
        setCryptoData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setError('Failed to load exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 rounded-full border-t-blue-600 animate-spin" />
        <p className="mt-4 text-lg text-gray-600">
          Loading cryptocurrency data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-4 text-3xl font-bold text-red-600">Error</h2>
        <p className="mb-8 text-lg text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 text-base font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cryptoData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">No data available</p>
      </div>
    );
  }

  const symbols = Object.keys(cryptoData);

  // Get the latest price update for each symbol
  const getLatestPriceForSymbol = (symbol: string) => {
    const latestUpdate = priceUpdates.find(
      (update) => update.symbol === symbol,
    );
    return latestUpdate
      ? { price: latestUpdate.price, timestamp: latestUpdate.timestamp }
      : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mx-auto max-w-7xl">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cryptocurrency Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time price tracking
            </p>
          </div>
          <ConnectionStatus
            isWebSocketConnected={isConnected}
            finnhubStatus={finnhubStatus}
          />
        </div>
      </header>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Price Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {symbols.map((symbol) => {
            const latestPrice = getLatestPriceForSymbol(symbol);
            return (
              <PriceCard
                key={symbol}
                data={cryptoData[symbol]}
                currentPrice={latestPrice?.price}
                lastUpdate={latestPrice?.timestamp}
                latestHourlyAverage={hourlyAverages[symbol]}
              />
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Price Charts (Last 5 minutes)
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {symbols.map((symbol) => (
              <PriceChart
                key={symbol}
                symbol={symbol}
                priceUpdates={priceUpdates}
                initialPrices={cryptoData[symbol].recentPrices}
              />
            ))}
          </div>
        </div>

        {/* Recent Updates Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Updates
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceUpdates.slice(0, 10).map((update, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {update.symbol}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-green-600 whitespace-nowrap">
                      ${update.price.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 whitespace-nowrap">
                      {update.volume?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500 whitespace-nowrap">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {priceUpdates.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Waiting for real-time updates...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
