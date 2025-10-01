import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { darkPlotlyTheme, getHealthColor, getLatencyColor } from '@/lib/plotly-themes';
import type { SystemMetrics } from '@/hooks/useSystemMetrics';
import type { VisualizationType } from '@/pages/trader/SystemArchitecture';

interface ArchitectureVisualizerProps {
  metrics: SystemMetrics;
  visualizationType: VisualizationType;
  searchFilter: string;
  onNodeClick: (nodeId: string) => void;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  metrics,
  visualizationType,
  searchFilter,
  onNodeClick,
}) => {
  const plotData = useMemo(() => {
    const filteredNodes = searchFilter
      ? metrics.nodes.filter(n => n.name.toLowerCase().includes(searchFilter.toLowerCase()))
      : metrics.nodes;

    switch (visualizationType) {
      case 'network':
      case 'force-directed':
        return getNetworkGraphData(metrics, filteredNodes, onNodeClick);
      case 'sankey':
        return getSankeyData(metrics, filteredNodes);
      case 'sunburst':
        return getSunburstData(filteredNodes);
      case 'treemap':
        return getTreemapData(filteredNodes);
      default:
        return getNetworkGraphData(metrics, filteredNodes, onNodeClick);
    }
  }, [metrics, visualizationType, searchFilter, onNodeClick]);

  return (
    <div className="w-full h-full">
      <Plot
        data={plotData}
        layout={{
          ...darkPlotlyTheme.layout,
          autosize: true,
          margin: { l: 40, r: 40, t: 40, b: 40 },
          showlegend: false,
          dragmode: 'pan',
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

const getNetworkGraphData = (metrics: SystemMetrics, nodes: any[], onNodeClick: (id: string) => void) => {
  // Create node positions in a circular layout
  const angleStep = (2 * Math.PI) / nodes.length;
  const radius = 2;

  const nodeX = nodes.map((_, i) => radius * Math.cos(i * angleStep));
  const nodeY = nodes.map((_, i) => radius * Math.sin(i * angleStep));

  // Edge traces
  const edgeX: number[] = [];
  const edgeY: number[] = [];

  metrics.connections.forEach(conn => {
    const sourceIdx = nodes.findIndex(n => n.id === conn.source);
    const targetIdx = nodes.findIndex(n => n.id === conn.target);
    
    if (sourceIdx !== -1 && targetIdx !== -1) {
      edgeX.push(nodeX[sourceIdx], nodeX[targetIdx], null as any);
      edgeY.push(nodeY[sourceIdx], nodeY[targetIdx], null as any);
    }
  });

  const edgeTrace = {
    x: edgeX,
    y: edgeY,
    mode: 'lines',
    type: 'scatter',
    line: {
      width: 2,
      color: 'rgba(124, 58, 237, 0.3)',
    },
    hoverinfo: 'none',
  };

  // Node trace
  const nodeTrace = {
    x: nodeX,
    y: nodeY,
    mode: 'markers+text',
    type: 'scatter',
    text: nodes.map(n => n.name),
    textposition: 'top center',
    textfont: {
      size: 10,
      color: '#ffffff',
    },
    marker: {
      size: nodes.map(n => 20 + (n.health / 100) * 20),
      color: nodes.map(n => getHealthColor(n.health)),
      line: {
        width: 2,
        color: '#ffffff',
      },
    },
    hovertemplate: nodes.map(n => 
      `<b>${n.name}</b><br>` +
      `Type: ${n.type}<br>` +
      `Health: ${n.health}%<br>` +
      `Status: ${n.status}<extra></extra>`
    ),
    customdata: nodes.map(n => n.id),
  };

  return [edgeTrace, nodeTrace] as any;
};

const getSankeyData = (metrics: SystemMetrics, nodes: any[]) => {
  const nodeLabels = nodes.map(n => n.name);
  const nodeColors = nodes.map(n => getHealthColor(n.health));

  const sourceIndices: number[] = [];
  const targetIndices: number[] = [];
  const values: number[] = [];
  const linkColors: string[] = [];

  metrics.connections.forEach(conn => {
    const sourceIdx = nodes.findIndex(n => n.id === conn.source);
    const targetIdx = nodes.findIndex(n => n.id === conn.target);
    
    if (sourceIdx !== -1 && targetIdx !== -1) {
      sourceIndices.push(sourceIdx);
      targetIndices.push(targetIdx);
      values.push(conn.dataVolume);
      linkColors.push(getLatencyColor(conn.latency));
    }
  });

  return [{
    type: 'sankey',
    node: {
      pad: 15,
      thickness: 20,
      line: { color: 'black', width: 0.5 },
      label: nodeLabels,
      color: nodeColors,
    },
    link: {
      source: sourceIndices,
      target: targetIndices,
      value: values,
      color: linkColors.map(c => c.replace(')', ', 0.4)').replace('rgb', 'rgba')),
    },
  }] as any;
};

const getSunburstData = (nodes: any[]) => {
  const types = [...new Set(nodes.map(n => n.type))];
  
  const labels = ['System', ...types, ...nodes.map(n => n.name)];
  const parents = ['', ...types.map(() => 'System'), ...nodes.map(n => n.type)];
  const values = [0, ...types.map(() => 0), ...nodes.map(n => n.health)];
  const colors = ['rgba(124, 58, 237, 0.3)', ...types.map(() => 'rgba(124, 58, 237, 0.5)'), ...nodes.map(n => getHealthColor(n.health))];

  return [{
    type: 'sunburst',
    labels,
    parents,
    values,
    marker: { colors },
    branchvalues: 'total',
  }] as any;
};

const getTreemapData = (nodes: any[]) => {
  const types = [...new Set(nodes.map(n => n.type))];
  
  const labels = ['System', ...types, ...nodes.map(n => n.name)];
  const parents = ['', ...types.map(() => 'System'), ...nodes.map(n => n.type)];
  const values = [0, ...types.map(() => 0), ...nodes.map(n => n.health)];
  const colors = ['rgba(124, 58, 237, 0.3)', ...types.map(() => 'rgba(124, 58, 237, 0.5)'), ...nodes.map(n => getHealthColor(n.health))];

  return [{
    type: 'treemap',
    labels,
    parents,
    values,
    marker: { colors },
    textposition: 'middle center',
  }] as any;
};
