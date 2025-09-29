import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateMockTrades, getStrategyPerformance } from "../../lib/performance-calculations";
import { TrendingUp, TrendingDown, Brain, Zap, Target } from "lucide-react";

export function StrategyBreakdown() {
  const trades = useMemo(() => generateMockTrades(100), []);
  const strategyData = useMemo(() => getStrategyPerformance(trades), [trades]);

  const chartData = strategyData.map(strategy => ({
    ...strategy,
    fillColor: strategy.totalPnl > 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"
  }));

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'momentum': return Zap;
      case 'mean-reversion': return Target;
      case 'ml-prediction': return Brain;
      default: return TrendingUp;
    }
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'momentum': 
        return "Follows price trends and breakouts. Best in trending markets with strong directional moves.";
      case 'mean-reversion': 
        return "Trades against extreme price movements. Profits from price returning to average levels.";
      case 'ml-prediction': 
        return "Uses machine learning models to predict price movements based on multiple data sources.";
      default: return "";
    }
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? "text-success" : value < 0 ? "text-destructive" : "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Strategy Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategyData.map((strategy) => {
          const Icon = getStrategyIcon(strategy.name);
          return (
            <Card key={strategy.name} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{strategy.displayName}</CardTitle>
                  </div>
                  <Badge 
                    variant={strategy.totalPnl > 0 ? "default" : "destructive"}
                    className={`px-2 py-1 ${strategy.totalPnl > 0 ? 'bg-success text-success-foreground hover:bg-success/80' : ''}`}
                  >
                    {strategy.totalPnl > 0 ? '+' : ''}${strategy.totalPnl.toFixed(0)}
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {getStrategyDescription(strategy.name)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className={`text-2xl font-bold ${getTrendColor(strategy.winRate - 50)}`}>
                      {strategy.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trades</p>
                    <p className="text-2xl font-bold">{strategy.tradeCount}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Avg P&L per Trade</p>
                  <p className={`text-xl font-bold ${getTrendColor(strategy.averagePnl)}`}>
                    {strategy.averagePnl > 0 ? '+' : ''}${strategy.averagePnl.toFixed(2)}
                  </p>
                </div>

                {/* Performance indicator */}
                <div className="flex items-center gap-2 pt-2">
                  {strategy.winRate > 60 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : strategy.winRate < 40 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Target className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {strategy.winRate > 60 ? "Strong Performance" : 
                     strategy.winRate < 40 ? "Needs Improvement" : "Moderate Performance"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Strategy Contribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Profit Contribution</CardTitle>
          <CardDescription>
            Total profit/loss generated by each trading strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayName" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Profit/Loss"]}
                  labelFormatter={(name) => `${name} Strategy`}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload[0]) return null;
                    
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg p-3 shadow-md">
                        <p className="font-medium">{label} Strategy</p>
                        <p className={`text-lg font-bold ${getTrendColor(data.totalPnl)}`}>
                          {data.totalPnl > 0 ? '+' : ''}${data.totalPnl.toFixed(2)}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>Win Rate: {data.winRate.toFixed(1)}%</p>
                          <p>Total Trades: {data.tradeCount}</p>
                          <p>Avg per Trade: ${data.averagePnl.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Analysis</CardTitle>
          <CardDescription>
            Key insights about each strategy's performance characteristics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategyData.map((strategy) => (
              <div key={strategy.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: strategy.totalPnl > 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"
                  }} />
                  <div>
                    <p className="font-medium">{strategy.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {strategy.tradeCount} trades • {strategy.winRate.toFixed(1)}% win rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTrendColor(strategy.totalPnl)}`}>
                    {strategy.totalPnl > 0 ? '+' : ''}${strategy.totalPnl.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((strategy.totalPnl / strategyData.reduce((sum, s) => sum + Math.abs(s.totalPnl), 0)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}