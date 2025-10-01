import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AlgorithmInfo } from '@/hooks/useAlgorithmMetrics';

export const AlgorithmMetricsPanel: React.FC<{ algorithm: AlgorithmInfo }> = ({ algorithm }) => {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Total Trades</div>
          <div className="text-2xl font-bold text-white">{algorithm.performance.totalTrades}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Win Rate</div>
          <div className="text-2xl font-bold text-white">{algorithm.performance.winRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total P&L</div>
          <div className={`text-2xl font-bold ${algorithm.performance.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${algorithm.performance.totalPnL.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
