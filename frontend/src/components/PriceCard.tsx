/**
 * PriceCard Component
 *
 * Displays current price and basic info for a cryptocurrency pair
 * This is a presentational component that only receives and displays data
 */

import type { CryptoData, HourlyAverage } from '../types/crypto';

interface PriceCardProps {
  data: CryptoData;
  currentPrice?: number;
  lastUpdate?: string;
  latestHourlyAverage?: HourlyAverage;
}

export const PriceCard = ({
  data,
  currentPrice,
  lastUpdate,
  latestHourlyAverage,
}: PriceCardProps) => {
  const { pair } = data;

  const displayPrice = currentPrice ?? data.currentPrice?.price ?? 0;
  const displayLastUpdate =
    lastUpdate ?? data.currentPrice?.timestamp ?? new Date().toISOString();
  const hourlyAverage = latestHourlyAverage ?? data.latestHourlyAverage;

  const formatPrice = (price: number): string => {
    if (price < 1) {
      return price.toFixed(6);
    } else if (price < 100) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{pair.symbol}</h3>
          <p className="mt-1 text-sm text-gray-600">{pair.name}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          ${formatPrice(displayPrice)}
        </div>
      </div>

      <div className="pt-4 space-y-2 text-sm border-t border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">Last Update:</span>
          <span className="font-medium text-gray-900">
            {new Date(displayLastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {hourlyAverage && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h4 className="mb-2 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            Last Hour Average
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-semibold text-indigo-600">
                ${formatPrice(hourlyAverage.average)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High:</span>
              <span className="font-medium text-green-600">
                ${formatPrice(hourlyAverage.high)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-red-600">
                ${formatPrice(hourlyAverage.low)}
              </span>
            </div>

            <div className="flex justify-between pt-1 mt-1 text-gray-500 border-t border-gray-100">
              <span>Hour:</span>
              <span>
                {new Date(hourlyAverage.hour).toLocaleString(undefined, {
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
