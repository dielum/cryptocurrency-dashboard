import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PriceChart } from './PriceChart';
import type { PriceUpdate, RecentPrice } from '../types/crypto';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: ReactNode;
    data?: unknown[];
  }) => (
    <div data-testid="line-chart" data-points={data?.length || 0}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('PriceChart', () => {
  const currentTime = Date.now();

  it('should render loading state when no data', () => {
    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={[]}
        currentTime={currentTime}
      />,
    );

    expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    expect(screen.getByText(/Waiting for real-time price data/)).toBeInTheDocument();
  });

  it('should initialize with historical data', () => {
    const initialPrices: RecentPrice[] = [
      {
        price: 2500.0,
        volume: 100.0,
        timestamp: new Date(currentTime - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      },
      {
        price: 2501.0,
        volume: 101.0,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(), // 1 minute ago
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={[]}
        initialPrices={initialPrices}
        currentTime={currentTime}
      />,
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-points', '2');
  });

  it('should display chart when price updates arrive', () => {
    const priceUpdates: PriceUpdate[] = [
      {
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(),
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={priceUpdates}
        currentTime={currentTime}
      />,
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should filter data to last 5 minutes', () => {
    const oldPrice: RecentPrice = {
      price: 2400.0,
      timestamp: new Date(currentTime - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    };

    const recentPrice: RecentPrice = {
      price: 2500.0,
      timestamp: new Date(currentTime - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    };

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={[]}
        initialPrices={[oldPrice, recentPrice]}
        currentTime={currentTime}
      />,
    );

    const lineChart = screen.getByTestId('line-chart');
    // Only recent price should be shown (within 5 minutes)
    expect(lineChart).toHaveAttribute('data-points', '1');
  });

  it('should display symbol in chart header', () => {
    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={[]}
        currentTime={currentTime}
      />,
    );

    expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
  });

  it('should display "Last 5 minutes" label', () => {
    const initialPrices: RecentPrice[] = [
      {
        price: 2500.0,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(),
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={[]}
        initialPrices={initialPrices}
        currentTime={currentTime}
      />,
    );

    expect(screen.getByText('Last 5 minutes')).toBeInTheDocument();
  });

  it('should combine initial prices and real-time updates', () => {
    const initialPrices: RecentPrice[] = [
      {
        price: 2500.0,
        timestamp: new Date(currentTime - 2 * 60 * 1000).toISOString(),
      },
    ];

    const priceUpdates: PriceUpdate[] = [
      {
        symbol: 'ETH/USDC',
        price: 2501.0,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(),
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={priceUpdates}
        initialPrices={initialPrices}
        currentTime={currentTime}
      />,
    );

    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-points', '2');
  });

  it('should remove duplicate timestamps', () => {
    const initialPrices: RecentPrice[] = [
      {
        price: 2500.0,
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    const priceUpdates: PriceUpdate[] = [
      {
        symbol: 'ETH/USDC',
        price: 2501.0,
        timestamp: '2024-01-01T00:00:00Z', // Same timestamp
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={priceUpdates}
        initialPrices={initialPrices}
        currentTime={new Date('2024-01-01T00:05:00Z').getTime()}
      />,
    );

    const lineChart = screen.getByTestId('line-chart');
    // Should only have 1 point after removing duplicate
    expect(lineChart).toHaveAttribute('data-points', '1');
  });

  it('should only show updates for the correct symbol', () => {
    const priceUpdates: PriceUpdate[] = [
      {
        symbol: 'ETH/USDC',
        price: 2500.0,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(),
      },
      {
        symbol: 'ETH/USDT',
        price: 2501.0,
        timestamp: new Date(currentTime - 1 * 60 * 1000).toISOString(),
      },
    ];

    render(
      <PriceChart
        symbol="ETH/USDC"
        priceUpdates={priceUpdates}
        currentTime={currentTime}
      />,
    );

    const lineChart = screen.getByTestId('line-chart');
    // Should only show ETH/USDC update
    expect(lineChart).toHaveAttribute('data-points', '1');
  });
});

