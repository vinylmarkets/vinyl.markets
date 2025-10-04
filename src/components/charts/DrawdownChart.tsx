import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DrawdownChartProps {
  drawdownCurve: { date: Date; drawdown: number }[];
}

export function DrawdownChart({ drawdownCurve }: DrawdownChartProps) {
  const data = drawdownCurve.map(point => ({
    date: point.date.toLocaleDateString(),
    drawdown: point.drawdown * 100 // Convert to percentage
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
          formatter={(value: number) => `${value.toFixed(2)}%`}
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
  );
}
