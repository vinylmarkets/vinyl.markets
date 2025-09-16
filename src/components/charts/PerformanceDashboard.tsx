import React from 'react';
import Plot from 'react-plotly.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PerformanceMetrics {
  accuracy: number;
  totalSignals: number;
  winRate: number;
  avgReturn: number;
  sharpeRatio?: number;
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  historicalData?: Array<{
    date: string;
    accuracy: number;
    signals: number;
  }>;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  metrics, 
  historicalData = [] 
}) => {
  // Gauge chart for accuracy
  const gaugeData = [{
    type: 'indicator',
    mode: 'gauge+number+delta',
    value: metrics.accuracy * 100,
    domain: { x: [0, 1], y: [0, 1] },
    title: { text: 'Accuracy %' },
    delta: { reference: 70 }, // Reference point
    gauge: {
      axis: { range: [null, 100] },
      bar: { color: '#3b82f6' },
      steps: [
        { range: [0, 50], color: '#fef2f2' },
        { range: [50, 80], color: '#fef3c7' },
        { range: [80, 100], color: '#ecfdf5' }
      ],
      threshold: {
        line: { color: '#ef4444', width: 4 },
        thickness: 0.75,
        value: 90
      }
    }
  }];

  // Metrics summary
  const summaryData = [
    {
      x: ['Accuracy', 'Win Rate', 'Avg Return', 'Sharpe Ratio'],
      y: [
        metrics.accuracy * 100,
        metrics.winRate * 100,
        metrics.avgReturn * 100,
        (metrics.sharpeRatio || 0) * 100
      ],
      type: 'bar',
      marker: {
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        opacity: 0.8,
      },
      text: [
        `${(metrics.accuracy * 100).toFixed(1)}%`,
        `${(metrics.winRate * 100).toFixed(1)}%`,
        `${(metrics.avgReturn * 100).toFixed(1)}%`,
        `${((metrics.sharpeRatio || 0) * 100).toFixed(1)}%`
      ],
      textposition: 'outside',
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Accuracy Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>Current Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={gaugeData}
            layout={{
              width: 400,
              height: 300,
              margin: { t: 0, r: 0, l: 0, b: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' },
            }}
            config={{
              responsive: true,
              displayModeBar: false,
            }}
            style={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={summaryData}
            layout={{
              title: 'Key Metrics',
              yaxis: { title: 'Percentage (%)' },
              showlegend: false,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' },
              height: 300,
              margin: { t: 50, r: 20, b: 50, l: 50 },
            }}
            config={{
              responsive: true,
              displayModeBar: false,
            }}
            style={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Historical Trend (if data available) */}
      {historicalData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={[
                {
                  x: historicalData.map(d => d.date),
                  y: historicalData.map(d => d.accuracy * 100),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Accuracy (%)',
                  line: { color: '#3b82f6', width: 2 },
                },
                {
                  x: historicalData.map(d => d.date),
                  y: historicalData.map(d => d.signals),
                  type: 'bar',
                  name: 'Daily Signals',
                  yaxis: 'y2',
                  opacity: 0.6,
                  marker: { color: '#10b981' },
                }
              ]}
              layout={{
                title: 'Accuracy & Signal Volume Over Time',
                xaxis: { title: 'Date', type: 'date' },
                yaxis: { title: 'Accuracy (%)', side: 'left' },
                yaxis2: {
                  title: 'Daily Signals',
                  overlaying: 'y',
                  side: 'right',
                },
                showlegend: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#374151' },
                height: 400,
              }}
              config={{
                responsive: true,
                displayModeBar: true,
              }}
              style={{ width: '100%' }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};