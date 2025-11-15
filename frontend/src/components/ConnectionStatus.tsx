/**
 * ConnectionStatus Component
 *
 * Displays connection status for WebSocket and Finnhub
 */

import type { ConnectionStatus as ConnectionStatusType } from '../types/crypto';

interface ConnectionStatusProps {
  isWebSocketConnected: boolean;
  finnhubStatus: ConnectionStatusType | null;
}

export const ConnectionStatus = ({
  isWebSocketConnected,
}: ConnectionStatusProps) => {
  return (
    <div className="flex gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-gray-700">
          {isWebSocketConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
