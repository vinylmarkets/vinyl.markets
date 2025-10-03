import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Check if Polygon API key is accessible
console.log('🔑 Polygon API Key check:', {
  exists: !!import.meta.env.VITE_POLYGON_API_KEY,
  firstChars: import.meta.env.VITE_POLYGON_API_KEY?.substring(0, 10)
});

// WebSocket connection for real-time data
let websocket: WebSocket | null = null;
const subscribers = new Map<string, Set<(data: any) => void>>();

async function getPolygonKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { action: 'get-websocket-key' }
  });
  
  if (error) throw error;
  return data.key;
}

export function initWebSocket() {
  if (websocket?.readyState === WebSocket.OPEN) return websocket;

  getPolygonKey().then(apiKey => {
    websocket = new WebSocket(`wss://socket.polygon.io/stocks`);

    websocket.onopen = () => {
      console.log('WebSocket connected to Polygon.io');
      websocket?.send(JSON.stringify({ action: 'auth', params: apiKey }));
    };

    websocket.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      messages.forEach((msg: any) => {
        if (msg.ev === 'T') {
          const callbacks = subscribers.get(msg.sym);
          if (callbacks) {
            callbacks.forEach(cb => cb(msg));
          }
        }
      });
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      websocket = null;
      setTimeout(initWebSocket, 5000);
    };
  }).catch(err => {
    console.error('Failed to initialize WebSocket:', err);
  });

  return websocket;
}

export function useRealtimePrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0);

  useEffect(() => {
    if (!symbol) return;

    const ws = initWebSocket();
    const callback = (data: any) => {
      setPrice(data.p);
      setVolume(v => v + (data.s || 0));
    };

    if (!subscribers.has(symbol)) {
      subscribers.set(symbol, new Set());
    }
    subscribers.get(symbol)?.add(callback);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'subscribe', params: `T.${symbol}` }));
    }

    return () => {
      const subs = subscribers.get(symbol);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          subscribers.delete(symbol);
          websocket?.send(JSON.stringify({ action: 'unsubscribe', params: `T.${symbol}` }));
        }
      }
    };
  }, [symbol]);

  return { price, volume };
}

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'get-quote',
          symbol: symbol.toUpperCase()
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!symbol,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useStockDetails(symbol: string) {
  return useQuery({
    queryKey: ['stock-details', symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'get-details',
          symbol: symbol.toUpperCase()
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useStockChart(symbol: string, timeframe: string = '1D') {
  return useQuery({
    queryKey: ['stock-chart', symbol, timeframe],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'get-chart',
          symbol: symbol.toUpperCase(),
          timeframe
        }
      });

      if (error) throw error;
      
      return (data.results || []).map((bar: any) => ({
        time: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
        price: bar.c
      }));
    },
    enabled: !!symbol,
    staleTime: 60000,
  });
}

export function useStockNews(symbol: string) {
  return useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'get-news',
          symbol: symbol.toUpperCase()
        }
      });

      if (error) throw error;
      return data.results || [];
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePortfolioData() {
  return useQuery({
    queryKey: ['portfolio-data'],
    queryFn: async () => {
      return {
        totalValue: 47853.21,
        change: 2347.89,
        changePercent: 5.16,
        positions: [
          { symbol: 'AAPL', shares: 50, avgCost: 170.00 },
          { symbol: 'TSLA', shares: 20, avgCost: 240.00 },
        ]
      };
    },
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];
      
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'get-watchlist',
          symbols
        }
      });

      if (error) throw error;
      return data.quotes || [];
    },
    refetchInterval: 30000,
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

export function getWebSocketStatus(): boolean {
  return websocket?.readyState === WebSocket.OPEN;
}
