import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Plot from 'react-plotly.js';
import { darkPlotlyTheme } from '@/lib/plotly-themes';
import type { AlgorithmInfo, AlgorithmFlowNode, AlgorithmConnection } from '@/hooks/useAlgorithmMetrics';

interface Props {
  algorithm: AlgorithmInfo;
  flowNodes: AlgorithmFlowNode[];
  flowConnections: AlgorithmConnection[];
}

export const AlgorithmVisualizationTabs: React.FC<Props> = ({ algorithm, flowNodes }) => {
  return (
    <Tabs defaultValue="flow" className="w-full">
      <TabsList className="bg-white/5">
        <TabsTrigger value="flow">Flow Diagram</TabsTrigger>
        <TabsTrigger value="performance">Performance Heatmap</TabsTrigger>
        <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="flow" className="mt-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6" style={{ height: '500px' }}>
          <Plot
            data={[{
              type: 'scatter',
              mode: 'markers+text',
              x: flowNodes.map((_, i) => i),
              y: flowNodes.map(n => n.executionCount),
              text: flowNodes.map(n => n.label),
              marker: { size: 20, color: flowNodes.map(n => n.successRate) }
            }] as any}
            layout={{ ...darkPlotlyTheme.layout, autosize: true }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </TabsContent>
      <TabsContent value="performance">
        <div className="text-white">Performance charts coming soon...</div>
      </TabsContent>
      <TabsContent value="trades">
        <div className="text-white">Trade analysis coming soon...</div>
      </TabsContent>
    </Tabs>
  );
};
