# Deployment Guide - Cryptocurrency Dashboard

This guide covers deploying the Cryptocurrency Dashboard using **Kamal 2.0**.

> **Note**: Kamal 2.0 uses `kamal-proxy` instead of Traefik for the reverse proxy.

## 📋 Prerequisites

### 1. Install Kamal 2.0

```bash
gem install kamal
```

Or add to your Gemfile:
```ruby
gem 'kamal', '~> 2.0'
```

Verify installation:
```bash
kamal version
```

### 2. Server Requirements

- A Linux server (Ubuntu 22.04+ recommended)
- Docker installed on the server
- SSH access with key authentication
- Domain name pointing to your server
- At least 2GB RAM and 20GB disk space
- Open ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)

### 3. Docker Hub Account

Create an account at [Docker Hub](https://hub.docker.com/) or use your own Docker registry.

## 🚀 Initial Setup

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```bash
# Required
FINNHUB_API_KEY=your_api_key_here
DOCKER_REGISTRY_PASSWORD=your_docker_password

# Production URLs
FRONTEND_URL=https://your-domain.com
```

### 2. Configure Kamal

Edit `config/deploy.yml` and replace:

- `YOUR_DOCKER_USERNAME` - Your Docker Hub username
- `YOUR_SERVER_IP` - Your server IP address
- `YOUR_DOMAIN` - Your domain name

Example:
```yaml
image: myusername/crypto-dashboard
servers:
  web:
    hosts:
      - 192.168.1.100
proxy:
  host: crypto.example.com
```

### 3. Set Up Server

On your server, create a deploy user:

```bash
# On your server
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh

# Install Docker if not installed
curl -fsSL https://get.docker.com | sh
```

### 4. Configure SSH

Add your server to `~/.ssh/config`:

```
Host crypto-dashboard
  HostName YOUR_SERVER_IP
  User deploy
  IdentityFile ~/.ssh/id_rsa
```

Test SSH connection:
```bash
ssh crypto-dashboard
```

## 📦 Build Docker Image

The application uses a **single unified Docker image** that contains both frontend and backend.

### Option 1: Let Kamal Build (Recommended)

Kamal will automatically build and push the image during deployment:

```bash
kamal deploy
```

### Option 2: Build Manually

```bash
# Build unified image
docker build -t YOUR_DOCKER_USERNAME/crypto-dashboard:latest .

# Push to registry
docker push YOUR_DOCKER_USERNAME/crypto-dashboard:latest
```

Or use the Makefile:

```bash
make build-image
make push-image
```

## 🚢 Deploy with Kamal

### First Deployment

```bash
# Initialize Kamal on the server
kamal setup

# This will:
# - Install kamal-proxy on the server
# - Set up SSL certificates (Let's Encrypt)
# - Pull and start your containers
# - Configure the reverse proxy
```

### Subsequent Deployments

```bash
# Deploy new version
kamal deploy

# Deploy with verbose output
kamal deploy --verbose

# Deploy to specific server
kamal deploy --hosts=YOUR_SERVER_IP
```

## 🔧 Useful Kamal Commands

### Check Status

```bash
# Check all containers
kamal app containers

# Check app details
kamal app details

# Check proxy status
kamal proxy details
```

### View Logs

```bash
# View all logs
kamal app logs --follow

# View last 100 lines
kamal app logs --lines 100

# View specific container logs
kamal app exec "docker logs crypto-dashboard-web"
```

### Execute Commands

```bash
# Run shell in container
kamal app exec --interactive --reuse "sh"

# Check database
kamal app exec "npx prisma studio"

# View Prisma migrations
kamal app exec "npx prisma migrate status"

# Run a one-off command
kamal app exec "ls -la /app"
```

### Restart Application

```bash
# Restart the app
kamal app restart

# Restart the proxy
kamal proxy restart

# Restart everything
kamal app stop && kamal deploy
```

### Rollback

```bash
# Rollback to previous version
kamal rollback [VERSION]

# List available versions
kamal app containers
```

### Access Server

```bash
# SSH into server
ssh deploy@YOUR_SERVER_IP

# View Docker containers
docker ps

# View Docker logs
docker logs crypto-dashboard-web-latest
```

## 🗄️ Database Management

### Run Migrations

Migrations run automatically on deploy, but you can run them manually:

```bash
kamal app exec "npx prisma migrate deploy"
```

### Seed Database

```bash
kamal app exec "npx prisma db seed"
```

### Backup Database

```bash
# Create backup on server
kamal app exec "mkdir -p /app/backups && cp /app/prisma/data/prod.db /app/backups/backup-$(date +%Y%m%d-%H%M%S).db"

# Download backup to local machine
scp deploy@YOUR_SERVER_IP:/app/backups/backup-*.db ./backups/
```

### Restore Database

```bash
# Upload backup
scp ./backups/backup-YYYYMMDD.db deploy@YOUR_SERVER_IP:/tmp/

# Restore
kamal app exec "cp /tmp/backup-YYYYMMDD.db /app/prisma/data/prod.db"

# Restart service
kamal app restart
```

### Database Console

```bash
# Access Prisma Studio (not recommended for production)
kamal app exec --interactive "npx prisma studio"
```

## 🔒 SSL/TLS Configuration

Kamal 2.0 automatically configures Let's Encrypt SSL certificates via `kamal-proxy`.

### SSL is automatic when you:
1. Have `ssl: true` in `config/deploy.yml`
2. Have a domain pointing to your server
3. Have ports 80 and 443 open

### Manual SSL renewal:
```bash
kamal proxy restart
```

### Check SSL status:
```bash
kamal proxy logs
```

## 📊 Monitoring

### Health Checks

Access health endpoints:

- Backend API: `https://your-domain.com/api/crypto/stats`
- Check if WebSocket is working: Browser console should show connection

### Container Stats

```bash
# App containers
kamal app containers

# All Docker containers
ssh deploy@YOUR_SERVER_IP "docker ps"

# Container resource usage
ssh deploy@YOUR_SERVER_IP "docker stats"
```

### Logs

```bash
# Follow application logs
kamal app logs --follow

# Follow proxy logs
kamal proxy logs --follow

# System logs on server
ssh deploy@YOUR_SERVER_IP "journalctl -u docker -f"
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
kamal app logs --lines 100

# Check container status
kamal app containers

# Try restarting
kamal app restart

# Check if ports are in use
ssh deploy@YOUR_SERVER_IP "netstat -tulpn | grep -E '3001|80|443'"
```

### Database Issues

```bash
# Check if database file exists
kamal app exec "ls -lah /app/prisma/data/"

# Check database connection
kamal app exec "npx prisma db pull"

# Reset database (CAUTION: Deletes all data)
kamal app exec "npx prisma migrate reset --force"
```

### SSL Certificate Issues

```bash
# Check proxy logs
kamal proxy logs --lines 50

# Restart proxy to renew SSL
kamal proxy restart

# Check if domain is pointing to server
dig YOUR_DOMAIN

# Check if ports are open
nc -zv YOUR_SERVER_IP 80
nc -zv YOUR_SERVER_IP 443
```

### Deploy Failures

```bash
# Deploy with verbose output
kamal deploy --verbose

# Check if Docker daemon is running
ssh deploy@YOUR_SERVER_IP "systemctl status docker"

# Check disk space
ssh deploy@YOUR_SERVER_IP "df -h"

# Clean up old images
kamal app remove_container [OLD_CONTAINER_ID]
```

### Redeploy Everything

```bash
# Stop all services
kamal app stop

# Remove containers (keeps volumes)
kamal app remove

# Remove proxy
kamal proxy remove

# Fresh deploy
kamal setup
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy with Kamal

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
      
      - name: Install Kamal
        run: gem install kamal
      
      - name: Set up SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SERVER_IP }} >> ~/.ssh/known_hosts
      
      - name: Deploy with Kamal
        env:
          KAMAL_REGISTRY_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
          FINNHUB_API_KEY: ${{ secrets.FINNHUB_API_KEY }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
        run: |
          kamal deploy
```

### Required GitHub Secrets:
- `DOCKER_PASSWORD` - Docker Hub password
- `SSH_PRIVATE_KEY` - SSH private key for server access
- `SERVER_IP` - Your server IP
- `FINNHUB_API_KEY` - Finnhub API key
- `FRONTEND_URL` - Production frontend URL

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `FINNHUB_API_KEY` | Yes | API key from Finnhub |
| `KAMAL_REGISTRY_PASSWORD` | Yes | Docker registry password |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DATABASE_URL` | No | Database URL (default: SQLite file) |
| `PORT` | No | Backend port (default: 3001) |
| `NODE_ENV` | No | Node environment (default: production) |

## 🚀 Performance Optimization

### Build Cache

Kamal 2.0 supports build caching:

```yaml
builder:
  cache:
    type: registry
    options: mode=max
```

### Volume Optimization

Use named volumes for better performance:

```yaml
volumes:
  - /var/lib/crypto-dashboard/db:/app/prisma/data
```

### Health Check Tuning

Adjust health check intervals:

```yaml
healthcheck:
  interval: 10s
  max_attempts: 5
  timeout: 3s
```

## 🔐 Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Enable UFW firewall** on server:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. **Keep Docker updated**:
   ```bash
   ssh deploy@YOUR_SERVER_IP "sudo apt update && sudo apt upgrade docker-ce"
   ```
4. **Use secrets** for sensitive data (never commit `.env`)
5. **Regular backups** of database
6. **Monitor logs** for suspicious activity

## 📚 Additional Resources

- [Kamal 2.0 Documentation](https://kamal-deploy.org)
- [Docker Documentation](https://docs.docker.com)
- [Let's Encrypt](https://letsencrypt.org)
- [NestJS Production Guide](https://docs.nestjs.com)

## 🆘 Getting Help

- Kamal issues: https://github.com/basecamp/kamal/issues
- Project README: `README.md` in repository
- Docker Hub: https://hub.docker.com

## 📄 Quick Reference

```bash
# Deploy
kamal deploy

# Rollback
kamal rollback

# Logs
kamal app logs --follow

# Shell
kamal app exec --interactive "sh"

# Restart
kamal app restart

# Status
kamal app containers

# DB Backup
kamal app exec "cp /app/prisma/data/prod.db /app/backups/backup-$(date +%Y%m%d).db"
```

---

**Ready to deploy?** Start with `kamal setup` and you're good to go! 🚀
