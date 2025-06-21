import React, { useState } from 'react'
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'

const Wallet: React.FC = () => {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview')

  const balances = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      balance: 0.5432, 
      usdValue: 24516.80, 
      change: 2.5 
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      balance: 3.2145, 
      usdValue: 10286.40, 
      change: -1.2 
    },
    { 
      symbol: 'ADA', 
      name: 'Cardano', 
      balance: 1250.0, 
      usdValue: 562.50, 
      change: 5.8 
    },
    { 
      symbol: 'DOT', 
      name: 'Polkadot', 
      balance: 45.67, 
      usdValue: 1164.09, 
      change: 3.2 
    },
    { 
      symbol: 'USD', 
      name: 'US Dollar', 
      balance: 2500.00, 
      usdValue: 2500.00, 
      change: 0 
    },
  ]

  const transactions = [
    {
      id: '1',
      type: 'deposit',
      asset: 'BTC',
      amount: 0.1,
      usdValue: 4500,
      status: 'completed',
      date: '2024-01-15 14:30',
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'withdraw',
      asset: 'ETH',
      amount: 0.5,
      usdValue: 1600,
      status: 'pending',
      date: '2024-01-15 12:15',
      txHash: '0x8765...4321'
    },
    {
      id: '3',
      type: 'trade',
      asset: 'ADA',
      amount: 500,
      usdValue: 225,
      status: 'completed',
      date: '2024-01-15 10:45',
      txHash: null
    },
  ]

  const totalBalance = balances.reduce((sum, balance) => sum + balance.usdValue, 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your cryptocurrency portfolio</p>
        </div>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">Total Portfolio Value</p>
            <p className="text-3xl font-bold">
              {showBalances ? `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••'}
            </p>
          </div>
          <WalletIcon className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'deposit', name: 'Deposit' },
            { id: 'withdraw', name: 'Withdraw' },
            { id: 'history', name: 'History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Balances */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Assets</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {balances.map((balance) => (
                <div key={balance.symbol} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{balance.symbol}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{balance.name}</p>
                      <p className="text-sm text-gray-500">{balance.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {showBalances ? balance.balance.toLocaleString() : '••••••'} {balance.symbol}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        {showBalances ? `$${balance.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••'}
                      </p>
                      {balance.change !== 0 && (
                        <span className={`text-xs ${balance.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.change >= 0 ? '+' : ''}{balance.change}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'deposit' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Cryptocurrency</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Asset
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>Cardano (ADA)</option>
                <option>Polkadot (DOT)</option>
              </select>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Deposit Address</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border">
                  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                </code>
                <button
                  onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Only send BTC to this address. Sending other assets may result in permanent loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'withdraw' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Cryptocurrency</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Asset
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>Cardano (ADA)</option>
                <option>Polkadot (DOT)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter destination address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.00000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Max
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Network Fee:</strong> 0.0001 BTC (~$4.50)
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>You will receive:</strong> 0.0999 BTC
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Withdraw
            </button>
          </form>
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-100' :
                      tx.type === 'withdraw' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className={`h-4 w-4 ${
                          tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      ) : tx.type === 'withdraw' ? (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      ) : (
                        <WalletIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {tx.type} {tx.asset}
                      </p>
                      <p className="text-sm text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type === 'withdraw' ? '-' : '+'}{tx.amount} {tx.asset}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        ${tx.usdValue.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    {tx.txHash && (
                      <button
                        onClick={() => copyToClipboard(tx.txHash!)}
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <span>{tx.txHash}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallet