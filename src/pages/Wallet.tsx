import React, { useState, useEffect } from 'react';
import { Plus, Minus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface Balance {
  asset: string;
  available: number;
  locked: number;
  total: number;
  usdValue: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade';
  asset: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  txHash?: string;
}

const Wallet: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // Mock data - replace with actual API calls
      setBalances([
        {
          asset: 'BTC',
          available: 0.15234567,
          locked: 0.00500000,
          total: 0.15734567,
          usdValue: 6789.45,
        },
        {
          asset: 'ETH',
          available: 2.45678901,
          locked: 0.10000000,
          total: 2.55678901,
          usdValue: 6789.12,
        },
        {
          asset: 'USDT',
          available: 1250.75,
          locked: 0.00,
          total: 1250.75,
          usdValue: 1250.75,
        },
        {
          asset: 'BNB',
          available: 5.12345678,
          locked: 0.00000000,
          total: 5.12345678,
          usdValue: 1615.23,
        },
        {
          asset: 'ADA',
          available: 1000.00000000,
          locked: 0.00000000,
          total: 1000.00000000,
          usdValue: 485.00,
        },
      ]);

      setTransactions([
        {
          id: '1',
          type: 'deposit',
          asset: 'BTC',
          amount: 0.05000000,
          status: 'completed',
          timestamp: '2024-01-15 14:30:25',
          txHash: '0x1234...5678',
        },
        {
          id: '2',
          type: 'trade',
          asset: 'ETH',
          amount: -0.25000000,
          status: 'completed',
          timestamp: '2024-01-15 13:45:12',
        },
        {
          id: '3',
          type: 'withdrawal',
          asset: 'USDT',
          amount: -500.00,
          status: 'pending',
          timestamp: '2024-01-15 12:20:08',
          txHash: '0xabcd...efgh',
        },
        {
          id: '4',
          type: 'deposit',
          asset: 'BNB',
          amount: 2.00000000,
          status: 'completed',
          timestamp: '2024-01-14 16:15:33',
          txHash: '0x9876...5432',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
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

  const formatCrypto = (amount: number, decimals: number = 8) => {
    return amount.toFixed(decimals);
  };

  const getTotalPortfolioValue = () => {
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-500 bg-success-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-danger-500 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-success-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-danger-500" />;
      case 'trade':
        return <ArrowUpRight className="h-4 w-4 text-primary-500" />;
      default:
        return null;
    }
  };

  const filteredBalances = hideSmallBalances 
    ? balances.filter(balance => balance.usdValue > 1)
    : balances;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your cryptocurrency balances and transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            <span className="text-sm">{showBalances ? 'Hide' : 'Show'} Balances</span>
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances ? formatCurrency(getTotalPortfolioValue()) : '••••••'}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances 
                  ? formatCurrency(balances.reduce((total, b) => total + (b.available / b.total) * b.usdValue, 0))
                  : '••••••'
                }
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <ArrowDownLeft className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances 
                  ? formatCurrency(balances.reduce((total, b) => total + (b.locked / b.total) * b.usdValue, 0))
                  : '••••••'
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Minus className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Balances */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Balances</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hideSmallBalances}
                onChange={(e) => setHideSmallBalances(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Hide small balances</span>
            </label>
            <div className="flex space-x-2">
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Deposit
              </button>
              <button className="btn btn-secondary">
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Orders
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USD Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBalances.map((balance) => (
                <tr key={balance.asset} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {balance.asset}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{balance.asset}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {showBalances ? formatCrypto(balance.total) : '••••••••'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {showBalances ? formatCrypto(balance.available) : '••••••••'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {showBalances ? formatCrypto(balance.locked) : '••••••••'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {showBalances ? formatCurrency(balance.usdValue) : '••••••'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        Deposit
                      </button>
                      <button className="text-primary-600 hover:text-primary-900">
                        Withdraw
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {transaction.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{transaction.timestamp}</div>
                  {transaction.txHash && (
                    <div className="text-xs text-gray-400">
                      Tx: {transaction.txHash}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  transaction.amount > 0 ? 'text-success-500' : 'text-danger-500'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCrypto(transaction.amount)} {transaction.asset}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;