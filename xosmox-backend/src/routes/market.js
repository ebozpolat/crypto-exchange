const express = require('express');
const { pool } = require('../../config/database');
const { getRedisClient } = require('../../config/redis');
const router = express.Router();

// Get market data for all symbols
router.get('/tickers', async (req, res) => {
  try {
    // In production, this would fetch real market data
    const mockTickers = [
      {
        symbol: 'BTCUSDT',
        price: '43250.50',
        change24h: '2.45',
        changePercent24h: '5.67',
        high24h: '44100.00',
        low24h: '42800.00',
        volume24h: '1234.56',
        quoteVolume24h: '53456789.12'
      },
      {
        symbol: 'ETHUSDT',
        price: '2650.75',
        change24h: '-45.25',
        changePercent24h: '-1.68',
        high24h: '2720.00',
        low24h: '2620.00',
        volume24h: '5678.90',
        quoteVolume24h: '15234567.89'
      },
      {
        symbol: 'ADAUSDT',
        price: '0.4825',
        change24h: '0.0125',
        changePercent24h: '2.66',
        high24h: '0.4950',
        low24h: '0.4700',
        volume24h: '12345678.90',
        quoteVolume24h: '5987654.32'
      }
    ];

    res.json({ tickers: mockTickers });

  } catch (error) {
    console.error('Tickers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get ticker for specific symbol
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Mock data - in production, fetch from market data provider
    const mockTicker = {
      symbol: symbol.toUpperCase(),
      price: (Math.random() * 50000 + 1000).toFixed(2),
      change24h: (Math.random() * 200 - 100).toFixed(2),
      changePercent24h: (Math.random() * 10 - 5).toFixed(2),
      high24h: (Math.random() * 55000 + 1000).toFixed(2),
      low24h: (Math.random() * 45000 + 1000).toFixed(2),
      volume24h: (Math.random() * 10000).toFixed(2),
      quoteVolume24h: (Math.random() * 100000000).toFixed(2),
      timestamp: new Date().toISOString()
    };

    res.json({ ticker: mockTicker });

  } catch (error) {
    console.error('Ticker fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch ticker data' });
  }
});

// Get recent trades for symbol
router.get('/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT price, quantity, created_at,
       CASE WHEN buy_order_id < sell_order_id THEN 'buy' ELSE 'sell' END as side
       FROM trades 
       WHERE symbol = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [symbol.toUpperCase(), limit]
    );

    res.json({ 
      symbol: symbol.toUpperCase(),
      trades: result.rows 
    });

  } catch (error) {
    console.error('Recent trades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recent trades' });
  }
});

// Get kline/candlestick data
router.get('/klines/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;

    // Mock kline data - in production, this would come from a time-series database
    const mockKlines = [];
    const now = Date.now();
    const intervalMs = getIntervalMs(interval);

    for (let i = limit - 1; i >= 0; i--) {
      const openTime = now - (i * intervalMs);
      const basePrice = Math.random() * 50000 + 20000;
      const open = basePrice + (Math.random() - 0.5) * 1000;
      const close = open + (Math.random() - 0.5) * 2000;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      const volume = Math.random() * 100;

      mockKlines.push([
        openTime,
        open.toFixed(2),
        high.toFixed(2),
        low.toFixed(2),
        close.toFixed(2),
        volume.toFixed(4),
        openTime + intervalMs - 1,
        (volume * close).toFixed(2),
        Math.floor(Math.random() * 100),
        (volume * 0.7).toFixed(4),
        (volume * close * 0.7).toFixed(2),
        '0'
      ]);
    }

    res.json({
      symbol: symbol.toUpperCase(),
      interval,
      klines: mockKlines
    });

  } catch (error) {
    console.error('Klines fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch kline data' });
  }
});

// Get 24hr statistics
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get 24hr stats from database
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as trade_count,
        SUM(quantity) as volume,
        SUM(quantity * price) as quote_volume,
        MIN(price) as low_price,
        MAX(price) as high_price,
        (SELECT price FROM trades WHERE symbol = $1 ORDER BY created_at DESC LIMIT 1) as last_price,
        (SELECT price FROM trades WHERE symbol = $1 AND created_at >= NOW() - INTERVAL '24 hours' ORDER BY created_at ASC LIMIT 1) as open_price
       FROM trades 
       WHERE symbol = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
      [symbol.toUpperCase()]
    );

    const stats = statsResult.rows[0];
    const priceChange = stats.last_price - stats.open_price;
    const priceChangePercent = stats.open_price ? (priceChange / stats.open_price * 100) : 0;

    res.json({
      symbol: symbol.toUpperCase(),
      priceChange: priceChange?.toFixed(2) || '0.00',
      priceChangePercent: priceChangePercent?.toFixed(2) || '0.00',
      lastPrice: stats.last_price || '0.00',
      volume: stats.volume || '0.00',
      quoteVolume: stats.quote_volume || '0.00',
      openPrice: stats.open_price || '0.00',
      highPrice: stats.high_price || '0.00',
      lowPrice: stats.low_price || '0.00',
      count: parseInt(stats.trade_count) || 0,
      openTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      closeTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get exchange info
router.get('/exchangeInfo', async (req, res) => {
  try {
    const exchangeInfo = {
      timezone: 'UTC',
      serverTime: Date.now(),
      rateLimits: [
        {
          rateLimitType: 'REQUEST_WEIGHT',
          interval: 'MINUTE',
          intervalNum: 1,
          limit: 1200
        },
        {
          rateLimitType: 'ORDERS',
          interval: 'SECOND',
          intervalNum: 10,
          limit: 50
        }
      ],
      symbols: [
        {
          symbol: 'BTCUSDT',
          status: 'TRADING',
          baseAsset: 'BTC',
          baseAssetPrecision: 8,
          quoteAsset: 'USDT',
          quotePrecision: 8,
          quoteAssetPrecision: 8,
          orderTypes: ['LIMIT', 'MARKET'],
          icebergAllowed: false,
          ocoAllowed: false,
          isSpotTradingAllowed: true,
          isMarginTradingAllowed: false,
          filters: [
            {
              filterType: 'PRICE_FILTER',
              minPrice: '0.01000000',
              maxPrice: '1000000.00000000',
              tickSize: '0.01000000'
            },
            {
              filterType: 'LOT_SIZE',
              minQty: '0.00000100',
              maxQty: '9000.00000000',
              stepSize: '0.00000100'
            }
          ]
        },
        {
          symbol: 'ETHUSDT',
          status: 'TRADING',
          baseAsset: 'ETH',
          baseAssetPrecision: 8,
          quoteAsset: 'USDT',
          quotePrecision: 8,
          quoteAssetPrecision: 8,
          orderTypes: ['LIMIT', 'MARKET'],
          icebergAllowed: false,
          ocoAllowed: false,
          isSpotTradingAllowed: true,
          isMarginTradingAllowed: false,
          filters: [
            {
              filterType: 'PRICE_FILTER',
              minPrice: '0.01000000',
              maxPrice: '100000.00000000',
              tickSize: '0.01000000'
            },
            {
              filterType: 'LOT_SIZE',
              minQty: '0.00001000',
              maxQty: '100000.00000000',
              stepSize: '0.00001000'
            }
          ]
        }
      ]
    };

    res.json(exchangeInfo);

  } catch (error) {
    console.error('Exchange info fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange info' });
  }
});

// Helper function to convert interval to milliseconds
function getIntervalMs(interval) {
  const intervals = {
    '1m': 60 * 1000,
    '3m': 3 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '8h': 8 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000
  };

  return intervals[interval] || intervals['1h'];
}

module.exports = router;