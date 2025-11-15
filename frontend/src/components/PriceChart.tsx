/**
 * PriceChart Component
 *
 * Displays a line chart of recent price updates using recharts
 * Shows only the last 5 minutes of data
 * This is a presentational component that calculates chart data from props
 */

import { useMemo } from 'react';
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
  currentTime: number;
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
  currentTime,
}: PriceChartProps) => {
  const chartData = useMemo(() => {
    const now = currentTime;
    const fiveMinutesAgo = now - FIVE_MINUTES_MS;

    // Combine initial prices and real-time updates
    const allDataPoints: ChartDataPoint[] = [];

    // Add initial prices
    initialPrices.forEach((price) => {
      const priceTime = new Date(price.timestamp).getTime();
      if (priceTime >= fiveMinutesAgo) {
        allDataPoints.push({
          time: new Date(price.timestamp).toLocaleTimeString(),
          price: price.price,
          timestamp: price.timestamp,
        });
      }
    });

    // Add real-time updates for this symbol
    priceUpdates
      .filter((update) => update.symbol === symbol)
      .forEach((update) => {
        const updateTime = new Date(update.timestamp).getTime();
        if (updateTime >= fiveMinutesAgo) {
          allDataPoints.push({
            time: new Date(update.timestamp).toLocaleTimeString(),
            price: update.price,
            timestamp: update.timestamp,
          });
        }
      });

    // Remove duplicates based on timestamp and sort by timestamp
    const uniqueDataPoints = Array.from(
      new Map(allDataPoints.map((point) => [point.timestamp, point])).values(),
    ).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return uniqueDataPoints;
  }, [symbol, priceUpdates, initialPrices, currentTime]);

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-gray-900">{symbol}</h3>
        <p className="text-gray-600">Waiting for real-time price data...</p>
        <p className="mt-2 text-sm text-gray-500">
          Chart will populate as WebSocket updates arrive
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{symbol}</h3>
        <span className="text-xs text-gray-500">Last 5 minutes</span>
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

      <div className="mt-3 text-xs text-center text-gray-500">
        {chartData.length} data points in last 5 minutes
      </div>
    </div>
  );
};
