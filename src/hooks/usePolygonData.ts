import { useQuery } from '@tanstack/react-query';

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io';

export interface TickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  market_cap?: number;
  phone_number?: string;
  address?: {
    address1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  description?: string;
  sic_code?: string;
  sic_description?: string;
  ticker_root?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
  share_class_shares_outstanding?: number;
  weighted_shares_outstanding?: number;
}

export interface TickerSnapshot {
  ticker: string;
  todaysChangePerc: number;
  todaysChange: number;
  updated: number;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  min: {
    av: number;
    t: number;
    n: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
}

export interface AggregateBar {
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  v: number; // volume
  vw: number; // volume weighted
  t: number; // timestamp
  n: number; // number of transactions
}

export interface NewsArticle {
  id: string;
  publisher: {
    name: string;
    homepage_url?: string;
    logo_url?: string;
    favicon_url?: string;
  };
  title: string;
  author?: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  image_url?: string;
  description?: string;
  keywords?: string[];
}

export const useTickerDetails = (symbol: string) => {
  return useQuery({
    queryKey: ['tickerDetails', symbol],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch ticker details');
      const data = await response.json();
      return data.results as TickerDetails;
    },
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useTickerSnapshot = (symbol: string) => {
  return useQuery({
    queryKey: ['tickerSnapshot', symbol],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch ticker snapshot');
      const data = await response.json();
      return data.ticker as TickerSnapshot;
    },
    enabled: !!symbol,
    refetchInterval: 30000, // 30 seconds
    staleTime: 30000,
  });
};

export const useAggregates = (
  symbol: string,
  multiplier: number,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
  from: string,
  to: string
) => {
  return useQuery({
    queryKey: ['aggregates', symbol, multiplier, timespan, from, to],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch aggregates');
      const data = await response.json();
      return data.results as AggregateBar[];
    },
    enabled: !!symbol && !!from && !!to,
    staleTime: timespan === 'day' ? 60000 : 3600000, // 1 min for daily, 1 hour for others
  });
};

export const useTickerNews = (symbol: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['tickerNews', symbol, limit],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/v2/reference/news?ticker=${symbol}&limit=${limit}&order=desc&apiKey=${POLYGON_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      return data.results as NewsArticle[];
    },
    enabled: !!symbol,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Helper functions
export const calculateMA = (data: AggregateBar[], period: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, bar) => acc + bar.c, 0);
      result.push(sum / period);
    }
  }
  return result;
};

export const calculateRSI = (data: AggregateBar[], period: number = 14): number[] => {
  const result: number[] = [];
  const changes: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].c - data[i - 1].c);
  }
  
  for (let i = 0; i < changes.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const gains = changes.slice(i - period + 1, i + 1).filter(c => c > 0);
      const losses = changes.slice(i - period + 1, i + 1).filter(c => c < 0);
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0)) / period : 0;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return result;
};

export const formatMarketCap = (marketCap?: number): string => {
  if (!marketCap) return 'N/A';
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toFixed(0)}`;
};

export const getMarketStatus = (timestamp?: number): string => {
  if (!timestamp) return 'Unknown';
  const now = new Date();
  const marketDate = new Date(timestamp);
  const hours = now.getHours();
  const day = now.getDay();
  
  // Weekend
  if (day === 0 || day === 6) return 'Closed';
  
  // Market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
  if (hours >= 14 && hours < 21) return 'Open';
  if (hours >= 9 && hours < 14) return 'Pre-Market';
  if (hours >= 21 || hours < 4) return 'After-Hours';
  return 'Closed';
};

export const getTimeRangeDates = (range: string): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  
  switch (range) {
    case '1D':
      from.setDate(from.getDate() - 1);
      break;
    case '5D':
      from.setDate(from.getDate() - 5);
      break;
    case '1M':
      from.setMonth(from.getMonth() - 1);
      break;
    case '3M':
      from.setMonth(from.getMonth() - 3);
      break;
    case '6M':
      from.setMonth(from.getMonth() - 6);
      break;
    case '1Y':
      from.setFullYear(from.getFullYear() - 1);
      break;
    case '5Y':
      from.setFullYear(from.getFullYear() - 5);
      break;
    default:
      from.setFullYear(from.getFullYear() - 1);
  }
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
};
