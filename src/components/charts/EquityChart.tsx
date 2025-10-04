import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EquityChartProps {
  equityCurve: { date: Date; value: number }[];
}

export function EquityChart({ equityCurve }: EquityChartProps) {
  const data = equityCurve.map(point => ({
    date: point.date.toLocaleDateString(),
    value: point.value
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
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
  );
}
