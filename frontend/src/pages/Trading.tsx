import React, { useState } from 'react'
import { BarChart3 } from 'lucide-react'

const Trading: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('BTC/USD')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')

  const tradingPairs = [
    { symbol: 'BTC/USD', price: 43250.50, change: 2.45 },
    { symbol: 'ETH/USD', price: 2680.75, change: -1.23 },
    { symbol: 'ADA/USD', price: 0.485, change: 5.67 },
    { symbol: 'SOL/USD', price: 98.32, change: 3.21 },
  ]

  const orderBook = {
    bids: [
      { price: 43248.50, amount: 0.5234 },
      { price: 43247.25, amount: 1.2456 },
      { price: 43246.00, amount: 0.8901 },
      { price: 43245.75, amount: 2.1234 },
      { price: 43244.50, amount: 0.6789 },
    ],
    asks: [
      { price: 43252.75, amount: 0.7890 },
      { price: 43253.00, amount: 1.5678 },
      { price: 43254.25, amount: 0.4321 },
      { price: 43255.50, amount: 2.3456 },
      { price: 43256.75, amount: 0.9876 },
    ]
  }

  const recentTrades = [
    { price: 43250.50, amount: 0.1234, time: '14:32:15', side: 'buy' },
    { price: 43249.75, amount: 0.5678, time: '14:32:10', side: 'sell' },
    { price: 43251.00, amount: 0.2345, time: '14:32:05', side: 'buy' },
    { price: 43248.25, amount: 0.8901, time: '14:32:00', side: 'sell' },
    { price: 43252.50, amount: 0.3456, time: '14:31:55', side: 'buy' },
  ]

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Order submitted:', { selectedPair, orderType, side, amount, price })
    // Here you would typically send the order to your backend
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading</h1>
          <p className="text-gray-600">Trade cryptocurrencies with real-time market data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trading Pairs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Markets</h2>
              <div className="space-y-3">
                {tradingPairs.map((pair) => (
                  <div
                    key={pair.symbol}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPair === pair.symbol
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPair(pair.symbol)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{pair.symbol}</span>
                      <span className={`text-sm ${pair.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pair.change >= 0 ? '+' : ''}{pair.change}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${pair.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart and Order Book */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{selectedPair} Chart</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart placeholder - Integration with charting library needed</p>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-green-600 mb-2">Bids</h3>
                  <div className="space-y-1">
                    {orderBook.bids.map((bid, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-green-600">${bid.price.toLocaleString()}</span>
                        <span className="text-gray-600">{bid.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-600 mb-2">Asks</h3>
                  <div className="space-y-1">
                    {orderBook.asks.map((ask, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-red-600">${ask.price.toLocaleString()}</span>
                        <span className="text-gray-600">{ask.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h2>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                  <div className="flex rounded-lg border border-gray-300">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-lg ${
                        orderType === 'market'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setOrderType('market')}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-lg ${
                        orderType === 'limit'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setOrderType('limit')}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Buy/Sell */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
                  <div className="flex rounded-lg border border-gray-300">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-lg ${
                        side === 'buy'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSide('buy')}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-lg ${
                        side === 'sell'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSide('sell')}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.00000001"
                  />
                </div>

                {/* Price (only for limit orders) */}
                {orderType === 'limit' && (
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                    side === 'buy'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                >
                  {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                </button>
              </form>
            </div>

            {/* Recent Trades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trades</h2>
              <div className="space-y-2">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                      ${trade.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600">{trade.amount}</span>
                    <span className="text-gray-500">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading