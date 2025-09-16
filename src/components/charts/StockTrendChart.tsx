import React from 'react';
import Plot from 'react-plotly.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StockDataPoint {
  date: string;
  price: number;
  volume?: number;
}

interface StockTrendChartProps {
  symbol: string;
  data: StockDataPoint[];
  showVolume?: boolean;
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({ 
  symbol, 
  data, 
  showVolume = true 
}) => {
  const dates = data.map(d => d.date);
  const prices = data.map(d => d.price);
  const volumes = data.map(d => d.volume || 0);

  const traces: any[] = [
    {
      x: dates,
      y: prices,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Price',
      line: { color: '#3b82f6', width: 2 },
      marker: { size: 6 },
    }
  ];

  if (showVolume && volumes.some(v => v > 0)) {
    traces.push({
      x: dates,
      y: volumes,
      type: 'bar',
      name: 'Volume',
      yaxis: 'y2',
      opacity: 0.3,
      marker: { color: '#8b5cf6' },
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{symbol} Price Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <Plot
          data={traces}
          layout={{
            title: `${symbol} Historical Performance`,
            xaxis: { 
              title: 'Date',
              type: 'date',
            },
            yaxis: { 
              title: 'Price ($)',
              side: 'left',
            },
            ...(showVolume && volumes.some(v => v > 0) && {
              yaxis2: {
                title: 'Volume',
                overlaying: 'y',
                side: 'right',
              }
            }),
            showlegend: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' },
            height: 400,
            margin: { t: 50, r: 50, b: 50, l: 50 },
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          }}
          style={{ width: '100%' }}
        />
      </CardContent>
    </Card>
  );
};