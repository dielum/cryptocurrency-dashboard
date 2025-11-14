# Multi-service Dockerfile for Cryptocurrency Dashboard
# Contains both Backend (NestJS) and Frontend (React/Vite)
FROM node:20-alpine AS backend-builder

# Build argument for DATABASE_URL (passed from Kamal or uses default)
ARG DATABASE_URL="file:./prisma/data/prod.db"
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app/backend

# Copy backend files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy backend source
COPY backend/ ./

# Generate Prisma Client
RUN npx prisma generate

# Build backend
RUN npm run build

# Frontend builder stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Final production stage
FROM node:20-alpine

# Install nginx, dumb-init, and curl for healthchecks
RUN apk add --no-cache nginx dumb-init curl && \
  mkdir -p /run/nginx

WORKDIR /app

# Copy backend production files
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Create directory for database
RUN mkdir -p /app/backend/prisma/data

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Starting Cryptocurrency Dashboard..."

# Start nginx in background
echo "📡 Starting Nginx..."
nginx

# Run database migrations
echo "🗄️  Running database migrations..."
cd /app/backend
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seed failed or already seeded"

# Start backend
echo "🎯 Starting NestJS backend..."
cd /app/backend
node dist/src/main
EOF

RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/ && curl -f http://localhost:3001/api/crypto/stats || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start everything
CMD ["/bin/sh", "/app/start.sh"]

