import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, Target, DollarSign, Percent } from 'lucide-react';
import type { AggregateMetrics } from '@/lib/ampPerformanceCalculations';

interface AmpPerformanceMetricsProps {
  metrics: AggregateMetrics;
  isLoading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
}

function MetricCard({ title, value, subtitle, icon, variant = 'neutral' }: MetricCardProps) {
  const variantClasses = {
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    danger: 'border-red-500/20 bg-red-500/5',
    neutral: 'border-border',
  };

  const iconClasses = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={`p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`${iconClasses[variant]}`}>{icon}</div>
      </div>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </Card>
  );
}

export function AmpPerformanceMetrics({ metrics, isLoading }: AmpPerformanceMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  const getReturnVariant = (value: number) => {
    if (value > 10) return 'success';
    if (value > 0) return 'warning';
    return 'danger';
  };

  const getSharpeVariant = (value: number) => {
    if (value > 2) return 'success';
    if (value > 1) return 'warning';
    return 'danger';
  };

  const getDrawdownVariant = (value: number) => {
    if (value < 10) return 'success';
    if (value < 20) return 'warning';
    return 'danger';
  };

  const getWinRateVariant = (value: number) => {
    if (value > 60) return 'success';
    if (value > 45) return 'warning';
    return 'danger';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Return"
        value={`$${metrics.totalReturn.toFixed(2)}`}
        subtitle={`${metrics.totalReturnPct.toFixed(2)}%`}
        icon={metrics.totalReturn >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
        variant={getReturnVariant(metrics.totalReturnPct)}
      />

      <MetricCard
        title="Sharpe Ratio"
        value={metrics.sharpeRatio.toFixed(2)}
        subtitle="Risk-Adjusted Return"
        icon={<Activity size={24} />}
        variant={getSharpeVariant(metrics.sharpeRatio)}
      />

      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
        icon={<Target size={24} />}
        variant={getWinRateVariant(metrics.winRate)}
      />

      <MetricCard
        title="Max Drawdown"
        value={`${metrics.maxDrawdown.toFixed(2)}%`}
        subtitle={`Current: ${metrics.currentDrawdown.toFixed(2)}%`}
        icon={<TrendingDown size={24} />}
        variant={getDrawdownVariant(metrics.maxDrawdown)}
      />

      <MetricCard
        title="Total Trades"
        value={metrics.totalTrades}
        subtitle={`${metrics.activeDays} active days`}
        icon={<Activity size={24} />}
        variant="neutral"
      />

      <MetricCard
        title="Profit Factor"
        value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
        subtitle="Wins / Losses"
        icon={<Percent size={24} />}
        variant={metrics.profitFactor > 2 ? 'success' : metrics.profitFactor > 1 ? 'warning' : 'danger'}
      />

      <MetricCard
        title="Avg Win / Loss"
        value={`$${metrics.avgWin.toFixed(2)}`}
        subtitle={`Loss: $${metrics.avgLoss.toFixed(2)}`}
        icon={<DollarSign size={24} />}
        variant="neutral"
      />

      <MetricCard
        title="30-Day Return"
        value={`${metrics.return30d.toFixed(2)}%`}
        subtitle={`7d: ${metrics.return7d.toFixed(2)}% | 90d: ${metrics.return90d.toFixed(2)}%`}
        icon={<TrendingUp size={24} />}
        variant={getReturnVariant(metrics.return30d)}
      />
    </div>
  );
}
