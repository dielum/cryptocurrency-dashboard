# 🔙 Cryptocurrency Dashboard - Backend

NestJS backend service that connects to Finnhub's WebSocket API and streams real-time cryptocurrency data to frontend clients.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your Finnhub API key

# Run in development mode
npm run start:dev
```

Server will start on `http://localhost:3001`

## 📦 Dependencies

### Production
- `@nestjs/common` - NestJS common utilities
- `@nestjs/core` - NestJS core functionality
- `@nestjs/platform-express` - Express adapter for NestJS
- `@nestjs/websockets` - WebSocket support
- `@nestjs/platform-socket.io` - Socket.IO platform adapter
- `@nestjs/config` - Configuration management
- `ws` - WebSocket client for Finnhub connection
- `class-validator` - Validation decorators
- `class-transformer` - Object transformation
- `reflect-metadata` - Metadata reflection API
- `rxjs` - Reactive extensions for JavaScript

### Development
- `@nestjs/cli` - NestJS CLI
- `@nestjs/testing` - Testing utilities
- `@types/*` - TypeScript type definitions
- `jest` - Testing framework
- `ts-jest` - TypeScript preprocessor for Jest
- `supertest` - HTTP testing
- `eslint` - Code linting
- `prettier` - Code formatting

## 🏗️ Architecture

### Planned Modules

1. **Crypto Module** (`src/crypto/`)
   - Connects to Finnhub WebSocket
   - Subscribes to ETH/USDC, ETH/USDT, ETH/BTC
   - Handles reconnection logic

2. **WebSocket Gateway** (`src/websocket/`)
   - Broadcasts real-time data to frontend clients
   - Manages client connections
   - Handles disconnections

3. **Data Module** (`src/data/`)
   - Calculates hourly averages
   - In-memory data persistence
   - Data aggregation logic

## 🔌 WebSocket Events

### From Backend to Frontend

| Event | Payload | Description |
|-------|---------|-------------|
| `priceUpdate` | `{ symbol, price, timestamp }` | Real-time price update |
| `hourlyAverage` | `{ symbol, average, hour }` | Hourly average data |
| `connectionStatus` | `{ status, message }` | Connection status changes |

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📝 Environment Variables

```env
PORT=3001
FINNHUB_API_KEY=your_finnhub_api_key_here
FINNHUB_WS_URL=wss://ws.finnhub.io
FRONTEND_URL=http://localhost:5173
WS_PORT=3001
```

## 🔍 API Endpoints

### Health Check
```
GET /
Response: { message: "Cryptocurrency Dashboard API" }
```

### WebSocket Connection
```
Connect to: ws://localhost:3001
Namespace: /
```

## 📊 Finnhub Integration

### Subscribed Symbols
- `BINANCE:ETHUSDC` - Ethereum to USD Coin
- `BINANCE:ETHUSDT` - Ethereum to Tether
- `BINANCE:ETHBTC` - Ethereum to Bitcoin

### WebSocket Message Format

**Subscribe:**
```json
{"type":"subscribe","symbol":"BINANCE:ETHUSDC"}
```

**Unsubscribe:**
```json
{"type":"unsubscribe","symbol":"BINANCE:ETHUSDC"}
```

**Data Received:**
```json
{
  "type": "trade",
  "data": [{
    "s": "BINANCE:ETHUSDC",
    "p": 2500.50,
    "t": 1234567890000,
    "v": 1.5
  }]
}
```

## 🛠️ Development

```bash
# Start in watch mode
npm run start:dev

# Start in debug mode
npm run start:debug

# Format code
npm run format

# Lint code
npm run lint
```

## 🏭 Production

```bash
# Build
npm run build

# Run production build
npm run start:prod
```

## 🐛 Common Issues

### "FINNHUB_API_KEY is not defined"
- Ensure `.env` file exists in backend directory
- Verify `FINNHUB_API_KEY` is set correctly

### "Port 3001 is already in use"
```bash
lsof -ti:3001 | xargs kill -9
```

### "Cannot connect to Finnhub"
- Check internet connection
- Verify API key is valid
- Ensure you haven't exceeded rate limits

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSocket API (ws)](https://github.com/websockets/ws)

