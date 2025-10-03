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
