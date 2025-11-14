# Makefile for Cryptocurrency Dashboard
# Simplifies common Kamal and Docker commands

.PHONY: help setup deploy logs restart rollback shell status build-local test-local clean

help: ## Show this help message
	@echo "Cryptocurrency Dashboard - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Kamal Commands
setup: ## Initial setup and first deployment
	kamal setup

deploy: ## Deploy the application
	kamal deploy

logs: ## Follow application logs
	kamal logs --follow

logs-backend: ## Follow backend logs only
	kamal logs --roles=backend --follow

logs-frontend: ## Follow frontend logs only
	kamal logs --roles=web --follow

restart: ## Restart the application
	kamal app restart

restart-backend: ## Restart backend only
	kamal app restart --roles=backend

restart-frontend: ## Restart frontend only
	kamal app restart --roles=web

rollback: ## Rollback to previous version
	kamal rollback

shell: ## Open shell in backend container
	kamal app exec --roles=backend --interactive "/bin/sh"

status: ## Show application status
	kamal ps

# Database Commands
db-migrate: ## Run database migrations
	kamal app exec --roles=backend "npx prisma migrate deploy"

db-seed: ## Seed the database
	kamal app exec --roles=backend "npx prisma db seed"

db-reset: ## Reset database (WARNING: Deletes all data)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm && [ $$confirm = "yes" ] && \
		kamal app exec --roles=backend "npx prisma migrate reset --force"

db-backup: ## Backup database
	@mkdir -p ./backups
	kamal app exec --roles=backend "cp /app/prisma/data/prod.db /app/prisma/data/backup-$$(date +%Y%m%d-%H%M%S).db"
	@echo "Backup created on server"

# Local Development with Docker Compose
build-local: ## Build Docker images locally
	docker-compose build

test-local: ## Test deployment locally with docker-compose
	docker-compose up --build

stop-local: ## Stop local docker-compose containers
	docker-compose down

clean-local: ## Clean local docker containers and volumes
	docker-compose down -v
	docker system prune -f

# Docker Image Management
build-image: ## Build unified Docker image
	docker build -t crypto-dashboard:latest .

push-image: ## Push image to registry (manual)
	@echo "Pushing image to Docker registry..."
	docker push YOUR_DOCKER_USERNAME/crypto-dashboard:latest

# Configuration
config-check: ## Check Kamal configuration
	kamal config

env-copy: ## Copy .env.example to .env
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ Created .env file. Please edit it with your values."; \
	else \
		echo "⚠️  .env already exists. Skipping."; \
	fi

# Utilities
proxy-logs: ## View kamal-proxy logs
	kamal proxy logs --follow

proxy-restart: ## Restart kamal-proxy
	kamal proxy restart

proxy-details: ## Show proxy details
	kamal proxy details

health-check: ## Check application health
	@echo "Checking backend health..."
	@curl -f http://localhost:3001/api/crypto/stats || echo "Backend not responding"
	@echo ""
	@echo "Checking frontend health..."
	@curl -f http://localhost:8080/health || echo "Frontend not responding"

install-kamal: ## Install Kamal gem
	gem install kamal

version: ## Show Kamal version
	kamal version

# Development shortcuts
dev-backend: ## Start backend in development mode
	cd backend && npm run start:dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm run dev

dev: ## Start both backend and frontend in development mode
	@echo "Starting backend and frontend..."
	@trap 'kill 0' SIGINT; \
		cd backend && npm run start:dev & \
		cd frontend && npm run dev & \
		wait

