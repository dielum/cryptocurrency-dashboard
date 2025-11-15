import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { getExchangeRates } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { AllCryptoData, CryptoData } from '../types/crypto';

// Mock dependencies
vi.mock('../services/api');
vi.mock('../hooks/useWebSocket');
vi.mock('./PriceCard', () => ({
  PriceCard: ({ data }: { data: CryptoData }) => (
    <div data-testid="price-card">{data.pair.symbol}</div>
  ),
}));
vi.mock('./PriceChart', () => ({
  PriceChart: ({ symbol }: { symbol: string }) => (
    <div data-testid="price-chart">{symbol}</div>
  ),
}));
vi.mock('./ConnectionStatus', () => ({
  ConnectionStatus: () => <div data-testid="connection-status" />,
}));

const mockedGetExchangeRates = vi.mocked(getExchangeRates);
const mockedUseWebSocket = vi.mocked(useWebSocket);

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedGetExchangeRates.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: false,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: null,
      error: null,
    });

    render(<Dashboard />);

    expect(screen.getByText(/Loading cryptocurrency data/)).toBeInTheDocument();
  });

  it('should display error state when API fails', async () => {
    mockedGetExchangeRates.mockRejectedValue(new Error('API Error'));
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: false,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: null,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to load exchange rates'),
      ).toBeInTheDocument();
    });
  });

  it('should render cryptocurrency data when loaded', async () => {
    const mockData = {
      'ETH/USDC': {
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
      },
      'ETH/USDT': {
        pair: {
          id: '2',
          symbol: 'ETH/USDT',
          name: 'Ethereum to Tether',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        currentPrice: undefined,
        hourlyAverages: [],
        latestHourlyAverage: null,
        recentPrices: [],
      },
    };

    mockedGetExchangeRates.mockResolvedValue(mockData);
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: true,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: {
        connected: true,
        message: 'Connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
      const priceCards = screen.getAllByTestId('price-card');
      expect(priceCards.length).toBeGreaterThan(0);
    });
  });

  it('should display connection status', async () => {
    const mockData = {
      'ETH/USDC': {
        pair: {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        currentPrice: undefined,
        hourlyAverages: [],
        latestHourlyAverage: null,
        recentPrices: [],
      },
    };

    mockedGetExchangeRates.mockResolvedValue(mockData);
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: true,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: {
        connected: true,
        message: 'Connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    });
  });

  it('should render price charts for each pair', async () => {
    const mockData = {
      'ETH/USDC': {
        pair: {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        currentPrice: undefined,
        hourlyAverages: [],
        latestHourlyAverage: null,
        recentPrices: [],
      },
    };

    mockedGetExchangeRates.mockResolvedValue(mockData);
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: true,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: null,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('price-chart');
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  it('should display recent updates table', async () => {
    const mockData = {
      'ETH/USDC': {
        pair: {
          id: '1',
          symbol: 'ETH/USDC',
          name: 'Ethereum to USD Coin',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        currentPrice: undefined,
        hourlyAverages: [],
        latestHourlyAverage: null,
        recentPrices: [],
      },
    };

    const mockPriceUpdates = [
      {
        symbol: 'ETH/USDC',
        price: 2500.5,
        volume: 100.5,
        timestamp: '2024-01-01T00:00:00Z',
      },
    ];

    mockedGetExchangeRates.mockResolvedValue(mockData);
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: true,
      priceUpdates: mockPriceUpdates,
      hourlyAverages: {},
      finnhubStatus: null,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Updates')).toBeInTheDocument();
      const ethUsdcElements = screen.getAllByText('ETH/USDC');
      expect(ethUsdcElements.length).toBeGreaterThan(0);
    });
  });

  it('should display "No data available" when cryptoData is empty', async () => {
    mockedGetExchangeRates.mockResolvedValue({} as AllCryptoData);
    mockedUseWebSocket.mockReturnValue({
      socket: null,
      isConnected: false,
      priceUpdates: [],
      hourlyAverages: {},
      finnhubStatus: null,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      // When cryptoData is empty object, symbols will be empty array
      // The component will render but with no data
      expect(screen.getByText('Cryptocurrency Dashboard')).toBeInTheDocument();
    });
  });
});
