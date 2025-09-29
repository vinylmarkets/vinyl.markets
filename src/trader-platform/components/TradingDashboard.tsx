import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target,
  BookOpen,
  Zap
} from "lucide-react";

export const TradingDashboard = () => {
  const [knowledgeMode, setKnowledgeMode] = useState<'simple' | 'academic'>('simple');

  // Mock data
  const portfolioValue = 25847.32;
  const dailyPnL = 342.18;
  const dailyPnLPercent = 1.34;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-foreground">Trader Platform</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-bold text-foreground">
                  ${portfolioValue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <div className="flex items-center space-x-2">
                  {dailyPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-xl font-bold ${dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(dailyPnL).toLocaleString()} ({dailyPnLPercent > 0 ? '+' : ''}{dailyPnLPercent}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Knowledge Mode:</span>
            <Button
              variant={knowledgeMode === 'simple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKnowledgeMode('simple')}
              className="flex items-center space-x-1"
            >
              <Zap className="h-4 w-4" />
              <span>Simple</span>
            </Button>
            <Button
              variant={knowledgeMode === 'academic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKnowledgeMode('academic')}
              className="flex items-center space-x-1"
            >
              <BookOpen className="h-4 w-4" />
              <span>Academic</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Signals Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Trading Signals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">AAPL</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  BUY
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {knowledgeMode === 'simple' 
                  ? "Strong upward momentum detected"
                  : "RSI oversold condition with bullish divergence on MACD histogram"
                }
              </p>
              <div className="flex justify-between text-xs">
                <span>Confidence: 87%</span>
                <span>Target: $195.50</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">TSLA</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  SELL
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {knowledgeMode === 'simple' 
                  ? "Showing signs of weakness"
                  : "Bearish crossover on 20/50 EMA with declining volume profile"
                }
              </p>
              <div className="flex justify-between text-xs">
                <span>Confidence: 74%</span>
                <span>Target: $245.00</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">NVDA</span>
                <Badge variant="outline">
                  HOLD
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {knowledgeMode === 'simple' 
                  ? "Consolidating in range"
                  : "Trading within established support/resistance channel with neutral momentum"
                }
              </p>
              <div className="flex justify-between text-xs">
                <span>Confidence: 62%</span>
                <span>Range: $520-540</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Open Positions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">SPY</span>
                <span className="text-green-500 font-medium">+$127.45</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>100 shares @ $412.30</span>
                <span>+0.31%</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">QQQ</span>
                <span className="text-red-500 font-medium">-$45.20</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>50 shares @ $365.80</span>
                <span>-0.25%</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">MSFT Call</span>
                <span className="text-green-500 font-medium">+$89.00</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>2 contracts @ $4.50</span>
                <span>+9.8%</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total P&L</span>
                <span className="text-green-500 font-bold">+$171.25</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-green-500">78.4%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">2.3</p>
                <p className="text-xs text-muted-foreground">Profit Factor</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-foreground">47</p>
                <p className="text-xs text-muted-foreground">Total Trades</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">1.47</p>
                <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recent Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Week</span>
                  <span className="text-green-500 font-medium">+2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <span className="text-green-500 font-medium">+8.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">3 Months</span>
                  <span className="text-green-500 font-medium">+24.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">YTD</span>
                  <span className="text-green-500 font-medium">+31.2%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {knowledgeMode === 'simple' 
                  ? "Performance based on algorithmic signals"
                  : "Risk-adjusted returns calculated using modified Sharpe ratio with volatility weighting"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};