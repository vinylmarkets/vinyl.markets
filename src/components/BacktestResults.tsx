import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BacktestResult } from '@/lib/backtestEngine';
import { EnhancedMetrics } from '@/lib/performanceMetrics';
import { EquityChart } from './charts/EquityChart';
import { DrawdownChart } from './charts/DrawdownChart';
import { DollarSign, TrendingUp, TrendingDown, Target, ArrowUp, ArrowDown } from 'lucide-react';

interface BacktestResultsProps {
  result: BacktestResult;
  enhancedMetrics: EnhancedMetrics;
}

export function BacktestResults({ result, enhancedMetrics }: BacktestResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{result.config.strategyName}</h2>
        <p className="text-muted-foreground">
          {result.startDate.toLocaleDateString()} - {result.endDate.toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Total Return"
          value={`${(result.totalReturn * 100).toFixed(2)}%`}
          subtitle={`$${result.totalReturnDollar.toLocaleString()}`}
          change={result.totalReturn}
          positive={result.totalReturn > 0}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Sharpe Ratio"
          value={result.sharpeRatio.toFixed(2)}
          positive={result.sharpeRatio > 1}
        />
        <MetricCard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Max Drawdown"
          value={`${(result.maxDrawdown * 100).toFixed(2)}%`}
          subtitle={`$${result.maxDrawdownDollar.toLocaleString()}`}
          positive={false}
        />
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          title="Win Rate"
          value={`${(result.winRate * 100).toFixed(1)}%`}
          subtitle={`${result.winningTrades}/${result.totalTrades} trades`}
          positive={result.winRate > 0.5}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="equity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="metrics">All Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityChart equityCurve={result.equityCurve} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drawdown Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <DrawdownChart drawdownCurve={result.drawdownCurve} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Trades ({result.totalTrades})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Entry Date</th>
                      <th className="text-left p-2">Exit Date</th>
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-right p-2">Entry</th>
                      <th className="text-right p-2">Exit</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">P&L</th>
                      <th className="text-right p-2">%</th>
                      <th className="text-left p-2">Exit Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((trade, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{trade.entryDate.toLocaleDateString()}</td>
                        <td className="p-2">{trade.exitDate.toLocaleDateString()}</td>
                        <td className="p-2 font-medium">{trade.symbol}</td>
                        <td className="p-2 text-right">${trade.entryPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">${trade.exitPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">{trade.quantity}</td>
                        <td className={`p-2 text-right font-medium ${trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${trade.pnl.toFixed(2)}
                        </td>
                        <td className={`p-2 text-right ${trade.pnlPercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(trade.pnlPercent * 100).toFixed(2)}%
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">{trade.exitReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricsSection title="Returns">
              <MetricRow label="Total Return" value={`${(result.totalReturn * 100).toFixed(2)}%`} />
              <MetricRow label="Total Return ($)" value={`$${result.totalReturnDollar.toLocaleString()}`} />
              <MetricRow 
                label="CAGR" 
                value={`${((Math.pow(1 + result.totalReturn, 365 / result.durationDays) - 1) * 100).toFixed(2)}%`} 
              />
            </MetricsSection>

            <MetricsSection title="Risk Metrics">
              <MetricRow label="Sharpe Ratio" value={result.sharpeRatio.toFixed(2)} />
              <MetricRow label="Sortino Ratio" value={enhancedMetrics.sortinoRatio.toFixed(2)} />
              <MetricRow label="Calmar Ratio" value={result.calmarRatio.toFixed(2)} />
              <MetricRow label="Max Drawdown" value={`${(result.maxDrawdown * 100).toFixed(2)}%`} />
              <MetricRow label="Ulcer Index" value={enhancedMetrics.ulcerIndex.toFixed(4)} />
            </MetricsSection>

            <MetricsSection title="Win/Loss Statistics">
              <MetricRow label="Total Trades" value={result.totalTrades.toString()} />
              <MetricRow label="Win Rate" value={`${(result.winRate * 100).toFixed(1)}%`} />
              <MetricRow label="Average Win" value={`$${result.avgWin.toFixed(2)}`} />
              <MetricRow label="Average Loss" value={`$${result.avgLoss.toFixed(2)}`} />
              <MetricRow label="Profit Factor" value={result.profitFactor.toFixed(2)} />
              <MetricRow label="Largest Win" value={`$${enhancedMetrics.largestWin.toFixed(2)}`} />
              <MetricRow label="Largest Loss" value={`$${enhancedMetrics.largestLoss.toFixed(2)}`} />
            </MetricsSection>

            <MetricsSection title="Consistency">
              <MetricRow label="Monthly Win Rate" value={`${(enhancedMetrics.monthlyWinRate * 100).toFixed(1)}%`} />
              <MetricRow 
                label="Profitable Months" 
                value={`${enhancedMetrics.profitableMonths}/${enhancedMetrics.totalMonths}`} 
              />
              <MetricRow label="Avg Win Streak" value={enhancedMetrics.averageWinStreak.toFixed(1)} />
              <MetricRow label="Avg Loss Streak" value={enhancedMetrics.averageLossStreak.toFixed(1)} />
              <MetricRow label="Longest Win Streak" value={enhancedMetrics.longestWinStreak.toString()} />
              <MetricRow label="Longest Loss Streak" value={enhancedMetrics.longestLossStreak.toString()} />
            </MetricsSection>

            <MetricsSection title="Holding Periods">
              <MetricRow label="Avg Holding" value={`${enhancedMetrics.avgHoldingPeriod.toFixed(1)} days`} />
              <MetricRow label="Avg Recovery" value={`${enhancedMetrics.avgRecoveryTime.toFixed(0)} days`} />
              <MetricRow label="Max Recovery" value={`${enhancedMetrics.maxRecoveryTime.toFixed(0)} days`} />
            </MetricsSection>

            <MetricsSection title="Advanced Risk">
              <MetricRow label="VaR (95%)" value={`${(enhancedMetrics.valueAtRisk95 * 100).toFixed(2)}%`} />
              <MetricRow label="CVaR (95%)" value={`${(enhancedMetrics.conditionalVaR95 * 100).toFixed(2)}%`} />
              <MetricRow label="Consistency Score" value={`${enhancedMetrics.consistencyScore.toFixed(1)}%`} />
            </MetricsSection>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  change, 
  positive 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle?: string;
  change?: number;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-muted-foreground">{icon}</div>
          {change !== undefined && (
            <div className={positive ? 'text-green-500' : 'text-red-500'}>
              {positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className={`text-2xl font-bold ${
          change !== undefined 
            ? (positive ? 'text-green-500' : 'text-red-500')
            : ''
        }`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}
