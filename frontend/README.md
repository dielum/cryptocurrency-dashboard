# 🎨 Cryptocurrency Dashboard - Frontend

React + TypeScript frontend application built with Vite that displays real-time cryptocurrency exchange rates with live charts.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev
```

Application will start on `http://localhost:5173`

## 📦 Dependencies

### Production
- `react` - UI library
- `react-dom` - React DOM renderer
- `socket.io-client` - WebSocket client for real-time updates
- `recharts` - Chart library for data visualization

### Development
- `vite` - Build tool and dev server
- `typescript` - Type checking
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting

## 🏗️ Architecture

### Planned Structure

```
frontend/src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── CurrencyCard.tsx # Individual currency pair card
│   ├── LiveChart.tsx    # Real-time chart component
│   └── ConnectionStatus.tsx # Connection indicator
│
├── hooks/               # Custom React hooks
│   ├── useWebSocket.ts  # WebSocket connection hook
│   └── useCryptoData.ts # Crypto data management
│
├── services/            # External services
│   └── websocket.ts     # WebSocket service
│
├── types/               # TypeScript definitions
│   └── crypto.types.ts  # Crypto data types
│
├── utils/               # Utility functions
│   └── helpers.ts       # Helper functions
│
├── App.tsx              # Main App component
└── main.tsx             # Entry point
```

## 🎨 Components

### Dashboard
Main container component that orchestrates the entire application.

### CurrencyCard
Displays individual cryptocurrency pair information:
- Current price
- Last update timestamp
- Hourly average
- Price change indicator

### LiveChart
Real-time chart using Recharts:
- Line chart for price history
- Auto-updating as new data arrives
- Responsive design
- Time-based x-axis

### ConnectionStatus
Visual indicator showing WebSocket connection state:
- 🟢 Connected
- 🟡 Connecting
- 🔴 Disconnected
- Error messages

## 🔌 WebSocket Integration

### Events Listened

| Event | Handler | Description |
|-------|---------|-------------|
| `connect` | `handleConnect()` | Connection established |
| `disconnect` | `handleDisconnect()` | Connection lost |
| `priceUpdate` | `handlePriceUpdate()` | New price data |
| `hourlyAverage` | `handleHourlyAverage()` | Hourly average update |

### Data Flow

1. Component mounts → Establish WebSocket connection
2. Backend sends `priceUpdate` → Update state
3. Component re-renders → Chart updates
4. Component unmounts → Close connection

## 🎨 Styling

The application uses modern CSS with:
- CSS Modules or styled-components (TBD)
- Responsive design (mobile-first)
- Dark/Light mode support (planned)
- Smooth animations

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

**Note:** All Vite environment variables must be prefixed with `VITE_`

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🏭 Production Build

```bash
# Create optimized build
npm run build

# Output will be in /dist folder
```

Build optimizations include:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## 🎯 Features

### Current Features (Phase 1)
- ✅ Project setup with Vite
- ✅ TypeScript configuration
- ✅ Dependencies installed

### Planned Features (Phase 2-5)

#### Real-time Updates
- 🔄 WebSocket connection management
- 🔄 Automatic reconnection
- 🔄 Connection status indicator

#### Data Visualization
- 🔄 Live updating charts
- 🔄 Multiple currency pairs
- 🔄 Historical data display

#### User Experience
- 🔄 Loading states
- 🔄 Error handling
- 🔄 Responsive design
- 🔄 Smooth animations

## 🐛 Common Issues

### "VITE_API_URL is not defined"
- Ensure `.env` file exists in frontend directory
- Restart dev server after changing `.env`

### "Cannot connect to backend"
- Verify backend is running on port 3001
- Check `VITE_WS_URL` in `.env`
- Inspect browser console for CORS errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## ⚡ Performance

### Optimization Strategies
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers
- Debouncing chart updates
- Virtual scrolling (if needed)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🎨 Design Principles

1. **Simplicity** - Clean, intuitive interface
2. **Performance** - Smooth animations, fast updates
3. **Reliability** - Robust error handling
4. **Accessibility** - WCAG compliance
5. **Responsiveness** - Works on all devices
