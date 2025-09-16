import React from 'react';
import Plot from 'react-plotly.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ProbabilityData {
  symbol: string;
  probability: number;
  confidence: number;
  current_price: number;
}

interface ProbabilityChartProps {
  data: ProbabilityData[];
  title?: string;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ 
  data, 
  title = "Stock Prediction Probabilities" 
}) => {
  const symbols = data.map(d => d.symbol);
  const probabilities = data.map(d => d.probability * 100);
  const confidences = data.map(d => d.confidence * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Plot
          data={[
            {
              x: symbols,
              y: probabilities,
              type: 'bar',
              name: 'Probability (%)',
              marker: {
                color: probabilities.map(p => 
                  p >= 60 ? '#22c55e' : p >= 40 ? '#f59e0b' : '#ef4444'
                ),
                opacity: 0.8,
              },
              text: probabilities.map(p => `${p.toFixed(1)}%`),
              textposition: 'outside',
            },
            {
              x: symbols,
              y: confidences,
              type: 'scatter',
              mode: 'markers',
              name: 'Confidence (%)',
              marker: {
                size: 12,
                color: '#8b5cf6',
                symbol: 'diamond',
              },
              yaxis: 'y2',
            }
          ]}
          layout={{
            title: 'Stock Predictions Overview',
            xaxis: { title: 'Stock Symbol' },
            yaxis: { 
              title: 'Probability (%)',
              range: [0, 100],
            },
            yaxis2: {
              title: 'Confidence (%)',
              overlaying: 'y',
              side: 'right',
              range: [0, 100],
            },
            showlegend: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' },
            height: 400,
          }}
          config={{
            responsive: true,
            displayModeBar: false,
          }}
          style={{ width: '100%' }}
        />
      </CardContent>
    </Card>
  );
};