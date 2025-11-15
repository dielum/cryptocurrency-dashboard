/**
 * PriceChart Component
 *
 * Displays a line chart of recent price updates using recharts
 * Shows only the last 5 minutes of data
 */

import { useEffect, useState, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PriceUpdate, RecentPrice } from '../types/crypto';

interface PriceChartProps {
  symbol: string;
  priceUpdates: PriceUpdate[];
  initialPrices?: RecentPrice[]; // Prices from last 5 minutes from initial load
}

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: string;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export const PriceChart = ({
  symbol,
  priceUpdates,
  initialPrices = [],
}: PriceChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const intervalRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Filter data to only show last 5 minutes
  const filterLast5Minutes = (data: ChartDataPoint[]): ChartDataPoint[] => {
    const now = Date.now();
    const fiveMinutesAgo = now - FIVE_MINUTES_MS;

    return data.filter((point) => {
      const pointTime = new Date(point.timestamp).getTime();
      return pointTime >= fiveMinutesAgo;
    });
  };

  // Initialize with historical data from API (last 5 minutes)
  useEffect(() => {
    if (initialPrices.length > 0 && !initializedRef.current) {
      const now = Date.now();
      const fiveMinutesAgo = now - FIVE_MINUTES_MS;

      const historical = initialPrices
        .filter((price) => {
          const priceTime = new Date(price.timestamp).getTime();
          return priceTime >= fiveMinutesAgo;
        })
        .map((price) => ({
          time: new Date(price.timestamp).toLocaleTimeString(),
          price: price.price,
          timestamp: price.timestamp,
        }));

      if (historical.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChartData(historical);
        initializedRef.current = true;
      }
    }
  }, [initialPrices]);

  // Add new real-time updates
  useEffect(() => {
    const newUpdates = priceUpdates
      .filter((update) => update.symbol === symbol)
      .map((update) => ({
        time: new Date(update.timestamp).toLocaleTimeString(),
        price: update.price,
        timestamp: update.timestamp,
      }));

    if (newUpdates.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChartData((prev) => {
        // Combine previous data with new updates, avoiding duplicates
        const combined = [...prev];
        
        newUpdates.forEach((newUpdate) => {
          const exists = combined.some(
            (item) => item.timestamp === newUpdate.timestamp
          );
          if (!exists) {
            combined.push(newUpdate);
          }
        });

        // Filter to keep only last 5 minutes
        return filterLast5Minutes(combined);
      });
    }
  }, [priceUpdates, symbol]);

  // Clean up old data every 10 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setChartData((prev) => filterLast5Minutes(prev));
    }, 10000); // Every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {symbol}
        </h3>
        <p className="text-gray-600">Waiting for real-time price data...</p>
        <p className="text-sm text-gray-500 mt-2">
          Chart will populate as WebSocket updates arrive
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {symbol}
        </h3>
        <span className="text-xs text-gray-500">
          Last 5 minutes
        </span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
            domain={['auto', 'auto']}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => ['$' + value.toFixed(6), 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 text-xs text-gray-500 text-center">
        {chartData.length} data points in last 5 minutes
      </div>
    </div>
  );
};
