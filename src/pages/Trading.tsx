import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface Trade {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

const Trading: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock data - replace with real data from API
  const [currentPrice, setCurrentPrice] = useState(43250.50);
  const [priceChange, setPriceChange] = useState(2.45);
  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 43249.50, quantity: 0.5, total: 21624.75 },
      { price: 43248.00, quantity: 1.2, total: 51897.60 },
      { price: 43247.25, quantity: 0.8, total: 34597.80 },
      { price: 43246.50, quantity: 2.1, total: 90817.65 },
      { price: 43245.75, quantity: 0.3, total: 12973.73 },
    ] as OrderBookEntry[],
    asks: [
      { price: 43251.00, quantity: 0.7, total: 30275.70 },
      { price: 43252.50, quantity: 1.5, total: 64887.75 },
      { price: 43253.25, quantity: 0.9, total: 38927.93 },
      { price: 43254.00, quantity: 1.8, total: 77857.20 },
      { price: 43255.50, quantity: 0.4, total: 17302.20 },
    ] as OrderBookEntry[],
  });
  
  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    { id: '1', price: 43250.50, quantity: 0.25, side: 'buy', timestamp: '14:32:15' },
    { id: '2', price: 43249.75, quantity: 0.18, side: 'sell', timestamp: '14:32:10' },
    { id: '3', price: 43251.00, quantity: 0.42, side: 'buy', timestamp: '14:32:05' },
    { id: '4', price: 43248.25, quantity: 0.33, side: 'sell', timestamp: '14:32:00' },
    { id: '5', price: 43252.75, quantity: 0.15, side: 'buy', timestamp: '14:31:55' },
  ]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock order placement - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setPrice('');
      setQuantity('');
      
      alert(`${side.toUpperCase()} order placed successfully!`);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 8) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trading</h1>
        <p className="text-gray-600">Trade cryptocurrencies with real-time market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market Info */}
        <div className="lg:col-span-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedPair}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    priceChange >= 0 ? 'text-success-500' : 'text-danger-500'
                  }`}>
                    {priceChange >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h3>
            <div className="space-y-4">
              {/* Asks */}
              <div>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 mb-2">
                  <div>Price (USDT)</div>
                  <div className="text-right">Amount (BTC)</div>
                  <div className="text-right">Total</div>
                </div>
                <div className="space-y-1">
                  {orderBook.asks.slice().reverse().map((ask, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-danger-500 font-medium">
                        {formatNumber(ask.price, 2)}
                      </div>
                      <div className="text-right text-gray-900">
                        {formatNumber(ask.quantity)}
                      </div>
                      <div className="text-right text-gray-600">
                        {formatNumber(ask.total, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Price */}
              <div className="border-t border-b border-gray-200 py-2">
                <div className="text-center">
                  <span className={`text-lg font-bold ${
                    priceChange >= 0 ? 'text-success-500' : 'text-danger-500'
                  }`}>
                    {formatNumber(currentPrice, 2)}
                  </span>
                </div>
              </div>

              {/* Bids */}
              <div>
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-success-500 font-medium">
                        {formatNumber(bid.price, 2)}
                      </div>
                      <div className="text-right text-gray-900">
                        {formatNumber(bid.quantity)}
                      </div>
                      <div className="text-right text-gray-600">
                        {formatNumber(bid.total, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  side === 'buy'
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 px-4 rounded-md font-medium ${
                  side === 'sell'
                    ? 'bg-danger-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  orderType === 'limit'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Limit
              </button>
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  orderType === 'market'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Market
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (BTC)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  className="input"
                  placeholder="0.00000000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    className="py-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    onClick={() => {
                      // Mock calculation - replace with actual balance calculation
                      const mockBalance = 1.5;
                      setQuantity((mockBalance * percent / 100).toFixed(8));
                    }}
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Total:</span>
                  <span>
                    {price && quantity 
                      ? formatCurrency(parseFloat(price) * parseFloat(quantity))
                      : '$0.00'
                    }
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full btn ${
                    side === 'buy' ? 'btn-success' : 'btn-danger'
                  }`}
                >
                  {loading 
                    ? 'Placing Order...' 
                    : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.split('/')[0]}`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="lg:col-span-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-xs font-medium text-gray-500">
                    <th className="text-left pb-2">Time</th>
                    <th className="text-right pb-2">Price (USDT)</th>
                    <th className="text-right pb-2">Amount (BTC)</th>
                    <th className="text-right pb-2">Total (USDT)</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="text-sm">
                      <td className="py-1 text-gray-600">{trade.timestamp}</td>
                      <td className={`py-1 text-right font-medium ${
                        trade.side === 'buy' ? 'text-success-500' : 'text-danger-500'
                      }`}>
                        {formatNumber(trade.price, 2)}
                      </td>
                      <td className="py-1 text-right text-gray-900">
                        {formatNumber(trade.quantity)}
                      </td>
                      <td className="py-1 text-right text-gray-600">
                        {formatNumber(trade.price * trade.quantity, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;