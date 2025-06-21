import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Balance',
      value: '$12,345.67',
      change: '+2.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Portfolio Value',
      value: '$8,901.23',
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Active Trades',
      value: '3',
      change: '-1',
      changeType: 'negative',
      icon: Activity,
    },
    {
      name: 'P&L Today',
      value: '+$234.56',
      change: '+12.3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const recentTrades = [
    { pair: 'BTC/USD', type: 'Buy', amount: '0.5 BTC', price: '$45,000', time: '2 min ago' },
    { pair: 'ETH/USD', type: 'Sell', amount: '2.0 ETH', price: '$3,200', time: '5 min ago' },
    { pair: 'ADA/USD', type: 'Buy', amount: '1000 ADA', price: '$0.45', time: '10 min ago' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your trading overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.changeType === 'positive' ? (
                            <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                          )}
                          <span className="ml-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Trades
          </h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentTrades.map((trade, index) => (
                <li key={index} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        trade.type === 'Buy' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.type === 'Buy' ? (
                          <TrendingUp className={`h-4 w-4 text-green-600`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {trade.type} {trade.pair}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {trade.amount} at {trade.price}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {trade.time}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard