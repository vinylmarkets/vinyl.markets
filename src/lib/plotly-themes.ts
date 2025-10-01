// Plotly custom themes for 2025 modern design with glassmorphism and neon effects

export const darkPlotlyTheme = {
  layout: {
    paper_bgcolor: 'rgba(10, 10, 15, 0.8)',
    plot_bgcolor: 'rgba(26, 26, 46, 0.5)',
    font: {
      family: 'Inter, system-ui, sans-serif',
      color: '#e0e0e0',
      size: 12,
    },
    colorway: [
      '#00ff88', // neon green
      '#00ffff', // neon cyan
      '#ff00ff', // neon pink
      '#7c3aed', // electric purple
      '#ffff00', // neon yellow
      '#ff6b6b', // coral red
      '#4ecdc4', // turquoise
      '#95e1d3', // mint
    ],
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: 'rgba(26, 26, 46, 0.95)',
      bordercolor: '#00ff88',
      font: {
        family: 'Inter, system-ui, sans-serif',
        color: '#ffffff',
        size: 13,
      },
    },
    xaxis: {
      gridcolor: 'rgba(124, 58, 237, 0.15)',
      linecolor: 'rgba(124, 58, 237, 0.3)',
      tickcolor: 'rgba(124, 58, 237, 0.3)',
      zerolinecolor: 'rgba(124, 58, 237, 0.3)',
    },
    yaxis: {
      gridcolor: 'rgba(124, 58, 237, 0.15)',
      linecolor: 'rgba(124, 58, 237, 0.3)',
      tickcolor: 'rgba(124, 58, 237, 0.3)',
      zerolinecolor: 'rgba(124, 58, 237, 0.3)',
    },
    scene: {
      xaxis: {
        gridcolor: 'rgba(124, 58, 237, 0.2)',
        linecolor: 'rgba(124, 58, 237, 0.3)',
      },
      yaxis: {
        gridcolor: 'rgba(124, 58, 237, 0.2)',
        linecolor: 'rgba(124, 58, 237, 0.3)',
      },
      zaxis: {
        gridcolor: 'rgba(124, 58, 237, 0.2)',
        linecolor: 'rgba(124, 58, 237, 0.3)',
      },
    },
  },
};

export const getHealthColor = (health: number): string => {
  // Health from 0-100, returns color gradient from red to green with neon glow
  if (health >= 80) return '#00ff88'; // neon green
  if (health >= 60) return '#10b981'; // success green
  if (health >= 40) return '#f59e0b'; // warning yellow
  if (health >= 20) return '#ef4444'; // error red
  return '#dc2626'; // critical red
};

export const getLatencyColor = (latency: number): string => {
  // Latency in ms, returns color from blue (fast) to red (slow)
  if (latency < 50) return '#00ffff'; // neon cyan - fast
  if (latency < 100) return '#3b82f6'; // blue
  if (latency < 200) return '#f59e0b'; // yellow
  if (latency < 500) return '#ff6b6b'; // orange
  return '#ef4444'; // red - slow
};

export const getPerformanceColor = (performance: number): string => {
  // Performance metric (can be P&L, success rate, etc.)
  if (performance > 0) {
    const intensity = Math.min(Math.abs(performance) / 100, 1);
    return `rgba(0, 255, 136, ${0.5 + intensity * 0.5})`; // green with intensity
  } else {
    const intensity = Math.min(Math.abs(performance) / 100, 1);
    return `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`; // red with intensity
  }
};

export const neonGlowFilter = (color: string) => {
  return {
    filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`,
  };
};
