import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, BarChart3, AlertTriangle } from "lucide-react";
import { generateMockTrades, calculatePerformanceMetrics } from "../../lib/performance-calculations";

export function PerformanceOverview() {
  const trades = useMemo(() => generateMockTrades(100), []);
  const metrics = useMemo(() => calculatePerformanceMetrics(trades, 100000), [trades]);

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
      case "positive": return "success" as const;
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
                  <Badge variant={getTrendBadgeVariant(card.trend)} className="text-xs">
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