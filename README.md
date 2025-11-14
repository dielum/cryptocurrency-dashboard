# 🚀 Cryptocurrency Dashboard

Real-time cryptocurrency price tracking dashboard built with **NestJS**, **React**, **TypeScript**, and **Socket.IO**.

## 📸 Features

- ⚡ **Real-time price updates** from Finnhub API (10-50 updates/second)
- 📊 **Live charts** showing recent price movements
- 💾 **SQLite database** with 86,000+ stored price records
- 🔌 **WebSocket connections** for instant data streaming
- 🎨 **Beautiful, responsive UI** with animations
- 📡 **Connection status** indicators
- 🔄 **Automatic reconnection** with exponential backoff

## 🏗️ Architecture

```
Finnhub API → FinnhubService → DataService (SQLite) + CryptoGateway (Socket.IO) → React Dashboard
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Finnhub API Key (get one free at https://finnhub.io)

### Installation

1. **Clone and setup:**
```bash
cd cryptocurrency-dashboard
```

2. **Backend setup:**
```bash
cd backend
npm install

# Create .env file
echo "FINNHUB_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=\"file:./prisma/dev.db\"" >> .env

# Run database migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend
npm run start:dev
```

3. **Frontend setup (in a new terminal):**
```bash
cd frontend
npm install

# Start frontend
npm run dev
```

4. **Access the dashboard:**
```
http://localhost:5173
```

## 📁 Project Structure

```
cryptocurrency-dashboard/
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── crypto/
│   │   │   ├── crypto.controller.ts    # REST API
│   │   │   ├── crypto.gateway.ts       # WebSocket
│   │   │   ├── finnhub.service.ts      # Finnhub connection
│   │   │   └── data.service.ts         # Business logic
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   └── app.module.ts
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   └── seed.ts
│   └── .env
│
└── frontend/                 # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.tsx
    │   │   ├── PriceCard.tsx
    │   │   ├── PriceChart.tsx
    │   │   └── ConnectionStatus.tsx
    │   ├── hooks/
    │   │   └── useWebSocket.ts
    │   ├── services/
    │   │   └── api.ts
    │   └── types/
    │       └── crypto.ts
    └── .env
```

## 🔌 API Endpoints

### REST API (http://localhost:3001/api)

- `GET /crypto/pairs` - List all trading pairs
- `GET /crypto/all?hours=24` - Complete data for all pairs
- `GET /crypto/prices/:symbol?limit=100` - Recent prices
- `GET /crypto/hourly-averages/:symbol?hours=24` - Hourly averages
- `GET /crypto/stats` - Database statistics

### WebSocket (ws://localhost:3001/crypto)

**Events emitted by server:**
- `priceUpdate` - New price data
- `hourlyAverage` - Hourly average calculations
- `connectionStatus` - Finnhub connection status
- `connected` - Welcome message on connect

**Events received from client:**
- `subscribe` - Subscribe to specific pairs
- `unsubscribe` - Unsubscribe from pairs

## 🛠️ Technologies

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **SQLite** - Database
- **Socket.IO** - WebSocket server
- **ws** - Finnhub WebSocket client

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **Recharts** - Charting library

## 📊 Database Schema

### CryptoPair
- Trading pair information (ETH/USDC, ETH/USDT, ETH/BTC)

### Price
- Individual price records with timestamp and volume
- Indexed by pairId and timestamp

### HourlyAverage
- Calculated hourly statistics (average, high, low, count)
- Unique constraint on pairId + hour

## 🎨 UI Components

### Dashboard
Main container that orchestrates all components and manages state.

### PriceCard
Displays current price with:
- Real-time updates with flash animation
- Price direction indicators (↑↓)
- Color-coded changes (green/red)
- Volume and timestamp

### PriceChart
Live line chart showing:
- Last 50 price updates
- Smooth animations
- Interactive tooltips
- Responsive design

### ConnectionStatus
Visual indicators for:
- WebSocket connection status
- Finnhub connection status
- Real-time status updates

## 🔄 Data Flow

1. **Initial Load:**
   - Frontend fetches historical data via REST API
   - Displays initial state

2. **Real-time Updates:**
   - Finnhub sends trade data via WebSocket
   - `FinnhubService` receives and processes
   - `DataService` saves to database
   - `CryptoGateway` broadcasts to all connected clients
   - Frontend receives and updates UI instantly

3. **Connection Management:**
   - Automatic reconnection on disconnect
   - Exponential backoff strategy
   - Status updates broadcast to clients

## 🐛 Troubleshooting

### Backend not starting
- Verify `.env` file has `FINNHUB_API_KEY`
- Check if port 3001 is available
- Run `npx prisma generate` if Prisma client errors

### Frontend not connecting
- Ensure backend is running on port 3001
- Check `.env` has correct URLs
- Verify browser console for errors

### No real-time updates
- Check connection indicators (should be green)
- Verify Finnhub API key is valid
- Check backend logs for Finnhub connection

## 📝 Environment Variables

### Backend (backend/.env)
```env
FINNHUB_API_KEY=your_finnhub_api_key
FINNHUB_WS_URL=wss://ws.finnhub.io
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001/crypto
```

## 🚀 Commands

### Backend
```bash
npm run start:dev    # Development mode with watch
npm run start:prod   # Production mode
npm run build        # Build for production
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev  # Run migrations
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📈 Performance

- **Real-time latency:** < 500ms from trade to UI update
- **Update frequency:** 10-50 updates per second
- **Database:** 86,000+ price records stored
- **WebSocket:** Persistent connection with auto-reconnect

## 🎯 Next Steps (Optional)

Phase 2 features to implement:
- [ ] Scheduled hourly average calculations
- [ ] Automatic old data cleanup
- [ ] Price alerts and notifications
- [ ] User preferences
- [ ] Export data functionality
- [ ] Additional trading pairs
- [ ] Advanced charting options

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue.

---

**Built with ❤️ using NestJS, React, and TypeScript**
