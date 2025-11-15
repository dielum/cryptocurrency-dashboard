import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceCard } from './PriceCard';
import type { CryptoData, HourlyAverage } from '../types/crypto';

describe('PriceCard', () => {
  const mockCryptoData: CryptoData = {
    pair: {
      id: '1',
      symbol: 'ETH/USDC',
      name: 'Ethereum to USD Coin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    currentPrice: {
      id: '1',
      pairId: '1',
      price: 2500.5,
      volume: 100.5,
      timestamp: '2024-01-01T00:00:00Z',
    },
    hourlyAverages: [],
    latestHourlyAverage: null,
    recentPrices: [],
  };

  it('should render cryptocurrency pair symbol', () => {
    render(<PriceCard data={mockCryptoData} />);

    expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
  });

  it('should display current price from data', () => {
    render(<PriceCard data={mockCryptoData} />);

    expect(screen.getByText(/2500\.50/)).toBeInTheDocument();
  });

  it('should display price from currentPrice prop when provided', () => {
    render(<PriceCard data={mockCryptoData} currentPrice={2600.0} />);

    expect(screen.getByText(/2600\.00/)).toBeInTheDocument();
  });

  it('should display last update timestamp', () => {
    render(<PriceCard data={mockCryptoData} />);

    expect(screen.getByText(/Last Update:/)).toBeInTheDocument();
  });

  it('should display last update from lastUpdate prop when provided', () => {
    const customTimestamp = '2024-01-01T12:30:00Z';
    render(
      <PriceCard data={mockCryptoData} lastUpdate={customTimestamp} />,
    );

    const lastUpdateText = screen.getByText(/Last Update:/).nextElementSibling;
    expect(lastUpdateText).toBeInTheDocument();
  });

  it('should display hourly average when provided', () => {
    const hourlyAverage: HourlyAverage = {
      id: '1',
      pairId: '1',
      hour: '2024-01-01T00:00:00Z',
      average: 2500.0,
      high: 2510.0,
      low: 2490.0,
      count: 100,
    };

    render(
      <PriceCard
        data={mockCryptoData}
        latestHourlyAverage={hourlyAverage}
      />,
    );

    expect(screen.getByText(/Last Hour Average/)).toBeInTheDocument();
    expect(screen.getByText(/2500\.00/)).toBeInTheDocument();
    expect(screen.getByText(/High:/)).toBeInTheDocument();
    expect(screen.getByText(/Low:/)).toBeInTheDocument();
  });

  it('should display hourly average from data when prop not provided', () => {
    const dataWithAverage: CryptoData = {
      ...mockCryptoData,
      latestHourlyAverage: {
        id: '1',
        pairId: '1',
        hour: '2024-01-01T00:00:00Z',
        average: 2500.0,
        high: 2510.0,
        low: 2490.0,
        count: 100,
      },
    };

    render(<PriceCard data={dataWithAverage} />);

    expect(screen.getByText(/Last Hour Average/)).toBeInTheDocument();
  });

  it('should handle missing current price', () => {
    const dataWithoutPrice: CryptoData = {
      ...mockCryptoData,
      currentPrice: undefined,
    };

    render(<PriceCard data={dataWithoutPrice} />);

    expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
  });

  it('should display pair name', () => {
    render(<PriceCard data={mockCryptoData} />);

    expect(screen.getByText('Ethereum to USD Coin')).toBeInTheDocument();
  });
});

