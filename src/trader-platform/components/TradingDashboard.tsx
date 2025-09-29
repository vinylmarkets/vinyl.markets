import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
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
  RefreshCw
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
  assetType: 'stock' | 'option' | 'crypto';
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
  timeAgo: string;
}

interface CloudStatus {
  isActive: boolean;
  lastAnalysis: string | null;
  nextScheduledRun: string;
  signalsToday: number;
  lastMarketData: string | null;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const isDevelopment = import.meta.env.DEV;

export const TradingDashboard = () => {
  const [knowledgeMode, setKnowledgeMode] = useState<'simple' | 'academic'>('simple');
  const [quickTradeSymbol, setQuickTradeSymbol] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({
    isActive: true,
    lastAnalysis: null,
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
  
  const { toast } = useToast();

  // Fetch functions
  const fetchCloudStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // For now, use mock data since we need to check the actual table structure
      // TODO: Update with real Supabase queries once table access is confirmed
      
      // Calculate next scheduled run (next 5-minute interval during market hours)
      const now = new Date();
      const estNow = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // EST offset
      const nextRun = new Date(estNow);
      nextRun.setMinutes(Math.ceil(nextRun.getMinutes() / 5) * 5, 0, 0);
      
      // Check if it's market hours (9:30 AM - 4:00 PM EST, Mon-Fri)
      const day = estNow.getDay();
      const hour = estNow.getHours() + (estNow.getMinutes() / 60);
      const isMarketHours = day >= 1 && day <= 5 && hour >= 9.5 && hour < 16;
      
      if (!isMarketHours) {
        // If after hours, set to next market open
        const nextMarketDay = new Date(estNow);
        if (day === 0) nextMarketDay.setDate(nextMarketDay.getDate() + 1); // Sunday -> Monday
        else if (day === 6) nextMarketDay.setDate(nextMarketDay.getDate() + 2); // Saturday -> Monday
        else if (hour >= 16) nextMarketDay.setDate(nextMarketDay.getDate() + 1); // After 4 PM
        
        nextMarketDay.setHours(9, 30, 0, 0);
        nextRun.setTime(nextMarketDay.getTime());
      }

      // Mock data for demonstration - replace with real Supabase queries
      const mockSignalsToday = Math.floor(Math.random() * 15) + 5; // 5-20 signals
      const lastAnalysisTime = new Date(Date.now() - Math.random() * 30 * 60 * 1000); // Within last 30 min

      setCloudStatus({
        isActive: true,
        lastAnalysis: lastAnalysisTime.toISOString(),
        nextScheduledRun: nextRun.toLocaleTimeString('en-US', { 
          timeZone: 'America/New_York',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        signalsToday: mockSignalsToday,
        lastMarketData: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
        systemHealth: 'healthy'
      });

      setIsConnected(true);
    } catch (error) {
      console.warn('Error fetching cloud status:', error);
      setCloudStatus(prev => ({ ...prev, systemHealth: 'error' }));
    }
  };

  const fetchAccountData = async () => {
    try {
      const response = await fetch('/api/trader/account');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAccountData(result.data);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch account data:', error);
      if (isDevelopment) setIsConnected(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/trader/signals');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSignals(result.data);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch signals:', error);
      if (isDevelopment) setIsConnected(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/trader/positions');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPositions(result.data.positions);
          setRecentTrades(result.data.recentTrades);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch positions:', error);
      if (isDevelopment) setIsConnected(false);
    }
  };

  // Set up polling intervals
  useEffect(() => {
    // Initial fetch
    fetchCloudStatus();
    fetchAccountData();
    fetchSignals();
    fetchPositions();

    // Set up intervals
    const cloudStatusInterval = setInterval(fetchCloudStatus, 30000); // 30 seconds
    const accountInterval = setInterval(fetchAccountData, 10000); // 10 seconds
    const signalsInterval = setInterval(fetchSignals, 30000); // 30 seconds
    const positionsInterval = setInterval(fetchPositions, 10000); // 10 seconds

    return () => {
      clearInterval(cloudStatusInterval);
      clearInterval(accountInterval);
      clearInterval(signalsInterval);
      clearInterval(positionsInterval);
    };
  }, []);

  const handleTradeClick = () => {
    toast({
      title: "Trading Disabled",
      description: "Trading will be enabled after regulatory approval",
      variant: "default",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/trader-auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
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
              <div className="flex items-center space-x-1">
                {accountData.dailyPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <p className={`text-lg font-semibold ${accountData.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(accountData.dailyPnL).toLocaleString()} ({accountData.dailyPnLPercent > 0 ? '+' : ''}{accountData.dailyPnLPercent}%)
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Buying Power</p>
              <p className="text-lg font-semibold text-foreground">${accountData.buyingPower.toLocaleString()}</p>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Knowledge Mode Toggle - Hide on mobile */}
            <div className="hidden md:flex items-center space-x-2">
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

      {/* Compact Bento Layout */}
      <div className="p-2 sm:p-4 space-y-4">
        {/* Cloud Status Section */}
        <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-l-4 border-l-primary">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
              {/* Cloud Status */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {cloudStatus.isActive ? (
                    <Cloud className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">Cloud Status:</span>
                </div>
                <Badge variant={cloudStatus.isActive ? "default" : "destructive"} className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${cloudStatus.isActive ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
                  <span>{cloudStatus.isActive ? 'Active' : 'Offline'}</span>
                </Badge>
              </div>

              {/* Last Analysis */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Last Analysis</p>
                <p className="text-sm font-semibold text-foreground">
                  {cloudStatus.lastAnalysis 
                    ? new Date(cloudStatus.lastAnalysis).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : 'Pending'
                  }
                </p>
              </div>

              {/* Next Run */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Next Run</p>
                <p className="text-sm font-semibold text-accent">{cloudStatus.nextScheduledRun}</p>
              </div>

              {/* Signals Today */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Signals Today</p>
                <p className="text-sm font-semibold text-primary">{cloudStatus.signalsToday}</p>
              </div>

              {/* Auto-refresh Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground">Auto-refresh: 30s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Row - Compact Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left - Signals & Quick Trade */}
          <div className="lg:col-span-3 space-y-4">
            
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
                  {signals.slice(0, 2).map((signal, index) => (
                    <div key={signal.symbol} className={`p-2 rounded bg-gradient-to-r ${
                      signal.action === 'BUY' 
                        ? 'from-success/10 to-success/5 border border-success/20'
                        : signal.action === 'SELL'
                        ? 'from-destructive/10 to-destructive/5 border border-destructive/20'
                        : 'from-muted/10 to-muted/5 border border-muted/20'
                    }`}>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-foreground">{signal.symbol}</span>
                        <p className={`text-xs font-medium ${
                          signal.action === 'BUY' ? 'text-success' :
                          signal.action === 'SELL' ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {signal.action} {signal.confidence}%
                        </p>
                        <p className="text-xs text-muted-foreground">${signal.targetPrice}</p>
                      </div>
                    </div>
                  ))}
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

            {/* Compact Recent Trades */}
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
                      <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
                      <span className="text-xs text-muted-foreground">{trade.quantity} @ ${trade.price.toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{trade.timeAgo}</span>
                  </div>
                ))}
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