import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AccountData {
  portfolioValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  buyingPower: number;
  totalEquity: number;
  marginUsed: number;
  dayTradesUsed: number;
  accountStatus: string;
  lastUpdated: string;
}

interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  side: 'long' | 'short';
  assetType: 'stock' | 'option' | 'crypto';
  broker?: string;
  accountLast4?: string;
}

interface RecentTrade {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  timeAgo: string;
}

interface PositionsData {
  positions: Position[];
  recentTrades: RecentTrade[];
  totalValue: number;
  totalPnL: number;
}

export function useAlpacaAccount() {
  return useQuery({
    queryKey: ['alpaca-account'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ success: boolean; data: AccountData }>('trader-account');
      
      if (error) {
        console.error('Error fetching account:', error);
        throw error;
      }
      
      return data?.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}

export function useAlpacaPositions() {
  return useQuery({
    queryKey: ['alpaca-positions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ success: boolean; data: PositionsData }>('trader-positions');
      
      if (error) {
        console.error('Error fetching positions:', error);
        throw error;
      }
      
      return data?.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
}
