# Cryptocurrency Dashboard

Real-time cryptocurrency price tracking dashboard built with NestJS and React.

## Prerequisites

- Node.js (version specified in `backend/.nvmrc`)
  - If using `nvm`, run `nvm use` in the `backend` directory to automatically use the correct version
- npm
- Finnhub API Key (see instructions below)

## How to Obtain and Configure Finnhub API Key

**Get a free API key:**
   - Visit [https://finnhub.io](https://finnhub.io)
   - Sign up for a free account
   - Navigate to your dashboard to get your API key


## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) If using `nvm`, use the correct Node.js version:
   ```bash
   nvm use
   ```

3. Copy the environment file and configure your API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and replace `your_finnhub_api_key_here` with your actual Finnhub API key.

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Seed the database:
   ```bash
   npx prisma db seed
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. (Optional) If using `nvm`, use the correct Node.js version:
   ```bash
   nvm use
   ```

3. Copy the environment to customize the API URLs:
   ```bash
   cp .env.example .env
   ```
   The frontend will use default values if the `.env` file is not present.

4. Install dependencies:
   ```bash
   npm install
   ```

## Running Services Locally

### Start Backend

From the `backend` directory:
```bash
npm run start:dev
```

The backend will start on `http://localhost:3001`

### Start Frontend

From the `frontend` directory (in a new terminal):
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

## Testing

The project includes comprehensive unit tests for both backend and frontend.

### Backend Tests

Backend tests use Vitest and cover all major services:

```bash
cd backend
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:cov      # Run tests with coverage
```

**Test Coverage:**
- `DataService` - Database operations and business logic
- `FinnhubService` - WebSocket connection and data processing
- `SchedulerService` - Hourly average calculations
- `CryptoController` - REST API endpoints
- `CryptoGateway` - WebSocket gateway for real-time updates

### Frontend Tests

Frontend tests use Vitest and React Testing Library:

```bash
cd frontend
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

**Test Coverage:**
- React components (`Dashboard`, `PriceCard`, `PriceChart`, `ConnectionStatus`)
- Custom hooks (`useWebSocket`)
- API service layer

## Deployment with Kamal

This project is configured for deployment using [Kamal](https://kamal-deploy.org), a zero-downtime deployment tool for containerized applications.

### Prerequisites

- Docker installed locally
- Docker Hub account (or private registry)
- SSH access to your server
- Domain name with DNS configured (optional, for SSL)

### Configuration

The deployment configuration is in `config/deploy.yml`. Key settings:

- **Service name**: `crypto-dashboard`
- **Docker image**: `dielume/crypto-dashboard` (update with your registry)
- **Server**: Configure your server IP in `servers.web.hosts`
- **Proxy**: Uses `kamal-proxy` for SSL and reverse proxy
- **Database**: SQLite stored in persistent volume at `/var/lib/crypto-dashboard/data`

### Setup Secrets

1. Create `.kamal/secrets` file (this file is gitignored):
   ```bash
   mkdir -p .kamal
   touch .kamal/secrets
   chmod 600 .kamal/secrets
   ```

2. Add your secrets to `.kamal/secrets`:
   ```bash
   FINNHUB_API_KEY=your_api_key_here
   FINNHUB_WS_URL=wss://ws.finnhub.io
   DATABASE_URL=file:./prisma/data/prod.db
   KAMAL_REGISTRY_PASSWORD=your_docker_hub_password
   ```

### Deploy Commands

From the project root:

```bash
# Build and push Docker image
kamal build push

# Deploy to server
kamal deploy

# View application logs
kamal app logs

# Access application console
kamal app exec -i "cd /app/backend && npm run console"

# Rollback to previous version
kamal rollback

# Check application health
kamal app details
```

### Production Example

A live example of this application is deployed at:

**https://dielum.site/**

This demonstrates the full functionality including:
- Real-time cryptocurrency price updates
- Interactive price charts
- Hourly average calculations
- WebSocket connection status monitoring