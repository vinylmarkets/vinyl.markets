import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePlaceOrder } from '@/integrations/alpaca/hooks';
import { toast } from 'sonner';

export function useExecuteAmpTrade() {
  const placeOrder = usePlaceOrder();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ampId, 
      symbol, 
      side, 
      qty,
      price 
    }: { 
      ampId: string; 
      symbol: string; 
      side: 'buy' | 'sell';
      qty: number;
      price: number;
    }) => {
      console.log('🎯 Executing amp trade:', { ampId, symbol, side, qty, price });

      // Place order with Alpaca
      const orderResult = await placeOrder.mutateAsync({
        symbol,
        qty,
        side
      });

      console.log('✅ Order placed:', orderResult);

      // Record trade in database
      const { data, error } = await supabase
        .from('amp_trades')
        .insert({
          amp_id: ampId,
          symbol,
          side,
          quantity: qty,
          price
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to record trade:', error);
        throw error;
      }

      console.log('✅ Trade recorded in database');

      // Update amp stats
      await updateAmpStats(ampId);

      return { trade: data, order: orderResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-amps'] });
      queryClient.invalidateQueries({ queryKey: ['amp-trades'] });
      toast.success('Trade executed successfully');
    },
    onError: (error: any) => {
      toast.error(`Trade failed: ${error.message}`);
    }
  });
}

async function updateAmpStats(ampId: string) {
  console.log('📊 Updating amp stats for:', ampId);

  // Get all trades for this amp
  const { data: trades } = await supabase
    .from('amp_trades')
    .select('*')
    .eq('amp_id', ampId);

  if (!trades) {
    console.log('No trades found for amp');
    return;
  }

  // Calculate total P&L
  let totalPnl = 0;
  let wins = 0;
  
  trades.forEach(trade => {
    if (trade.pnl) {
      totalPnl += parseFloat(trade.pnl.toString());
      if (parseFloat(trade.pnl.toString()) > 0) wins++;
    }
  });

  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  // Get amp to calculate percentage
  const { data: amp } = await supabase
    .from('user_amps')
    .select('allocated_capital')
    .eq('id', ampId)
    .single();

  const allocatedCapital = parseFloat(amp?.allocated_capital.toString() || '1');
  const pnlPercent = (totalPnl / allocatedCapital) * 100;

  console.log('📈 Stats calculated:', { totalPnl, pnlPercent, winRate, trades: trades.length });

  // Update amp
  const { error } = await supabase
    .from('user_amps')
    .update({
      total_pnl: totalPnl,
      total_pnl_percent: pnlPercent,
      trades_count: trades.length,
      win_rate: winRate,
      last_trade_at: new Date().toISOString()
    })
    .eq('id', ampId);

  if (error) {
    console.error('❌ Failed to update amp stats:', error);
  } else {
    console.log('✅ Amp stats updated');
  }
}