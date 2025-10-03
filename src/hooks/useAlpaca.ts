import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AccountData {
  equity: string;
  last_equity: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  long_market_value: string;
  short_market_value: string;
  position_market_value: string;
  daytrade_count: number;
  balance_asof: string;
}

interface Position {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: 'long' | 'short';
  asset_class: string;
  exchange: string;
  qty_available: string;
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
