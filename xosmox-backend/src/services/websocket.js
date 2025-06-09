const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');

class WebSocketService {
  constructor(server) {
    this.server = server;
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket
    this.subscriptions = new Map(); // userId -> Set of subscriptions
  }

  initialize() {
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Xosmox WebSocket',
        timestamp: new Date().toISOString()
      }));
    });

    // Start broadcasting market data
    this.startMarketDataBroadcast();
    
    console.log('✅ WebSocket service initialized');
  }

  async handleMessage(ws, data) {
    const { type, token, payload } = data;

    switch (type) {
      case 'auth':
        await this.handleAuth(ws, token);
        break;
      
      case 'subscribe':
        await this.handleSubscribe(ws, payload);
        break;
      
      case 'unsubscribe':
        await this.handleUnsubscribe(ws, payload);
        break;
      
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  async handleAuth(ws, token) {
    try {
      if (!token) {
        ws.send(JSON.stringify({ error: 'Token required for authentication' }));
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xosmox-secret');
      
      // Verify user exists and is active
      const userResult = await pool.query(
        'SELECT id, email, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        ws.send(JSON.stringify({ error: 'Invalid or inactive user' }));
        return;
      }

      const user = userResult.rows[0];
      ws.userId = user.id;
      ws.userEmail = user.email;
      
      // Store client connection
      this.clients.set(user.id, ws);
      this.subscriptions.set(user.id, new Set());

      ws.send(JSON.stringify({
        type: 'auth_success',
        message: 'Authentication successful',
        userId: user.id
      }));

      // Send user's current balances
      await this.sendUserBalances(ws, user.id);

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.send(JSON.stringify({ error: 'Authentication failed' }));
    }
  }

  async handleSubscribe(ws, payload) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ error: 'Authentication required' }));
      return;
    }

    const { channels } = payload;
    const userSubscriptions = this.subscriptions.get(ws.userId);

    for (const channel of channels) {
      userSubscriptions.add(channel);
    }

    ws.send(JSON.stringify({
      type: 'subscription_success',
      channels: Array.from(userSubscriptions)
    }));
  }

  async handleUnsubscribe(ws, payload) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ error: 'Authentication required' }));
      return;
    }

    const { channels } = payload;
    const userSubscriptions = this.subscriptions.get(ws.userId);

    for (const channel of channels) {
      userSubscriptions.delete(channel);
    }

    ws.send(JSON.stringify({
      type: 'unsubscription_success',
      channels: Array.from(userSubscriptions)
    }));
  }

  handleDisconnection(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      this.subscriptions.delete(ws.userId);
      console.log(`User ${ws.userId} disconnected`);
    }
  }

  async sendUserBalances(ws, userId) {
    try {
      const result = await pool.query(
        'SELECT currency, balance, locked_balance FROM wallets WHERE user_id = $1',
        [userId]
      );

      ws.send(JSON.stringify({
        type: 'balances',
        data: result.rows,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error sending user balances:', error);
    }
  }

  // Broadcast to all subscribed users
  broadcast(channel, data) {
    for (const [userId, ws] of this.clients) {
      const userSubscriptions = this.subscriptions.get(userId);
      
      if (userSubscriptions && userSubscriptions.has(channel)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'broadcast',
            channel,
            data,
            timestamp: new Date().toISOString()
          }));
        }
      }
    }
  }

  // Send message to specific user
  sendToUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'user_message',
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Notify user of order updates
  notifyOrderUpdate(userId, order) {
    this.sendToUser(userId, {
      type: 'order_update',
      order
    });
  }

  // Notify user of trade execution
  notifyTradeExecution(userId, trade) {
    this.sendToUser(userId, {
      type: 'trade_execution',
      trade
    });
  }

  // Notify user of balance changes
  async notifyBalanceUpdate(userId) {
    const ws = this.clients.get(userId);
    if (ws) {
      await this.sendUserBalances(ws, userId);
    }
  }

  // Start broadcasting market data
  startMarketDataBroadcast() {
    // Broadcast ticker updates every 5 seconds
    setInterval(() => {
      const mockTickers = [
        {
          symbol: 'BTCUSDT',
          price: (Math.random() * 50000 + 20000).toFixed(2),
          change24h: (Math.random() * 2000 - 1000).toFixed(2),
          volume24h: (Math.random() * 1000).toFixed(2)
        },
        {
          symbol: 'ETHUSDT',
          price: (Math.random() * 3000 + 1000).toFixed(2),
          change24h: (Math.random() * 200 - 100).toFixed(2),
          volume24h: (Math.random() * 5000).toFixed(2)
        }
      ];

      this.broadcast('tickers', mockTickers);
    }, 5000);

    // Broadcast order book updates every 2 seconds
    setInterval(() => {
      const symbols = ['BTCUSDT', 'ETHUSDT'];
      
      for (const symbol of symbols) {
        const mockOrderBook = {
          symbol,
          bids: Array.from({ length: 10 }, () => [
            (Math.random() * 50000 + 20000).toFixed(2),
            (Math.random() * 10).toFixed(4)
          ]),
          asks: Array.from({ length: 10 }, () => [
            (Math.random() * 50000 + 20000).toFixed(2),
            (Math.random() * 10).toFixed(4)
          ])
        };

        this.broadcast(`orderbook_${symbol}`, mockOrderBook);
      }
    }, 2000);
  }
}

module.exports = WebSocketService;