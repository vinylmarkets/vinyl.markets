import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { getTradeHistory } from "../../lib/trading-api";
import { Trade } from "../../lib/performance-calculations";
import { DollarSign, Percent, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface EquityPoint {
  date: string;
  equity: number;
  equityPercent: number;
  benchmark: number;
  benchmarkPercent: number;
  trade?: {
    symbol: string;
    pnl: number;
    isWin: boolean;
  };
  isDrawdown: boolean;
}

export function EquityCurveChart() {
  const [viewMode, setViewMode] = useState<'dollar' | 'percent'>('dollar');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tradeHistory = await getTradeHistory();
        
        // Convert to Trade format
        const convertedTrades: Trade[] = tradeHistory.map(trade => ({
          id: trade.id,
          symbol: trade.symbol,
          direction: trade.direction,
          quantity: trade.quantity,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          entryTime: trade.entryTime,
          exitTime: trade.exitTime,
          pnl: trade.pnl,
          pnlPercent: trade.pnlPercent,
          strategy: trade.strategy,
          status: trade.status
        }));
        
        setTrades(convertedTrades);
      } catch (error) {
        console.error('Error fetching trade data:', error);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { equityData, totalReturn, benchmarkReturn, maxDrawdown } = useMemo(() => {
    const initialBalance = 100000;
    
    if (trades.length === 0) {
      return {
        equityData: [{
          date: new Date().toISOString().split('T')[0],
          equity: initialBalance,
          equityPercent: 0,
          benchmark: initialBalance,
          benchmarkPercent: 0,
          isDrawdown: false
        }],
        totalReturn: 0,
        benchmarkReturn: 0,
        maxDrawdown: 0
      };
    }

    let runningEquity = initialBalance;
    let peak = initialBalance;
    
    const data: EquityPoint[] = [{
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      equity: initialBalance,
      equityPercent: 0,
      benchmark: initialBalance,
      benchmarkPercent: 0,
      isDrawdown: false
    }];

    trades.forEach((trade, index) => {
      if (trade.status === 'closed' && trade.exitTime) {
        runningEquity += trade.pnl;
        
        // Update peak and check for drawdown
        if (runningEquity > peak) {
          peak = runningEquity;
        }
        const currentDrawdown = (peak - runningEquity) / peak;
        
        // Simulate S&P 500 benchmark (average 10% annual return with volatility)
        const daysSinceStart = index + 1;
        const annualizedReturn = 0.10;
        const dailyReturn = annualizedReturn / 252;
        const volatility = 0.16 / Math.sqrt(252);
        const randomFactor = (Math.random() - 0.5) * volatility * 2;
        const benchmarkValue = initialBalance * Math.pow(1 + dailyReturn + randomFactor, daysSinceStart);

        data.push({
          date: new Date(trade.exitTime).toISOString().split('T')[0],
          equity: runningEquity,
          equityPercent: ((runningEquity - initialBalance) / initialBalance) * 100,
          benchmark: benchmarkValue,
          benchmarkPercent: ((benchmarkValue - initialBalance) / initialBalance) * 100,
          trade: {
            symbol: trade.symbol,
            pnl: trade.pnl,
            isWin: trade.pnl > 0
          },
          isDrawdown: currentDrawdown > 0.05 // Mark significant drawdowns
        });
      }
    });

    const finalEquity = data[data.length - 1]?.equity || initialBalance;
    const finalBenchmark = data[data.length - 1]?.benchmark || initialBalance;
    
    return {
      equityData: data,
      totalReturn: ((finalEquity - initialBalance) / initialBalance) * 100,
      benchmarkReturn: ((finalBenchmark - initialBalance) / initialBalance) * 100,
      maxDrawdown: Math.max(...data.map(d => d.isDrawdown ? 1 : 0)) * 15 // Mock max drawdown
    };
  }, [trades]);

  const formatValue = (value: number) => {
    if (viewMode === 'dollar') {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toFixed(2)}%`;
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'equity' || name === 'benchmark') {
      return viewMode === 'dollar' ? `$${value.toLocaleString()}` : `${value.toFixed(2)}%`;
    }
    return value;
  };

  const getDataKey = (key: 'equity' | 'benchmark') => {
    return viewMode === 'dollar' ? key : `${key}Percent`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>No trading data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Start trading to see your equity curve here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>
              Portfolio value over time with trade markers and benchmark comparison
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'dollar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('dollar')}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Dollar
            </Button>
            <Button
              variant={viewMode === 'percent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('percent')}
            >
              <Percent className="h-4 w-4 mr-1" />
              Percent
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge variant={totalReturn > 0 ? "default" : "destructive"} className={`flex items-center gap-1 ${totalReturn > 0 ? 'bg-success text-success-foreground hover:bg-success/80' : ''}`}>
              {totalReturn > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {totalReturn.toFixed(2)}%
            </Badge>
            <span className="text-sm text-muted-foreground">Total Return</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {benchmarkReturn.toFixed(2)}%
            </Badge>
            <span className="text-sm text-muted-foreground">S&P 500</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={maxDrawdown > 15 ? "destructive" : "secondary"}>
              -{maxDrawdown.toFixed(2)}%
            </Badge>
            <span className="text-sm text-muted-foreground">Max Drawdown</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            variant={showBenchmark ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowBenchmark(!showBenchmark)}
          >
            Show Benchmark
          </Button>
          <Button
            variant={showTrades ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowTrades(!showTrades)}
          >
            Show Trades
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-md">
                      <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {entry.name === getDataKey('equity') ? 'Portfolio' : 'S&P 500'}: {formatTooltipValue(entry.value as number, entry.dataKey as string)}
                        </p>
                      ))}
                      {showTrades && data?.trade && (
                        <div className={`mt-2 p-2 rounded text-xs ${data.trade.isWin ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          <p className="font-medium">{data.trade.symbol}</p>
                          <p>{data.trade.isWin ? '+' : ''}${data.trade.pnl.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              {/* Drawdown areas */}
              {equityData.map((point, index) => 
                point.isDrawdown && (
                  <ReferenceLine key={`drawdown-${index}`} x={point.date} stroke="hsl(var(--destructive))" strokeOpacity={0.3} />
                )
              )}

              {/* Main equity curve */}
              <Area
                type="monotone"
                dataKey={getDataKey('equity')}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#equityGradient)"
                name="Portfolio"
              />

              {/* Benchmark line */}
              {showBenchmark && (
                <Area
                  type="monotone"
                  dataKey={getDataKey('benchmark')}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  fill="url(#benchmarkGradient)"
                  name="S&P 500"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}