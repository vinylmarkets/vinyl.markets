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
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-6 h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">TubeAmp Trader v5.0</h1>
          </div>

          {/* Account Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="text-lg font-semibold text-foreground">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Daily P&L</p>
              <div className="flex items-center space-x-1">
                {dailyPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <p className={`text-lg font-semibold ${dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(dailyPnL).toLocaleString()} ({dailyPnLPercent > 0 ? '+' : ''}{dailyPnLPercent}%)
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Buying Power</p>
              <p className="text-lg font-semibold text-foreground">${buyingPower.toLocaleString()}</p>
            </div>
          </div>

          {/* Knowledge Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Knowledge Mode:</span>
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

      {/* Bento Box Layout - Modern Grid */}
      <div className="p-6 space-y-6">
        {/* Top Row - Compact Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Stats */}
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold text-success">78.4%</p>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Risk</p>
                  <p className="text-2xl font-bold text-warning">2.1%</p>
                </div>
                <Shield className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIX Level</p>
                  <p className="text-2xl font-bold text-accent">18.2</p>
                </div>
                <Activity className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Section - Signals & Trading */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Strong Signals */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Strong Signals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-foreground">NVDA</span>
                      <p className="text-xs text-success font-medium">Strong Buy</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-success">82%</span>
                      <p className="text-xs text-muted-foreground">$485.25</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-foreground">TSLA</span>
                      <p className="text-xs text-destructive font-medium">Strong Sell</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-destructive">75%</span>
                      <p className="text-xs text-muted-foreground">$275.50</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                  onClick={handleTradeClick}
                >
                  Execute Top Signal
                </Button>
              </CardContent>
            </Card>

            {/* Quick Trade Panel */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Zap className="h-5 w-5 text-accent" />
                  <span>Quick Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter symbol..."
                    value={quickTradeSymbol}
                    onChange={(e) => setQuickTradeSymbol(e.target.value)}
                    className="flex-1 border-border bg-background"
                  />
                  <Button size="sm" variant="outline" className="border-border">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="default"
                    className="bg-success hover:bg-success/90 text-white font-medium"
                    onClick={handleTradeClick}
                  >
                    BUY
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-destructive hover:bg-destructive/90 text-white font-medium"
                    onClick={handleTradeClick}
                  >
                    SELL
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Paper trading mode enabled
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Section - Positions & Trades */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Positions */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <span>Active Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                        <th className="text-left py-3 font-medium">Symbol</th>
                        <th className="text-right py-3 font-medium">Qty</th>
                        <th className="text-right py-3 font-medium">Avg Cost</th>
                        <th className="text-right py-3 font-medium">Current</th>
                        <th className="text-right py-3 font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">AAPL</td>
                        <td className="text-right py-3 text-muted-foreground">100</td>
                        <td className="text-right py-3 text-muted-foreground">$180.50</td>
                        <td className="text-right py-3 text-foreground">$182.45</td>
                        <td className="text-right py-3 text-success font-medium">+$195</td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">GOOGL</td>
                        <td className="text-right py-3 text-muted-foreground">50</td>
                        <td className="text-right py-3 text-muted-foreground">$141.25</td>
                        <td className="text-right py-3 text-foreground">$142.80</td>
                        <td className="text-right py-3 text-success font-medium">+$77.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Recent Trades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-success/10 text-success border-success/20">BUY</Badge>
                      <span className="font-medium text-foreground">AAPL</span>
                      <span className="text-sm text-muted-foreground">100 @ $180.50</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">SELL</Badge>
                      <span className="font-medium text-foreground">NVDA</span>
                      <span className="text-sm text-muted-foreground">10 @ $535.20</span>
                    </div>
                    <span className="text-xs text-muted-foreground">15 min ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-accent/10 text-accent border-accent/20">BUY</Badge>
                      <span className="font-medium text-foreground">GOOGL</span>
                      <span className="text-sm text-muted-foreground">50 @ $141.25</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hr ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Performance & Risk */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Strategy Performance */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Strategy Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">Momentum</span>
                        <p className="text-xs text-muted-foreground">7-day return</p>
                      </div>
                      <span className="text-lg font-bold text-primary">+8.2%</span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">Mean Reversion</span>
                        <p className="text-xs text-muted-foreground">30-day return</p>
                      </div>
                      <span className="text-lg font-bold text-accent">+12.5%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">ML Predictions</span>
                        <p className="text-xs text-muted-foreground">Overall accuracy</p>
                      </div>
                      <span className="text-lg font-bold text-success">87.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Context */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="h-5 w-5 text-warning" />
                  <span>Market Context</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Sentiment</span>
                    <span className="font-medium text-success">Bullish</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Volatility Regime</span>
                    <span className="font-medium text-warning">Moderate</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trend Direction</span>
                    <span className="font-medium text-success">Up</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Session</span>
                    <span className="font-medium text-accent">Pre-Market</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="h-5 w-5 text-destructive" />
                  <span>Risk Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span className="font-medium text-destructive">-3.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-medium text-accent">1.4</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium text-warning">Medium</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};