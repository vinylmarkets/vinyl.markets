import { useQuery } from '@tanstack/react-query';

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY || '';

console.log('🔑 Polygon API Key loaded:', !!POLYGON_API_KEY);

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      if (!POLYGON_API_KEY) throw new Error('API key not configured');
      
      console.log('🔍 Fetching quote data using aggregates endpoint (free tier compatible)');
      
      // Use last 2 days of 5-minute bars to get latest price
      const now = new Date();
      const yesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const fromDate = yesterday.toISOString().split('T')[0];
      const toDate = now.toISOString().split('T')[0];
      
      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/5/minute/${fromDate}/${toDate}?adjusted=true&sort=desc&limit=50&apiKey=${POLYGON_API_KEY}`;
      console.log('📡 Aggregates URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.message || 'Failed to fetch quote');
      }
      
      const data = await response.json();
      console.log('✅ Received data:', data);
      
      if (!data.results || data.results.length === 0) {
        throw new Error('No data available for this symbol');
      }
      
      // Get the most recent bar and previous bar for change calculation
      const latestBar = data.results[0];
      const previousBar = data.results[data.results.length - 1];
      
      // Construct a snapshot-like object from aggregates data
      return {
        day: {
          c: latestBar.c,
          o: latestBar.o,
          h: latestBar.h,
          l: latestBar.l,
          v: latestBar.v
        },
        prevDay: {
          c: previousBar.c
        }
      };
    },
    enabled: !!symbol && !!POLYGON_API_KEY,
    retry: 1,
    staleTime: 15000,
  });
}

export function useStockDetails(symbol: string) {
  return useQuery({
    queryKey: ['stock-details', symbol],
    queryFn: async () => {
      if (!POLYGON_API_KEY) throw new Error('API key not configured');
      
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers/${symbol.toUpperCase()}?apiKey=${POLYGON_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch details');
      
      const data = await response.json();
      return data.results;
    },
    enabled: !!symbol && !!POLYGON_API_KEY,
    retry: 1,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useStockChart(symbol: string, timeframe: string = '1D') {
  return useQuery({
    queryKey: ['stock-chart', symbol, timeframe],
    queryFn: async () => {
      if (!POLYGON_API_KEY) throw new Error('API key not configured');
      
      const now = new Date();
      const timeframes: Record<string, { multiplier: number; timespan: string; from: Date }> = {
        '1D': { multiplier: 5, timespan: 'minute', from: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        '5D': { multiplier: 30, timespan: 'minute', from: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        '1M': { multiplier: 1, timespan: 'hour', from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        '3M': { multiplier: 1, timespan: 'day', from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
        '1Y': { multiplier: 1, timespan: 'day', from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
      };

      const config = timeframes[timeframe] || timeframes['1D'];
      const fromDate = config.from.toISOString().split('T')[0];
      const toDate = now.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/${config.multiplier}/${config.timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) throw new Error('Failed to fetch chart data');

      const data = await response.json();
      return (data.results || []).map((bar: any) => ({
        time: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
    },
    enabled: !!symbol && !!POLYGON_API_KEY,
    retry: 1,
    staleTime: 60000,
  });
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((price, i) => price - closes[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Additional hooks for compatibility with existing components
export function useRealtimePrice(symbol: string) {
  const { data: quote } = useStockQuote(symbol);
  return { 
    price: quote?.day?.c || quote?.prevDay?.c || null, 
    volume: quote?.day?.v || 0 
  };
}

export function usePortfolioData() {
  return {
    data: {
      totalValue: 47853.21,
      change: 2347.89,
      changePercent: 5.16,
      positions: [
        { symbol: 'AAPL', shares: 50, avgCost: 170.00 },
        { symbol: 'TSLA', shares: 20, avgCost: 240.00 },
      ]
    },
    isLoading: false
  };
}

export function useWatchlist() {
  return {
    data: [],
    isLoading: false
  };
}

export function getWebSocketStatus(): boolean {
  return false;
}

