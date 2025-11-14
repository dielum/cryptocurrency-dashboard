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
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isFlashing, setIsFlashing] = useState(false);

  const { pair } = data;

  // Update price when new update arrives for this symbol
  useEffect(() => {
    if (latestUpdate && latestUpdate.symbol === pair.symbol) {
      const oldPrice = currentPrice;
      const newPrice = latestUpdate.price;

      setCurrentPrice(newPrice);

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
  }, [latestUpdate, pair.symbol]);

  // Initialize from data
  useEffect(() => {
    if (data.currentPrice) {
      setCurrentPrice(data.currentPrice.price);
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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {pair.symbol}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
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

      {data.currentPrice && (
        <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Volume:</span>
            <span className="font-medium text-gray-900">
              {data.currentPrice.volume?.toFixed(4) || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Update:</span>
            <span className="font-medium text-gray-900">
              {new Date(data.currentPrice.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
