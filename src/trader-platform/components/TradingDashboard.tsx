import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Info,
  Wifi,
  WifiOff,
  Cloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Settings
} from "lucide-react";

interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  timestamp: string;
}

interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  side: 'long' | 'short';
}

interface CloudStatus {
  isActive: boolean;
  lastAnalysis: string;
  nextScheduledRun: string;
  signalsToday: number;
  lastMarketData: string | null;
  systemHealth: 'healthy' | 'warning' | 'error';
}

interface AccountData {
  portfolioValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  buyingPower: number;
  totalEquity: number;
  marginUsed: number;
  dayTradesUsed: number;
  accountStatus: string;
  lastUpdated: string;
}

interface RecentTrade {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
}

export const TradingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [knowledgeMode, setKnowledgeMode] = useState<'simple' | 'academic'>('simple');
  
  const isDevelopment = import.meta.env.DEV;

  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({
    isActive: true,
    lastAnalysis: new Date().toISOString(),
    nextScheduledRun: '',
    signalsToday: 0,
    lastMarketData: null,
    systemHealth: 'healthy'
  });
  
  const [accountData, setAccountData] = useState<AccountData>({
    portfolioValue: 125450,
    dailyPnL: 2340,
    dailyPnLPercent: 1.87,
    buyingPower: 45230,
    totalEquity: 125450,
    marginUsed: 0,
    dayTradesUsed: 0,
    accountStatus: 'active',
    lastUpdated: new Date().toISOString()
  });

  // Mock data
  useEffect(() => {
    // Mock signals
    setSignals([
      {
        symbol: 'AAPL',
        action: 'BUY',
        confidence: 87,
        targetPrice: 185.50,
        currentPrice: 182.30,
        reasoning: 'Strong technical breakout above resistance level',
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'TSLA',
        action: 'SELL',
        confidence: 72,
        targetPrice: 210.00,
        currentPrice: 218.45,
        reasoning: 'Overbought conditions detected',
        timestamp: new Date().toISOString()
      }
    ]);

    // Mock positions
    setPositions([
      {
        symbol: 'NVDA',
        quantity: 100,
        averageCost: 425.30,
        currentPrice: 438.50,
        marketValue: 43850,
        unrealizedPnL: 1320,
        unrealizedPnLPercent: 3.1,
        side: 'long'
      },
      {
        symbol: 'MSFT',
        quantity: 50,
        averageCost: 340.20,
        currentPrice: 348.75,
        marketValue: 17437.50,
        unrealizedPnL: 427.50,
        unrealizedPnLPercent: 2.5,
        side: 'long'
      }
    ]);

    // Mock recent trades
    setRecentTrades([
      {
        symbol: 'GOOGL',
        action: 'BUY',
        quantity: 25,
        price: 142.50,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        pnl: 125.50
      },
      {
        symbol: 'META',
        action: 'SELL',
        quantity: 75,
        price: 338.90,
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        pnl: -45.20
      }
    ]);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/trader-auth');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTradeClick = () => {
    toast({
      title: "Demo Mode",
      description: "This is a demo. Connect your broker to enable real trading.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-4 sm:px-6 h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              <span className="hidden sm:inline">TubeAmp Trader v5.0</span>
              <span className="sm:hidden">Trader</span>
            </h1>
            {/* Connection Status */}
            {isDevelopment && (
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-success" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-xs ${isConnected ? 'text-success' : 'text-destructive'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            )}
          </div>

          {/* Account Stats - Hide on small screens */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="text-lg font-semibold text-foreground">${accountData.portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Daily P&L</p>
              <p className={`text-lg font-semibold ${accountData.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {accountData.dailyPnL >= 0 ? '+' : ''}${accountData.dailyPnL.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Buying Power</p>
              <p className="text-lg font-semibold text-accent">${accountData.buyingPower.toLocaleString()}</p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Knowledge Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={knowledgeMode === 'simple' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKnowledgeMode('simple')}
                className="h-8 px-3 text-xs"
              >
                Simple
              </Button>
              <Button
                variant={knowledgeMode === 'academic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKnowledgeMode('academic')}
                className="h-8 px-3 text-xs"
              >
                Academic
              </Button>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Broker Integration Status */}
      <div className="p-2 sm:p-4">
        <Card className="border-yellow-200 bg-yellow-50 border-l-4 border-l-yellow-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Broker Connection Required</p>
                  <p className="text-sm text-yellow-700">
                    Connect your Alpaca account to enable live trading and access your real account data
                  </p>
                </div>
              </div>
              <Link to="/trader/integrations">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Connect Broker</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Bento Grid Layout */}
      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-12 gap-3">
          {/* Left Column - Account & Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-3">
            {/* Account Summary */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>Account</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Portfolio</span>
                  <span className="text-sm font-bold">${accountData.portfolioValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily P&L</span>
                  <span className={`text-sm font-bold ${accountData.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {accountData.dailyPnL >= 0 ? '+' : ''}${accountData.dailyPnL.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Buying Power</span>
                  <span className="text-sm font-bold text-accent">${accountData.buyingPower.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Zap className="h-4 w-4 text-accent" />
                  <span>Quick Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Symbol" className="h-8" />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-success hover:bg-success/90 text-white font-medium h-8"
                    onClick={handleTradeClick}
                  >
                    BUY
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-medium h-8"
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

            {/* Strategy Performance */}
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

          {/* Center Column - Positions & Trades */}
          <div className="col-span-12 lg:col-span-6 space-y-3">
            {/* Active Positions */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="h-4 w-4 text-accent" />
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
                      {positions.map((position) => (
                        <tr key={position.symbol} className="hover:bg-muted/50 transition-colors">
                          <td className="py-2 font-medium text-foreground">{position.symbol}</td>
                          <td className="text-right py-2 text-muted-foreground">{position.quantity}</td>
                          <td className="text-right py-2 text-muted-foreground">${position.averageCost.toFixed(2)}</td>
                          <td className="text-right py-2 text-foreground">${position.currentPrice.toFixed(2)}</td>
                          <td className={`text-right py-2 font-medium ${position.unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(0)}
                          </td>
                          <td className={`text-right py-2 font-medium ${position.unrealizedPnLPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Recent Trades</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${
                        trade.action === 'BUY' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {trade.action}
                      </Badge>
                      <span className="font-medium text-sm">{trade.symbol}</span>
                      <span className="text-xs text-muted-foreground">{trade.quantity} @ ${trade.price}</span>
                    </div>
                    {trade.pnl && (
                      <span className={`text-xs font-medium ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Signals & Analytics */}
          <div className="col-span-12 lg:col-span-3 space-y-3">
            {/* AI Signals */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>AI Signals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {signals.map((signal, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{signal.symbol}</span>
                      <Badge className={`text-xs ${
                        signal.action === 'BUY' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {signal.action}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Confidence: {signal.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${signal.currentPrice} → ${signal.targetPrice}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Activity className="h-4 w-4 text-accent" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cloud Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">Active</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Signals Today</span>
                  <span className="text-sm font-bold text-primary">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Analysis</span>
                  <span className="text-sm font-bold text-foreground">2m ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};