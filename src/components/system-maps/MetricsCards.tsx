import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SystemMetrics } from '@/hooks/useSystemMetrics';

interface MetricsCardsProps {
  metrics: SystemMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      icon: Activity,
      label: 'System Health',
      value: `${metrics.overallHealth.toFixed(1)}%`,
      trend: metrics.overallHealth >= 80 ? 'up' : 'down',
      color: metrics.overallHealth >= 80 ? 'text-green-500' : 'text-red-500',
    },
    {
      icon: Zap,
      label: 'Total Throughput',
      value: `${metrics.totalThroughput} req/s`,
      trend: 'up',
      color: 'text-cyan-500',
    },
    {
      icon: Activity,
      label: 'Avg Latency',
      value: `${metrics.avgLatency.toFixed(1)}ms`,
      trend: metrics.avgLatency < 50 ? 'up' : 'down',
      color: metrics.avgLatency < 50 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      icon: AlertCircle,
      label: 'Error Rate',
      value: `${metrics.errorRate.toFixed(2)}%`,
      trend: metrics.errorRate < 1 ? 'up' : 'down',
      color: metrics.errorRate < 1 ? 'text-green-500' : 'text-red-500',
    },
    {
      icon: DollarSign,
      label: 'Cost/Hour',
      value: `$${metrics.costPerHour.toFixed(2)}`,
      trend: 'neutral',
      color: 'text-purple-500',
    },
    {
      icon: Activity,
      label: 'Active Components',
      value: metrics.nodes.length.toString(),
      trend: 'up',
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg bg-white/5 ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                {card.trend !== 'neutral' && (
                  <div className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {card.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
