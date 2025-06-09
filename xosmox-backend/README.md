# Xosmox Crypto Exchange Backend

A comprehensive Node.js backend API for a cryptocurrency exchange platform with real-time trading, wallet management, and administrative features.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Wallet Management**: Multi-currency wallets with deposit/withdrawal
- **Trading Engine**: Order matching with market and limit orders
- **Real-time Data**: WebSocket connections for live updates
- **Admin Panel**: Administrative controls and monitoring
- **Market Data**: Ticker, order book, and trade history APIs

### Security Features
- Rate limiting and CORS protection
- Helmet.js security headers
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- JWT token expiration and refresh

### Database Schema
- Users with KYC status and 2FA support
- Multi-currency wallet system
- Order book and trade execution
- Transaction history and audit trails

## 📋 Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Redis 6+ (optional, for caching)

## 🛠️ Installation

### 1. Clone and Install Dependencies
```bash
cd xosmox-backend
npm install
```

### 2. Database Setup
```bash
# Install PostgreSQL and create database
createdb xosmox

# The application will automatically create tables on first run
```

### 3. Redis Setup (Optional)
```bash
# Install Redis
# Ubuntu/Debian:
sudo apt install redis-server

# macOS:
brew install redis

# Start Redis
redis-server
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 5. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | xosmox |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | password |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT signing secret | (required) |

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Wallet Endpoints

#### Get All Wallets
```http
GET /api/wallet
Authorization: Bearer <token>
```

#### Deposit Funds (Simulation)
```http
POST /api/wallet/BTC/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 0.1,
  "txHash": "optional-transaction-hash"
}
```

#### Withdraw Funds
```http
POST /api/wallet/BTC/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 0.05,
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

### Trading Endpoints

#### Place Order
```http
POST /api/trading/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "BTCUSDT",
  "side": "buy",
  "type": "limit",
  "quantity": 0.001,
  "price": 43000
}
```

#### Get Order History
```http
GET /api/trading/orders?status=open&page=1&limit=20
Authorization: Bearer <token>
```

#### Cancel Order
```http
DELETE /api/trading/order/123
Authorization: Bearer <token>
```

### Market Data Endpoints

#### Get All Tickers
```http
GET /api/market/tickers
```

#### Get Order Book
```http
GET /api/trading/orderbook/BTCUSDT?depth=20
```

#### Get Recent Trades
```http
GET /api/market/trades/BTCUSDT?limit=50
```

#### Get Kline Data
```http
GET /api/market/klines/BTCUSDT?interval=1h&limit=100
```

### Admin Endpoints (Requires Admin Role)

#### Get Platform Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=20&search=john
Authorization: Bearer <admin-token>
```

#### Update User Status
```http
PUT /api/admin/users/123/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "kycStatus": "verified",
  "isActive": true
}
```

## 🔌 WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));

// Subscribe to channels
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: {
    channels: ['tickers', 'orderbook_BTCUSDT', 'balances']
  }
}));
```

### Available Channels
- `tickers` - Real-time price updates
- `orderbook_{SYMBOL}` - Order book updates
- `balances` - User balance updates
- `trades_{SYMBOL}` - Recent trades

### Message Types
- `auth` - Authenticate connection
- `subscribe` - Subscribe to channels
- `unsubscribe` - Unsubscribe from channels
- `ping` - Heartbeat ping

## 🏗️ Architecture

### Project Structure
```
xosmox-backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth and validation
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
├── config/
│   ├── database.js      # Database configuration
│   └── redis.js         # Redis configuration
├── package.json
├── .env.example
└── README.md
```

### Database Schema

#### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `first_name`, `last_name` - User names
- `phone` - Phone number
- `kyc_status` - KYC verification status
- `two_fa_enabled` - 2FA status
- `is_active` - Account status

#### Wallets Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `currency` - Currency code (BTC, ETH, etc.)
- `balance` - Available balance
- `locked_balance` - Locked in orders
- `address` - Deposit address

#### Orders Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `symbol` - Trading pair (BTCUSDT)
- `side` - buy/sell
- `type` - market/limit
- `quantity` - Order quantity
- `price` - Order price
- `filled_quantity` - Executed quantity
- `status` - open/filled/cancelled/partial

#### Trades Table
- `id` - Primary key
- `buyer_id`, `seller_id` - User IDs
- `buy_order_id`, `sell_order_id` - Order IDs
- `symbol` - Trading pair
- `quantity` - Trade quantity
- `price` - Execution price
- `fee` - Trading fee

## 🔒 Security Considerations

### Production Deployment
1. **Environment Variables**: Use secure environment variable management
2. **Database Security**: Use connection pooling and SSL
3. **Rate Limiting**: Implement stricter rate limits
4. **Input Validation**: Validate all inputs thoroughly
5. **Logging**: Implement comprehensive audit logging
6. **Monitoring**: Set up health checks and monitoring

### Authentication
- JWT tokens expire in 24 hours
- Passwords hashed with bcrypt (12 rounds)
- 2FA support for enhanced security
- Admin role separation

### Trading Security
- Atomic transactions for order execution
- Balance validation before order placement
- Locked balance system prevents double-spending
- Order matching with price-time priority

## 🧪 Testing

### Run Tests
```bash
npm test
```

### API Testing with curl
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get wallets (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Monitoring

### Health Check
```http
GET /health
```

### Admin Health Check
```http
GET /api/admin/health
Authorization: Bearer <admin-token>
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure Redis (optional)
3. Set environment variables
4. Run database migrations
5. Start the application

### Production Considerations
- Use PM2 for process management
- Set up reverse proxy (nginx)
- Configure SSL certificates
- Implement log rotation
- Set up monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@xosmox.com
- Documentation: https://docs.xosmox.com
- Issues: GitHub Issues

---

**Note**: This is a demonstration crypto exchange backend. For production use, implement additional security measures, compliance features, and integrate with real blockchain networks and payment processors.