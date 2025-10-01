import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import type { AlgorithmInfo } from '@/hooks/useAlgorithmMetrics';

interface AlgorithmSelectorProps {
  algorithms: AlgorithmInfo[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  compareMode: boolean;
  onCompareModeToggle: () => void;
  loading: boolean;
}

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  selectedIds,
  onSelect,
  compareMode,
  onCompareModeToggle,
  loading,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trading Algorithms</h3>
        <Button variant="outline" size="sm" onClick={onCompareModeToggle}>
          <Layers className="w-4 h-4 mr-2" />
          {compareMode ? 'Exit Compare' : 'Compare Mode'}
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {algorithms.map(algo => (
          <Card
            key={algo.id}
            className={`cursor-pointer transition-all ${
              selectedIds.includes(algo.id)
                ? 'border-[#00ff88] bg-[#00ff88]/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => onSelect(algo.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{algo.name}</h4>
                <Badge variant={algo.status === 'running' ? 'default' : 'secondary'}>
                  {algo.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Win Rate: {algo.performance.winRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
