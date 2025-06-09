const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const tradingRoutes = require('./routes/trading');
const marketRoutes = require('./routes/market');
const adminRoutes = require('./routes/admin');

const { initializeDatabase } = require('../config/database');
const { initializeRedis } = require('../config/redis');
const WebSocketService = require('./services/websocket');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Xosmox Crypto Exchange API',
    version: '1.0.0',
    description: 'RESTful API for cryptocurrency trading platform',
    endpoints: {
      health: {
        'GET /health': 'Simple health check',
        'GET /api/health': 'Comprehensive health check with service status'
      },
      authentication: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/refresh': 'Refresh JWT token'
      },
      user: {
        'GET /api/user/profile': 'Get user profile',
        'PUT /api/user/profile': 'Update user profile',
        'POST /api/user/kyc': 'Submit KYC documents'
      },
      wallet: {
        'GET /api/wallet/balances': 'Get wallet balances',
        'POST /api/wallet/deposit': 'Create deposit address',
        'POST /api/wallet/withdraw': 'Withdraw funds'
      },
      trading: {
        'POST /api/trading/order': 'Place new order',
        'GET /api/trading/orders': 'Get user orders',
        'DELETE /api/trading/order/:id': 'Cancel order',
        'GET /api/trading/trades': 'Get trade history'
      },
      market: {
        'GET /api/market/tickers': 'Get all market tickers',
        'GET /api/market/ticker/:symbol': 'Get specific ticker',
        'GET /api/market/orderbook/:symbol': 'Get order book',
        'GET /api/market/trades/:symbol': 'Get recent trades'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (admin only)',
        'GET /api/admin/orders': 'Get all orders (admin only)',
        'POST /api/admin/trading-pair': 'Add trading pair (admin only)'
      }
    },
    websocket: {
      url: 'ws://localhost:3000',
      channels: ['ticker', 'orderbook', 'trades', 'user_orders']
    }
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const { getRedisClient } = require('../config/redis');
    
    // Check database connection
    const dbResult = await pool.query('SELECT NOW()');
    const dbStatus = dbResult.rows ? 'connected' : 'disconnected';
    
    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      const redisClient = getRedisClient();
      redisStatus = redisClient.isReady ? 'connected' : 'disconnected';
    } catch (redisError) {
      redisStatus = 'error';
    }
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        api: 'running'
      },
      version: '1.0.0',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function startServer() {
  try {
    await initializeDatabase();
    await initializeRedis();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Xosmox API server running on port ${PORT}`);
    });

    // Initialize WebSocket for real-time data
    const wsService = new WebSocketService(server);
    wsService.initialize();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;