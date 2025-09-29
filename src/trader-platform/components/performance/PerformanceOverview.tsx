import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Target, Shield, BarChart3, AlertTriangle } from "lucide-react";
import { getTradeHistory, getAccountBalance } from "../../lib/trading-api";
import { calculatePerformanceMetrics, Trade } from "../../lib/performance-calculations";

export function PerformanceOverview() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(100000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tradeHistory, balance] = await Promise.all([
          getTradeHistory(),
          getAccountBalance()
        ]);
        
        // Convert TradeHistory to Trade format
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
        setInitialBalance(balance);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        winRate: 0,
        winningTrades: 0,
        totalTrades: 0,
        averageWin: 0,
        averageLoss: 0,
        currentDrawdown: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        consecutiveWins: 0
      };
    }
    return calculatePerformanceMetrics(trades, initialBalance);
  }, [trades, initialBalance]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BarChart3 className="h-5 w-5" />
            No Trading History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Connect your broker account and start trading to see performance metrics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Return",
      value: `$${metrics.totalReturn.toLocaleString()}`,
      subtitle: `${metrics.totalReturnPercent.toFixed(2)}%`,
      icon: metrics.totalReturn >= 0 ? TrendingUp : TrendingDown,
      trend: metrics.totalReturn >= 0 ? "positive" : "negative",
      description: "Portfolio growth since inception"
    },
    {
      title: "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      subtitle: `${metrics.winningTrades}/${metrics.totalTrades} trades`,
      icon: Target,
      trend: metrics.winRate >= 60 ? "positive" : metrics.winRate >= 40 ? "neutral" : "negative",
      description: "Percentage of profitable trades"
    },
    {
      title: "Avg Win vs Loss",
      value: `$${metrics.averageWin.toLocaleString()}`,
      subtitle: `vs $${metrics.averageLoss.toLocaleString()}`,
      icon: BarChart3,
      trend: metrics.averageWin > metrics.averageLoss ? "positive" : "negative",
      description: "Average profit per winning vs losing trade"
    },
    {
      title: "Current Drawdown",
      value: `${metrics.currentDrawdown.toFixed(2)}%`,
      subtitle: `Max: ${metrics.maxDrawdown.toFixed(2)}%`,
      icon: metrics.currentDrawdown > 15 ? AlertTriangle : Shield,
      trend: metrics.currentDrawdown <= 5 ? "positive" : metrics.currentDrawdown <= 15 ? "neutral" : "negative",
      description: "Distance from peak portfolio value"
    },
    {
      title: "Sharpe Ratio",
      value: metrics.sharpeRatio.toFixed(2),
      subtitle: `Risk-adjusted return`,
      icon: BarChart3,
      trend: metrics.sharpeRatio >= 1 ? "positive" : metrics.sharpeRatio >= 0.5 ? "neutral" : "negative",
      description: "Return per unit of risk"
    },
    {
      title: "Profit Factor",
      value: metrics.profitFactor.toFixed(2),
      subtitle: `${metrics.consecutiveWins} max win streak`,
      icon: TrendingUp,
      trend: metrics.profitFactor >= 1.5 ? "positive" : metrics.profitFactor >= 1 ? "neutral" : "negative",
      description: "Total wins divided by total losses"
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "positive": return "text-success";
      case "negative": return "text-destructive";
      default: return "text-warning";
    }
  };

  const getTrendBadgeVariant = (trend: string) => {
    switch (trend) {
      case "positive": return "default" as const;
      case "negative": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${getTrendColor(card.trend)}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className={`text-2xl font-bold ${getTrendColor(card.trend)}`}>
                    {card.value}
                  </div>
                  <Badge variant={getTrendBadgeVariant(card.trend)} className={`text-xs ${card.trend === 'positive' ? 'bg-success text-success-foreground hover:bg-success/80' : ''}`}>
                    {card.subtitle}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}