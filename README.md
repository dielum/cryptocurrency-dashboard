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