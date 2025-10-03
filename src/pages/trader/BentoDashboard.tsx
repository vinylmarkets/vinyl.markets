import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Play,
  Settings,
  Plus,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function BentoDashboard() {
  // Mock data
  const portfolioValue = 47853.21;
  const portfolioChange = 2347.89;
  const portfolioChangePercent = 5.16;
  const isPositive = portfolioChange >= 0;

  const activeAmps = [
    { id: 1, name: 'TubeAmp v1', status: 'active', pnl: 247.50, pnlPercent: 3.2, allocated: 5000 },
    { id: 2, name: 'Momentum Pro', status: 'active', pnl: -42.10, pnlPercent: -0.8, allocated: 3000 },
  ];

  const watchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -5.21, changePercent: -2.10 },
    { symbol: 'NVDA', name: 'NVIDIA', price: 485.62, change: 12.48, changePercent: 2.64 },
  ];

  // Mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    value: 40000 + Math.random() * 10000
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Trading Dashboard</h1>
          <p className="text-gray-400">Monitor your portfolio and active algorithms</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0AEF80] to-[#00C766] text-black font-semibold hover:opacity-90">
          <Plus size={16} className="mr-2" />
          New Trade
        </Button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        
        {/* Portfolio Value Card - Top Left */}
        <Card className="col-span-12 md:col-span-4 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <p className="text-sm text-gray-400 mb-2">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-white mb-3 font-mono">
            ${portfolioValue.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-[#0AEF80]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-[#FF3B69]" />
            )}
            <span className={`text-lg font-semibold ${isPositive ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
              {isPositive ? '+' : ''}{portfolioChange.toFixed(2)} ({isPositive ? '+' : ''}{portfolioChangePercent}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Today's change</p>
        </Card>

        {/* Active Amps - Top Right */}
        <Card className="col-span-12 md:col-span-8 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0AEF80] animate-pulse" />
              <h3 className="text-lg font-semibold text-white">Active Amps</h3>
              <Badge variant="secondary" className="bg-[#9540FF]/20 text-[#9540FF] border-0">
                {activeAmps.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              View All <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAmps.map(amp => {
              const isProfitable = amp.pnl >= 0;
              return (
                <div 
                  key={amp.id}
                  className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#004751] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold mb-1">{amp.name}</p>
                      <p className="text-xs text-gray-500">
                        ${amp.allocated.toLocaleString()} allocated
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings size={14} className="text-gray-400" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold font-mono ${isProfitable ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                      {isProfitable ? '+' : ''}${Math.abs(amp.pnl).toFixed(2)}
                    </span>
                    <span className={`text-sm font-semibold ${isProfitable ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                      {isProfitable ? '+' : ''}{amp.pnlPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Main Chart - Big Hero Card */}
        <Card className="col-span-12 md:col-span-9 bg-[#1A1A1A] border-[#2A2A2A] rounded-2xl overflow-hidden hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Portfolio Performance</h2>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Maximize2 size={18} />
              </Button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex gap-2 mb-4">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(period => (
                <Button
                  key={period}
                  variant="ghost"
                  size="sm"
                  className={period === '1M' ? 'bg-[#9540FF] text-white' : 'text-gray-400'}
                >
                  {period}
                </Button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0AEF80" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#0AEF80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#2A2A2A"
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  stroke="#2A2A2A"
                  tick={{ fill: '#666' }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1A1A', 
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0AEF80" 
                  strokeWidth={3}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Watchlist - Right Sidebar */}
        <Card className="col-span-12 md:col-span-3 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Watchlist</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <Plus size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            {watchlist.map(stock => {
              const isUp = stock.change >= 0;
              return (
                <div 
                  key={stock.symbol}
                  className="bg-[#0A0A0A] rounded-xl p-3 hover:bg-[#004751] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-gray-500">{stock.name}</p>
                    </div>
                    {isUp ? (
                      <TrendingUp className="w-4 h-4 text-[#0AEF80]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#FF3B69]" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold text-white">
                      ${stock.price}
                    </span>
                    <span className={`text-sm font-semibold ${isUp ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                      {isUp ? '+' : ''}{stock.changePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="ghost" className="w-full mt-4 text-gray-400 hover:text-white">
            View All Stocks <ChevronRight size={16} className="ml-1" />
          </Button>
        </Card>

        {/* Quick Actions - Bottom Left */}
        <Card className="col-span-12 md:col-span-4 bg-gradient-to-br from-[#9540FF] to-[#7C3AED] border-0 p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Deploy New Amp</h3>
              <p className="text-sm text-purple-200">Start automated trading</p>
            </div>
            <Play className="w-8 h-8 text-white" />
          </div>
          <Button className="w-full bg-white text-purple-600 font-semibold hover:bg-gray-100">
            Browse Algorithms
          </Button>
        </Card>

        {/* Market Status - Bottom Middle */}
        <Card className="col-span-12 md:col-span-4 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#0AEF80] animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Market Status</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">NYSE</span>
              <Badge className="bg-[#0AEF80]/20 text-[#0AEF80] border-0">Open</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">NASDAQ</span>
              <Badge className="bg-[#0AEF80]/20 text-[#0AEF80] border-0">Open</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Crypto</span>
              <Badge className="bg-[#0AEF80]/20 text-[#0AEF80] border-0">24/7</Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
            <p className="text-xs text-gray-500">Market closes in 3h 24m</p>
          </div>
        </Card>

        {/* Recent Activity - Bottom Right */}
        <Card className="col-span-12 md:col-span-4 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Signals</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0AEF80]" />
              <div className="flex-1">
                <p className="text-sm text-white">AAPL Buy Signal</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FF3B69]" />
              <div className="flex-1">
                <p className="text-sm text-white">TSLA Sell Alert</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#9540FF]" />
              <div className="flex-1">
                <p className="text-sm text-white">NVDA Watch</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
