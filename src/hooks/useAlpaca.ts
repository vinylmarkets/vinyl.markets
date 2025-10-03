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
  assetType: string;
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
      console.log('🔍 Calling trader-account edge function...');
      
      const { data, error } = await supabase.functions.invoke<{ success: boolean; data: AccountData }>('trader-account');
      
      console.log('🔍 trader-account response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching account:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from trader-account');
        return null;
      }
      
      console.log('✅ Account data received:', data.data);
      return data?.data;
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: false, // Don't retry on errors to see them immediately
  });
}

export function useAlpacaPositions() {
  return useQuery({
    queryKey: ['alpaca-positions'],
    queryFn: async () => {
      console.log('🔍 Calling trader-positions edge function...');
      
      const { data, error } = await supabase.functions.invoke<{ success: boolean; data: PositionsData }>('trader-positions');
      
      console.log('🔍 trader-positions response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching positions:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from trader-positions');
        return null;
      }
      
      console.log('✅ Positions data received:', data.data);
      return data?.data;
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: false, // Don't retry on errors to see them immediately
  });
}
