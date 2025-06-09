import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { api } from '../services/api';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface PortfolioData {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demo - replace with actual API calls
      setMarketData([
        { symbol: 'BTC/USDT', price: 43250.50, change24h: 2.45, volume24h: 1234567890 },
        { symbol: 'ETH/USDT', price: 2650.75, change24h: -1.23, volume24h: 987654321 },
        { symbol: 'BNB/USDT', price: 315.20, change24h: 0.87, volume24h: 456789123 },
        { symbol: 'ADA/USDT', price: 0.485, change24h: 3.21, volume24h: 234567890 },
      ]);

      setPortfolio({
        totalValue: 12450.75,
        totalPnl: 1250.30,
        totalPnlPercent: 11.15,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your portfolio overview.</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {portfolio.totalPnl >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-danger-500" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total P&L</p>
              <p className={`text-2xl font-bold ${
                portfolio.totalPnl >= 0 ? 'text-success-500' : 'text-danger-500'
              }`}>
                {formatCurrency(portfolio.totalPnl)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">P&L Percentage</p>
              <p className={`text-2xl font-bold ${
                portfolio.totalPnlPercent >= 0 ? 'text-success-500' : 'text-danger-500'
              }`}>
                {portfolio.totalPnlPercent >= 0 ? '+' : ''}{portfolio.totalPnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Market Overview</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All Markets
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Volume
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketData.map((market) => (
                <tr key={market.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{market.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(market.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      market.change24h >= 0 ? 'text-success-500' : 'text-danger-500'
                    }`}>
                      {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(market.volume24h)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn btn-primary">
            Start Trading
          </button>
          <button className="btn btn-secondary">
            Deposit Funds
          </button>
          <button className="btn btn-secondary">
            View Wallet
          </button>
          <button className="btn btn-secondary">
            Trading History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;