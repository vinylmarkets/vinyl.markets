import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  chart?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'since last month',
  chart, 
  footer,
  className 
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn(
      "bg-[#1A1A1A] border-[#2A2A2A] p-6 relative overflow-hidden rounded-2xl",
      "hover:shadow-lg hover:shadow-black/20 transition-all duration-200",
      "hover:-translate-y-0.5",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      </div>

      {/* Value */}
      <div className="mb-4">
        <p className="text-4xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cn(
              "text-sm font-semibold",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500 ml-1">{changeLabel}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {chart && (
        <div className="mb-4">
          {chart}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="pt-3 border-t border-[#2A2A2A]">
          {footer}
        </div>
      )}
    </Card>
  );
}
