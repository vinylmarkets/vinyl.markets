import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EquityPoint, DrawdownPoint } from '@/lib/ampPerformanceCalculations';

interface AmpPerformanceChartProps {
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  ampName: string;
}

export function AmpPerformanceChart({ equityCurve, drawdownCurve, ampName }: AmpPerformanceChartProps) {
  const equityData = equityCurve.map((point) => ({
    date: point.date.toLocaleDateString(),
    value: point.value,
  }));

  const drawdownData = drawdownCurve.map((point) => ({
    date: point.date.toLocaleDateString(),
    drawdown: point.drawdown,
  }));

  if (equityCurve.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No performance data available yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Equity Curve - {ampName}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Portfolio Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Drawdown - {ampName}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={drawdownData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="drawdown"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={false}
              name="Drawdown %"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
