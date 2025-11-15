import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('should display connected status when WebSocket is connected', () => {
    render(<ConnectionStatus isWebSocketConnected={true} finnhubStatus={null} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    const indicator = screen.getByText('Connected').previousElementSibling;
    expect(indicator).toHaveClass('bg-green-500');
  });

  it('should display disconnected status when WebSocket is not connected', () => {
    render(<ConnectionStatus isWebSocketConnected={false} finnhubStatus={null} />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    const indicator = screen.getByText('Disconnected').previousElementSibling;
    expect(indicator).toHaveClass('bg-red-500');
  });

  it('should render connection indicator', () => {
    render(<ConnectionStatus isWebSocketConnected={true} finnhubStatus={null} />);

    const indicator = screen.getByText('Connected').previousElementSibling;
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('w-2', 'h-2', 'rounded-full');
  });
});

