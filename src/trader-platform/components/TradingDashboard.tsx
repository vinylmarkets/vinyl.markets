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

      {/* Compact Bento Layout */}
      <div className="p-4 space-y-4">
        {/* Top Row - Compact Metrics */}
        <div className="grid grid-cols-6 gap-3">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-lg font-bold text-success">78.4%</p>
                </div>
                <Target className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className="text-lg font-bold text-warning">2.1%</p>
                </div>
                <Shield className="h-5 w-5 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">VIX</p>
                  <p className="text-lg font-bold text-accent">18.2</p>
                </div>
                <Activity className="h-5 w-5 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sharpe</p>
                  <p className="text-lg font-bold text-primary">1.4</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Drawdown</p>
                  <p className="text-lg font-bold text-destructive">-3.2%</p>
                </div>
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Session</p>
                  <p className="text-sm font-bold text-accent">Pre-Market</p>
                </div>
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tighter Grid */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left - Signals & Quick Trade */}
          <div className="col-span-3 space-y-4">
            
            {/* Compact Strong Signals */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Strong Signals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                    <div className="text-center">
                      <span className="text-sm font-semibold text-foreground">NVDA</span>
                      <p className="text-xs text-success font-medium">BUY 82%</p>
                      <p className="text-xs text-muted-foreground">$485.25</p>
                    </div>
                  </div>
                  
                  <div className="p-2 rounded bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20">
                    <div className="text-center">
                      <span className="text-sm font-semibold text-foreground">TSLA</span>
                      <p className="text-xs text-destructive font-medium">SELL 75%</p>
                      <p className="text-xs text-muted-foreground">$275.50</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                  onClick={handleTradeClick}
                >
                  Execute Top Signal
                </Button>
              </CardContent>
            </Card>

            {/* Compact Quick Trade */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Zap className="h-4 w-4 text-accent" />
                  <span>Quick Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-1">
                  <Input
                    placeholder="Symbol..."
                    value={quickTradeSymbol}
                    onChange={(e) => setQuickTradeSymbol(e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Button 
                    size="sm"
                    className="bg-success hover:bg-success/90 text-white font-medium h-8"
                    onClick={handleTradeClick}
                  >
                    BUY
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-destructive hover:bg-destructive/90 text-white font-medium h-8"
                    onClick={handleTradeClick}
                  >
                    SELL
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Paper trading enabled
                </div>
              </CardContent>
            </Card>

            {/* Strategy Performance - Compact */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Strategies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Momentum</span>
                  <span className="text-sm font-bold text-primary">+8.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mean Rev.</span>
                  <span className="text-sm font-bold text-accent">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ML Pred.</span>
                  <span className="text-sm font-bold text-success">87.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Positions & Trades */}
          <div className="col-span-6 space-y-4">
            
            {/* Compact Active Positions */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span>Active Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="text-left py-1 font-medium">Symbol</th>
                        <th className="text-right py-1 font-medium">Qty</th>
                        <th className="text-right py-1 font-medium">Avg Cost</th>
                        <th className="text-right py-1 font-medium">Current</th>
                        <th className="text-right py-1 font-medium">P&L</th>
                        <th className="text-right py-1 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-2 font-medium text-foreground">AAPL</td>
                        <td className="text-right py-2 text-muted-foreground">100</td>
                        <td className="text-right py-2 text-muted-foreground">$180.50</td>
                        <td className="text-right py-2 text-foreground">$182.45</td>
                        <td className="text-right py-2 text-success font-medium">+$195</td>
                        <td className="text-right py-2 text-success font-medium">+1.08%</td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-2 font-medium text-foreground">GOOGL</td>
                        <td className="text-right py-2 text-muted-foreground">50</td>
                        <td className="text-right py-2 text-muted-foreground">$141.25</td>
                        <td className="text-right py-2 text-foreground">$142.80</td>
                        <td className="text-right py-2 text-success font-medium">+$77.50</td>
                        <td className="text-right py-2 text-success font-medium">+1.10%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Compact Recent Trades */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Recent Trades</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">BUY</Badge>
                    <span className="text-sm font-medium text-foreground">AAPL</span>
                    <span className="text-xs text-muted-foreground">100 @ $180.50</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2m</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">SELL</Badge>
                    <span className="text-sm font-medium text-foreground">NVDA</span>
                    <span className="text-xs text-muted-foreground">10 @ $535.20</span>
                  </div>
                  <span className="text-xs text-muted-foreground">15m</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">BUY</Badge>
                    <span className="text-sm font-medium text-foreground">GOOGL</span>
                    <span className="text-xs text-muted-foreground">50 @ $141.25</span>
                  </div>
                  <span className="text-xs text-muted-foreground">1h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Market Context & Risk */}
          <div className="col-span-3 space-y-4">
            
            {/* Market Context - Compact */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Activity className="h-4 w-4 text-warning" />
                  <span>Market Context</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sentiment</span>
                  <span className="font-medium text-success">Bullish</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="font-medium text-warning">Moderate</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="font-medium text-success">Up</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics - Compact */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Shield className="h-4 w-4 text-destructive" />
                  <span>Risk Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio VAR</span>
                  <span className="font-medium text-warning">$2,840</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Beta</span>
                  <span className="font-medium text-accent">1.12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Correlation</span>
                  <span className="font-medium text-primary">0.78</span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-medium text-success">+2.1%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium text-success">+8.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">YTD</span>
                  <span className="font-medium text-success">+31.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};