# 🚀 Xosmox Deployment Guide

Complete guide for deploying the Xosmox crypto exchange platform in various environments.

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL 12+**
- **Redis 6+**
- **Domain name** (for production)
- **SSL certificate** (recommended)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│  (Node.js)      │◄──►│  (PostgreSQL)   │
│   Port: 80/443  │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Cache)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## 🚀 Deployment Options

### 1. Quick Start (Development)

```bash
# Clone the repository
git clone <your-repo-url>
cd xosmox

# Start backend
cd xosmox-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Start frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### 2. Production Server (VPS/Dedicated)

**Requirements:**
- Ubuntu 20.04+ or similar Linux distribution
- 2GB+ RAM
- 20GB+ storage
- Root access

```bash
# Make the script executable
chmod +x deploy-production.sh

# Run deployment
sudo ./deploy-production.sh
```

**Manual Steps After Deployment:**
1. Update `/opt/xosmox/xosmox-backend/.env` with your actual values
2. Replace `yourdomain.com` in nginx config with your domain
3. Setup SSL: `sudo certbot --nginx -d yourdomain.com`
4. Configure DNS to point to your server IP

### 3. Docker Deployment

**Simple Docker Compose:**
```bash
# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Production Docker with SSL:**
```bash
# Use production profile
docker-compose --profile production up -d
```

### 4. Kubernetes Deployment

**Prerequisites:**
- Kubernetes cluster (1.20+)
- kubectl configured
- Ingress controller (nginx)
- cert-manager (for SSL)

```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n xosmox

# Get ingress IP
kubectl get ingress -n xosmox
```

### 5. Cloud Platform Deployments

#### AWS (ECS Fargate)
```bash
# Configure AWS CLI
aws configure

# Run AWS deployment
chmod +x deploy-aws.sh
./deploy-aws.sh
```

#### Google Cloud Platform
```bash
# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com

# Create GKE cluster
gcloud container clusters create xosmox-cluster --num-nodes=3

# Deploy to GKE
kubectl apply -f k8s/
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name xosmox-rg --location eastus

# Create container group
az container create --resource-group xosmox-rg --file azure-container-group.yaml
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xosmox
DB_USER=xosmox
DB_PASSWORD=your_secure_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
CORS_ORIGIN=https://yourdomain.com
```

### Database Setup

```sql
-- Create database
CREATE DATABASE xosmox;
CREATE USER xosmox WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE xosmox TO xosmox;

-- Run migrations
\i setup-db.sql
```

### SSL Configuration

**Let's Encrypt (Recommended):**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Security Checklist

- [ ] Use strong passwords for database
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Enable firewall (UFW/iptables)
- [ ] Setup SSL/TLS certificates
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:3000/health

# Database connection
psql -h localhost -U xosmox -d xosmox -c "SELECT 1;"

# Redis connection
redis-cli ping
```

### Logs
```bash
# PM2 logs
pm2 logs xosmox-backend

# Docker logs
docker-compose logs -f backend

# Kubernetes logs
kubectl logs -f deployment/xosmox-backend -n xosmox
```

### Backups
```bash
# Database backup
pg_dump -h localhost -U xosmox xosmox > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U xosmox xosmox | gzip > $BACKUP_DIR/xosmox_$DATE.sql.gz
find $BACKUP_DIR -name "xosmox_*.sql.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check database connection
- Verify environment variables
- Check port availability: `netstat -tlnp | grep 3000`

**Frontend build fails:**
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version`

**Database connection errors:**
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check firewall rules
- Verify credentials in .env

**Redis connection issues:**
- Check Redis status: `systemctl status redis`
- Verify Redis configuration
- Check network connectivity

### Performance Optimization

**Backend:**
- Enable clustering with PM2
- Use Redis for session storage
- Implement database connection pooling
- Add response caching

**Frontend:**
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images

**Database:**
- Add proper indexes
- Regular VACUUM and ANALYZE
- Monitor query performance
- Setup read replicas for scaling

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify configuration
3. Test individual components
4. Check network connectivity
5. Review security settings

## 🔄 Updates

To update Xosmox:
```bash
# Pull latest code
git pull origin main

# Update backend
cd xosmox-backend
npm install
pm2 restart xosmox-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

## 📈 Scaling

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Database read replicas
- Redis clustering
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Tune application settings
- Monitor resource usage