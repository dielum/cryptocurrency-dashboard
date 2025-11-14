/**
 * PriceCard Component
 *
 * Displays current price and basic info for a cryptocurrency pair
 */

import { useEffect, useState } from 'react';
import type { CryptoData, PriceUpdate } from '../types/crypto';

interface PriceCardProps {
  data: CryptoData;
  latestUpdate?: PriceUpdate;
}

export const PriceCard = ({ data, latestUpdate }: PriceCardProps) => {
  const [currentPrice, setCurrentPrice] = useState(data.currentPrice?.price || 0);
  const [lastUpdate, setLastUpdate] = useState(data.currentPrice?.timestamp || new Date().toISOString());
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isFlashing, setIsFlashing] = useState(false);

  const { pair } = data;

  // Update price when new update arrives for this symbol
  useEffect(() => {
    if (latestUpdate && latestUpdate.symbol === pair.symbol) {
      const oldPrice = currentPrice;
      const newPrice = latestUpdate.price;

      setCurrentPrice(newPrice);
      setLastUpdate(latestUpdate.timestamp);

      // Determine price direction
      if (newPrice > oldPrice) {
        setPriceChange('up');
      } else if (newPrice < oldPrice) {
        setPriceChange('down');
      }

      // Flash animation
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
    }
  }, [latestUpdate, pair.symbol, currentPrice]);

  // Initialize from data
  useEffect(() => {
    if (data.currentPrice) {
      setCurrentPrice(data.currentPrice.price);
      setLastUpdate(data.currentPrice.timestamp);
    }
  }, [data.currentPrice]);

  const formatPrice = (price: number): string => {
    if (price < 1) {
      return price.toFixed(6);
    } else if (price < 100) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  const getPriceColorClass = () => {
    if (priceChange === 'up') return 'text-green-600';
    if (priceChange === 'down') return 'text-red-600';
    return 'text-gray-900';
  };

  const getBackgroundClass = () => {
    if (isFlashing) {
      if (priceChange === 'up') return 'bg-green-50 border-green-200';
      if (priceChange === 'down') return 'bg-red-50 border-red-200';
    }
    return 'bg-white border-gray-200';
  };

  return (
    <div
      className={`p-6 rounded-lg border shadow-sm transition-all duration-300 ${getBackgroundClass()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {pair.symbol}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {pair.name}
          </p>
        </div>
        {priceChange !== 'neutral' && (
          <span className={`text-2xl ${priceChange === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className={`text-3xl font-bold ${getPriceColorClass()}`}>
          ${formatPrice(currentPrice)}
        </div>
      </div>

      <div className="pt-4 space-y-2 text-sm border-t border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">Last Update:</span>
          <span className="font-medium text-gray-900">
            {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {data.latestHourlyAverage && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h4 className="mb-2 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            Last Hour Average
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-semibold text-indigo-600">
                ${formatPrice(data.latestHourlyAverage.average)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High:</span>
              <span className="font-medium text-green-600">
                ${formatPrice(data.latestHourlyAverage.high)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-red-600">
                ${formatPrice(data.latestHourlyAverage.low)}
              </span>
            </div>
         
            <div className="flex justify-between pt-1 mt-1 text-gray-500 border-t border-gray-100">
              <span>Hour:</span>
              <span>
                {new Date(data.latestHourlyAverage.hour).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
