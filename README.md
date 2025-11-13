# 📈 Cryptocurrency Dashboard - Real-Time Exchange Rates

A real-time cryptocurrency dashboard that displays live exchange rates for ETH/USDC, ETH/USDT, and ETH/BTC with interactive charts and WebSocket-based data updates.

## 🏗️ Architecture

This project is divided into two main components:

- **Backend**: NestJS + TypeScript + WebSockets
- **Frontend**: React + TypeScript + Vite

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Socket.IO** - Real-time bidirectional communication
- **Finnhub WebSocket API** - Live cryptocurrency data
- **Class Validator** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Socket.IO Client** - Real-time updates
- **Recharts** - Beautiful charts and data visualization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Finnhub API Key** (free tier available)

## 🔑 Getting Your Finnhub API Key

1. Visit [Finnhub.io](https://finnhub.io/)
2. Click on "Get free API key" or "Sign Up"
3. Complete the registration
4. Copy your API key from the dashboard
5. The free tier supports up to 60 requests/minute

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cryptocurrency-dashboard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` and add your Finnhub API key:

```env
PORT=3001
FINNHUB_API_KEY=your_actual_finnhub_api_key_here
FINNHUB_WS_URL=wss://ws.finnhub.io
FRONTEND_URL=http://localhost:5173
WS_PORT=3001
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

The default frontend `.env` should work out of the box:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 🎯 Running the Application

### Development Mode

You'll need **two terminal windows** to run both backend and frontend simultaneously.

#### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

#### Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test
```

## 📁 Project Structure

```
cryptocurrency-dashboard/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── crypto/            # Crypto module (to be created)
│   │   ├── websocket/         # WebSocket gateway (to be created)
│   │   ├── data/              # Data persistence (to be created)
│   │   ├── app.module.ts      # Main app module
│   │   └── main.ts            # Application entry point
│   ├── test/                  # Test files
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components (to be created)
│   │   ├── hooks/             # Custom React hooks (to be created)
│   │   ├── services/          # API services (to be created)
│   │   ├── types/             # TypeScript types (to be created)
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Application entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── README.md                   # This file
```

## 🔧 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run start` | Start in production mode |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Lint and fix files |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint files |

## 🎨 Features

### Current Features (Phase 1 - Setup Complete)
- ✅ Project structure with separate backend and frontend
- ✅ Development environment configured
- ✅ Dependencies installed
- ✅ Environment variables setup

### Upcoming Features (Phase 2-5)

#### Backend
- 🔄 WebSocket connection to Finnhub
- 🔄 Real-time data streaming for ETH/USDC, ETH/USDT, ETH/BTC
- 🔄 Hourly average calculation
- 🔄 Data persistence
- 🔄 Connection retry logic
- 🔄 Error handling and logging

#### Frontend
- 🔄 Real-time dashboard
- 🔄 Live charts for all currency pairs
- 🔄 Current price display
- 🔄 Hourly average display
- 🔄 Connection status indicator
- 🔄 Error handling UI
- 🔄 Responsive design

## 🐛 Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

**Finnhub connection fails**
- Verify your API key is correct in `.env`
- Check you haven't exceeded the rate limit (60 req/min)
- Ensure you have internet connectivity

### Frontend Issues

**CORS errors**
- Ensure backend is running
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

**Can't connect to WebSocket**
- Check backend is running on port 3001
- Verify `VITE_WS_URL` in frontend `.env` is correct

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `FINNHUB_API_KEY` | Your Finnhub API key | Required |
| `FINNHUB_WS_URL` | Finnhub WebSocket URL | `wss://ws.finnhub.io` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `WS_PORT` | WebSocket server port | `3001` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_WS_URL` | Backend WebSocket URL | `http://localhost:3001` |

## 🤝 Contributing

This is a take-home assessment project. However, suggestions and feedback are welcome!

## 📄 License

This project is private and for assessment purposes only.

## 🆘 Support

If you encounter any issues during setup:

1. Ensure all prerequisites are installed
2. Check that environment variables are correctly configured
3. Verify your Finnhub API key is valid
4. Make sure both backend and frontend are running

---

**Next Steps**: Proceed to Phase 2 - Backend Implementation (WebSocket integration with Finnhub)
