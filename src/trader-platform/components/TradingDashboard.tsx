import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target,
  BookOpen,
  Zap,
  Search,
  Activity,
  Shield,
  Clock,
  Info
} from "lucide-react";

export const TradingDashboard = () => {
  const [knowledgeMode, setKnowledgeMode] = useState<'simple' | 'academic'>('simple');
  const [quickTradeSymbol, setQuickTradeSymbol] = useState('');
  const { toast } = useToast();

  // Updated demo data
  const portfolioValue = 125450;
  const dailyPnL = 2340;
  const dailyPnLPercent = 1.87;
  const buyingPower = 45230;

  const handleTradeClick = () => {
    toast({
      title: "Trading Disabled",
      description: "Trading will be enabled after regulatory approval",
      variant: "default",
    });
  };

  const getTooltipContent = (type: string) => {
    const tooltips = {
      simple: {
        vix: "VIX measures market fear - higher means more volatile",
        sharpe: "Higher Sharpe ratio means better risk-adjusted returns",
        drawdown: "Largest peak-to-trough decline in portfolio value",
        momentum: "Strategy that buys rising stocks and sells falling ones"
      },
      academic: {
        vix: "CBOE Volatility Index: implied volatility of S&P 500 index options",
        sharpe: "Risk-adjusted return metric: (Return - Risk-free rate) / Standard deviation",
        drawdown: "Maximum observed loss from peak to trough of portfolio value",
        momentum: "Cross-sectional momentum strategy based on 12-1 month formation period"
      }
    };
    return tooltips[knowledgeMode][type] || "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Dark Gray */}
      <header className="bg-gray-800 text-white px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-bold">TubeAmp Trader v5.0</h1>
          </div>

          {/* Account Stats */}
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="text-xs text-gray-300">Portfolio Value</p>
              <p className="text-lg font-bold">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-300">Daily P&L</p>
              <div className="flex items-center space-x-1">
                {dailyPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <p className={`text-lg font-bold ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(dailyPnL).toLocaleString()} ({dailyPnLPercent > 0 ? '+' : ''}{dailyPnLPercent}%)
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-300">Buying Power</p>
              <p className="text-lg font-bold">${buyingPower.toLocaleString()}</p>
            </div>
          </div>

          {/* Knowledge Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300">Knowledge Mode:</span>
            <Button
              variant={knowledgeMode === 'simple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKnowledgeMode('simple')}
              className="h-8 px-3 text-xs"
            >
              Simple
            </Button>
            <Button
              variant={knowledgeMode === 'academic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKnowledgeMode('academic')}
              className="h-8 px-3 text-xs"
            >
              Academic
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Strong Signals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Strong Signals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <span className="font-semibold text-green-800">NVDA</span>
                  <p className="text-xs text-green-600">Strong Buy</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-800">82%</span>
                  <p className="text-xs text-green-600">$485.25</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <span className="font-semibold text-red-800">TSLA</span>
                  <p className="text-xs text-red-600">Strong Sell</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-red-800">75%</span>
                  <p className="text-xs text-red-600">$275.50</p>
                </div>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white w-full" 
                size="sm" 
                onClick={handleTradeClick}
              >
                Execute Top Signal
              </Button>
            </CardContent>
          </Card>

          {/* Quick Trade Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Quick Trade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter symbol..."
                  value={quickTradeSymbol}
                  onChange={(e) => setQuickTradeSymbol(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleTradeClick}
                >
                  BUY
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleTradeClick}
                >
                  SELL
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Paper trading mode enabled
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* Active Positions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Active Positions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-gray-500 uppercase">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Avg Cost</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 font-medium">AAPL</td>
                      <td className="text-right py-3">100</td>
                      <td className="text-right py-3">$180.50</td>
                      <td className="text-right py-3">$182.45</td>
                      <td className="text-right py-3 text-green-600 font-medium">+$195</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">GOOGL</td>
                      <td className="text-right py-3">50</td>
                      <td className="text-right py-3">$141.25</td>
                      <td className="text-right py-3">$142.80</td>
                      <td className="text-right py-3 text-green-600 font-medium">+$77.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Recent Trades</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800">BUY</Badge>
                    <span className="font-medium">AAPL</span>
                    <span className="text-sm text-gray-500">25 @ $189.45</span>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-red-100 text-red-800">SELL</Badge>
                    <span className="font-medium">NVDA</span>
                    <span className="text-sm text-gray-500">10 @ $535.20</span>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">BUY</Badge>
                    <span className="font-medium">QQQ</span>
                    <span className="text-sm text-gray-500">50 @ $365.80</span>
                  </div>
                  <span className="text-xs text-gray-500">1 hr ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Strategy Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Strategy Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border">
                  <div>
                    <span className="font-medium text-purple-800">Momentum</span>
                    <p className="text-xs text-purple-600">7-day return</p>
                  </div>
                  <span className="text-lg font-bold text-purple-800">+8.2%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                  <div>
                    <span className="font-medium text-blue-800">Mean Reversion</span>
                    <p className="text-xs text-blue-600">30-day return</p>
                  </div>
                  <span className="text-lg font-bold text-blue-800">+12.5%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                  <div>
                    <span className="font-medium text-green-800">ML Predictions</span>
                    <p className="text-xs text-green-600">Overall accuracy</p>
                  </div>
                  <span className="text-lg font-bold text-green-800">87.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span>Market Context</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded-lg border">
                  <p className="text-xl font-bold text-orange-800">18.2</p>
                  <p className="text-xs text-orange-600">VIX Level</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border">
                  <p className="text-xl font-bold text-blue-800">Pre-Market</p>
                  <p className="text-xs text-blue-600">Session</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Sentiment</span>
                  <span className="font-medium text-green-600">Bullish</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volatility Regime</span>
                  <span className="font-medium text-orange-600">Moderate</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trend Direction</span>
                  <span className="font-medium text-green-600">Up</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Risk Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-red-50 rounded-lg border">
                  <p className="text-lg font-bold text-red-800">2.1%</p>
                  <p className="text-xs text-red-600">Portfolio Risk</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg border">
                  <p className="text-lg font-bold text-yellow-800">1.4</p>
                  <p className="text-xs text-yellow-600">Sharpe Ratio</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Max Drawdown</span>
                  <span className="font-medium text-red-600">-3.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Win Rate</span>
                  <span className="font-medium text-green-600">78.4%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Risk Score</span>
                  <span className="font-medium text-yellow-600">Medium</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};