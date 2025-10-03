import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartFocus } from '@/components/trader/ChartFocus';
import { useAlpacaAccount, useAlpacaPositions, useAlpacaPortfolioHistory } from '@/integrations/alpaca/hooks';
import { useMarketStatus } from '@/hooks/useMarketStatus';
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
  const [focusMode, setFocusMode] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('1M');

  // Fetch real Alpaca data
  const { data: account, isLoading: accountLoading, error: accountError } = useAlpacaAccount();
  const { data: positionsData, isLoading: positionsLoading, error: positionsError } = useAlpacaPositions();
  const { data: portfolioChart, isLoading: chartLoading } = useAlpacaPortfolioHistory(chartTimeframe, '1D');
  const { data: marketStatus } = useMarketStatus();

  // Debug logging
  console.log('🔍 BentoDashboard - Alpaca Account Data:', {
    account,
    accountLoading,
    accountError,
  });
  
  console.log('🔍 BentoDashboard - Alpaca Positions Data:', {
    positionsData,
    positionsLoading,
    positionsError,
  });

  // Use real Alpaca account data
  const portfolioValue = account?.portfolioValue || 0;
  const dailyPnL = account?.dailyPnL || 0;
  const dailyPnLPercent = account?.dailyPnLPercent || 0;
  const isPositive = dailyPnL >= 0;

  // Get positions
  const positions = positionsData?.positions || [];
  const recentTrades = positionsData?.recentTrades || [];

  // Active Amps (placeholder for now)
  const activeAmps = [
    { id: 1, name: 'TubeAmp v1', status: 'active', pnl: 247.50, pnlPercent: 3.2, allocated: 5000 },
    { id: 2, name: 'Momentum Pro', status: 'active', pnl: -42.10, pnlPercent: -0.8, allocated: 3000 },
  ];

  // Real chart data from Alpaca portfolio history
  const chartData = portfolioChart?.map(bar => ({
    time: new Date(bar.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: bar.value
  })) || [];

  return (
    <div className="min-h-screen bg-[#1F1F1F] p-4 md:p-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3 md:gap-4">
        
        {/* Portfolio Value Card - Top Left */}
        <Card className="col-span-12 md:col-span-4 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <p className="text-sm text-gray-400 mb-2">Total Portfolio Value</p>
          {accountLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-[#0A0A0A] rounded mb-3" />
              <div className="h-6 bg-[#0A0A0A] rounded w-2/3" />
            </div>
          ) : accountError ? (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm mb-2">⚠️ Connection Error</p>
              <p className="text-gray-500 text-xs">Unable to load account data</p>
              <p className="text-gray-600 text-xs mt-1">{accountError.message}</p>
            </div>
          ) : !account ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-2">📊 No Account Data</p>
              <p className="text-gray-500 text-xs">Connect your Alpaca account</p>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold text-white mb-3 font-mono">
                ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-[#0AEF80]" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-[#FF3B69]" />
                )}
                <span className={`text-lg font-semibold ${isPositive ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                  {isPositive ? '+' : ''}${Math.abs(dailyPnL).toFixed(2)} ({isPositive ? '+' : ''}{dailyPnLPercent.toFixed(2)}%)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Today's change</p>
            </>
          )}
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => setFocusMode(true)}
              >
                <Maximize2 size={18} />
              </Button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex gap-2 mb-4">
              {['1D', '5D', '1M', '3M', '1Y', 'ALL'].map(tf => (
                <Button
                  key={tf}
                  variant={chartTimeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartTimeframe(tf)}
                  className={chartTimeframe === tf ? 'bg-[#9540FF]' : 'border-[#2A2A2A] text-gray-400'}
                >
                  {tf}
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
                  tick={{ fill: '#666', fontSize: 11 }}
                  interval="preserveStartEnd"
                  tickCount={6}
                />
                <YAxis 
                  dataKey="value"
                  stroke="#2A2A2A"
                  tick={{ fill: '#666', fontSize: 11 }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
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

        {/* Active Positions - Right Sidebar */}
        <Card className="col-span-12 md:col-span-3 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Positions</h3>
            <Badge variant="secondary" className="bg-[#9540FF]/20 text-[#9540FF] border-0">
              {positions.length}
            </Badge>
          </div>

          {positionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#0A0A0A] rounded-xl p-3 animate-pulse">
                  <div className="h-12 bg-[#2A2A2A] rounded" />
                </div>
              ))}
            </div>
          ) : positionsError ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-1">⚠️ Connection Error</p>
              <p className="text-gray-500 text-xs">{positionsError.message}</p>
            </div>
          ) : !positions || positions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No open positions</p>
              <p className="text-gray-600 text-xs mt-1">Start trading to see positions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map(position => {
                const isProfit = position.unrealizedPnL >= 0;
                return (
                  <div 
                    key={position.symbol}
                    className="bg-[#0A0A0A] rounded-xl p-3 hover:bg-[#004751] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{position.symbol}</p>
                        <p className="text-xs text-gray-500">{position.quantity} shares @ ${position.averageCost.toFixed(2)}</p>
                      </div>
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-[#0AEF80]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#FF3B69]" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-semibold text-white">
                        ${position.currentPrice.toFixed(2)}
                      </span>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isProfit ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                          {isProfit ? '+' : ''}${Math.abs(position.unrealizedPnL).toFixed(2)}
                        </p>
                        <p className={`text-xs ${isProfit ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                          {isProfit ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

        {/* Recent Trades - Bottom Right */}
        <Card className="col-span-12 md:col-span-4 bg-[#1A1A1A] border-[#2A2A2A] p-6 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
          
          {positionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-[#0A0A0A] rounded" />
                </div>
              ))}
            </div>
          ) : positionsError ? (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-1">⚠️ Connection Error</p>
              <p className="text-gray-500 text-xs">{positionsError.message}</p>
            </div>
          ) : !recentTrades || recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No recent trades</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.slice(0, 5).map((trade, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${trade.action === 'BUY' ? 'bg-[#0AEF80]' : 'bg-[#FF3B69]'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{trade.symbol} {trade.action} {trade.quantity} @ ${trade.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{trade.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* Full-Screen Chart Focus Mode */}
      {focusMode && (
        <ChartFocus 
          symbol="AAPL" 
          onClose={() => setFocusMode(false)} 
        />
      )}
    </div>
  );
}
