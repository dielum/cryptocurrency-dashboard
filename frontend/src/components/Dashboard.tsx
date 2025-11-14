/**
 * Dashboard Component
 *
 * Main dashboard that displays cryptocurrency data with real-time updates
 */

import { useEffect, useState } from 'react';
import { getAllCryptoData, getRecentPrices } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { PriceCard } from './PriceCard';
import { PriceChart } from './PriceChart';
import { ConnectionStatus } from './ConnectionStatus';
import type { AllCryptoData } from '../types/crypto';

export const Dashboard = () => {
  const [cryptoData, setCryptoData] = useState<AllCryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<Record<string, Array<{ price: number; timestamp: string }>>>({});

  const { isConnected, priceUpdates, finnhubStatus } = useWebSocket();

  // Fetch initial data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllCryptoData(24);
        setCryptoData(data);
        
        // Load historical prices for charts
        const symbols = Object.keys(data);
        const pricesPromises = symbols.map(async (symbol) => {
          try {
            const prices = await getRecentPrices(symbol, 50);
            return { symbol, prices };
          } catch (err) {
            console.log(`No historical data for ${symbol}`);
            return { symbol, prices: [] };
          }
        });
        
        const pricesData = await Promise.all(pricesPromises);
        const pricesMap: Record<string, Array<{ price: number; timestamp: string }>> = {};
        pricesData.forEach(({ symbol, prices }) => {
          pricesMap[symbol] = prices;
        });
        
        setHistoricalPrices(pricesMap);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch crypto data:', err);
        setError('Failed to load cryptocurrency data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 text-lg">Loading cryptocurrency data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 text-lg mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cryptoData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">No data available</p>
      </div>
    );
  }

  const symbols = Object.keys(cryptoData);
  const latestUpdate = priceUpdates[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cryptocurrency Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Real-time price tracking</p>
          </div>
          <ConnectionStatus
            isWebSocketConnected={isConnected}
            finnhubStatus={finnhubStatus}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {symbols.map((symbol) => (
            <PriceCard
              key={symbol}
              data={cryptoData[symbol]}
              latestUpdate={latestUpdate}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {symbols.map((symbol) => (
              <PriceChart
                key={symbol}
                symbol={symbol}
                priceUpdates={priceUpdates}
                initialPrices={historicalPrices[symbol] || []}
              />
            ))}
          </div>
        </div>

        {/* Recent Updates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Updates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceUpdates.slice(0, 10).map((update, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {update.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                      ${update.price.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {update.volume?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {priceUpdates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
