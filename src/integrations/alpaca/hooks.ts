import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    retry: false,
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
    retry: false,
  });
}

export function useAlpacaPortfolioHistory(period: string = '1M', timeframe: string = '1D') {
  return useQuery({
    queryKey: ['alpaca-portfolio-history', period, timeframe],
    queryFn: async () => {
      console.log('🔍 Fetching portfolio history:', { period, timeframe });
      
      const { data, error } = await supabase.functions.invoke('trader-portfolio-history', {
        method: 'POST',
        body: { period, timeframe }
      });
      
      if (error) {
        console.error('❌ Portfolio history error:', error);
        throw error;
      }
      
      console.log('✅ Portfolio history data:', data);
      
      // Alpaca returns: { timestamp: [numbers], equity: [numbers] }
      const timestamps = data?.data?.timestamp || [];
      const equity = data?.data?.equity || [];
      
      return timestamps.map((time: number, i: number) => ({
        time: time * 1000,
        value: parseFloat(equity[i] || '0')
      }));
    },
    enabled: true,
    staleTime: 60000,
    retry: false,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      symbol: string;
      qty: number;
      side: 'buy' | 'sell';
      type?: string;
    }) => {
      console.log('📤 Placing order:', order);
      
      const { data, error } = await supabase.functions.invoke('trader-place-order', {
        body: order
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alpaca-positions'] });
      queryClient.invalidateQueries({ queryKey: ['alpaca-account'] });
    }
  });
}

export function useAlpacaOrders(status: string = 'all') {
  return useQuery({
    queryKey: ['alpaca-orders', status],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('trader-get-orders', {
        body: { status }
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000
  });
}
