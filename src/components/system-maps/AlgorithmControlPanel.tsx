import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw } from 'lucide-react';
import type { AlgorithmInfo } from '@/hooks/useAlgorithmMetrics';

export const AlgorithmControlPanel: React.FC<{ algorithm: AlgorithmInfo }> = ({ algorithm }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex gap-3">
      <Button variant="outline" size="sm">
        <Play className="w-4 h-4 mr-2" />
        Start
      </Button>
      <Button variant="outline" size="sm">
        <Square className="w-4 h-4 mr-2" />
        Stop
      </Button>
      <Button variant="outline" size="sm">
        <RotateCcw className="w-4 h-4 mr-2" />
        Restart
      </Button>
    </div>
  );
};
