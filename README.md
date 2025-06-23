# Xosmox - Modern Crypto Exchange Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

A full-stack cryptocurrency exchange platform built with modern web technologies. Features real-time trading, secure wallet management, and comprehensive admin tools.

## 🚀 Quick Start

### Development Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/xosmox.git
cd xosmox

# Start all services
./start-xosmox.sh
```

### Docker Deployment
```bash
# Copy environment file and configure
cp .env.example .env
# Edit .env with your values

# Start with Docker
docker-compose up -d
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│  (Node.js)      │◄──►│  (PostgreSQL)   │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Cache)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## ✨ Features

### Trading Engine
- **Real-time Trading** - Live order matching and execution
- **Multiple Order Types** - Market, Limit, Stop-Loss orders
- **Advanced Charts** - TradingView integration with technical indicators
- **Order Book** - Real-time depth visualization
- **Trade History** - Complete transaction records

### Security & Compliance
- **JWT Authentication** - Secure user sessions
- **2FA Support** - Two-factor authentication
- **KYC Integration** - Identity verification system
- **Rate Limiting** - API protection and abuse prevention
- **Encrypted Storage** - Secure data handling

### Wallet Management
- **Multi-Currency Support** - Bitcoin, Ethereum, and more
- **Real-time Balances** - Live portfolio tracking
- **Deposit/Withdrawal** - Secure fund management
- **Transaction History** - Complete audit trail

### Admin Dashboard
- **User Management** - Account administration
- **Trading Oversight** - Monitor all trading activity
- **System Analytics** - Performance metrics and insights
- **Risk Management** - Automated monitoring and alerts

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Redis** for caching
- **JWT** for authentication
- **WebSocket** for real-time data
- **bcrypt** for password hashing

### Infrastructure
- **Docker** containerization
- **Kubernetes** orchestration
- **Nginx** reverse proxy
- **PM2** process management
- **Let's Encrypt** SSL certificates

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Docker (optional)

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/xosmox.git
   cd xosmox
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd xosmox-backend
   npm install
   
   # Frontend
   npm --prefix frontend install
   ```

3. **Configure environment**
   ```bash
   # Backend configuration
   cd xosmox-backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   createdb xosmox
   psql -d xosmox -f setup-db.sql
   ```

5. **Start services**
   ```bash
   # Backend (terminal 1)
   cd xosmox-backend
   npm run dev
   
   # Frontend (terminal 2)
   npm --prefix frontend run dev
   ```

## 🚀 Deployment

### Development
```bash
./start-xosmox.sh    # Start all services
./status-xosmox.sh   # Check status
./stop-xosmox.sh     # Stop all services
```

### Production Server
```bash
chmod +x deploy-production.sh
sudo ./deploy-production.sh
```

### Docker
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Cloud Platforms
- **AWS**: Use `deploy-aws.sh`
- **Google Cloud**: Deploy to GKE
- **Azure**: Use Container Instances

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xosmox
DB_USER=xosmox
DB_PASSWORD=your_secure_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=https://yourdomain.com
```

### API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/markets` - Market data
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `GET /api/wallet` - Get wallet balance

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:3000/health

# Frontend status
curl -I http://localhost:5173

# Database connection
psql -d xosmox -c "SELECT 1;"
```

### Logs
```bash
# Development logs
tail -f backend.log
tail -f frontend.log

# Docker logs
docker-compose logs -f

# Production logs (PM2)
pm2 logs xosmox-backend
```

## 🔒 Security

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted sensitive data
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for production domains
- **Headers**: Security headers implemented
- **Validation**: Input sanitization and validation

## 🧪 Testing

```bash
# Backend tests
cd xosmox-backend
npm test

# Frontend tests
npm --prefix frontend test

# Integration tests
npm run test:integration
```

## 📈 Performance

- **Caching**: Redis for session and data caching
- **Database**: Optimized queries with indexes
- **Frontend**: Code splitting and lazy loading
- **CDN**: Static asset delivery optimization
- **Compression**: Gzip compression enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/xosmox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/xosmox/discussions)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced trading features (margin, futures)
- [ ] DeFi integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting tiers
- [ ] Institutional trading features

## ⚠️ Disclaimer

This software is for educational and development purposes. Always ensure compliance with local regulations when operating a cryptocurrency exchange. Use at your own risk.

---

**Built with ❤️ by the Xosmox Team**