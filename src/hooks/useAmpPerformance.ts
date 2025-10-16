import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateAggregateMetrics,
  generateEquityCurve,
  generateDrawdownCurve,
  type AggregateMetrics,
  type EquityPoint,
  type DrawdownPoint,
} from '@/lib/ampPerformanceCalculations';

interface AmpPerformanceSnapshot {
  date: string;
  trades_executed: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  cumulative_pnl: number;
  cumulative_trades: number;
  cumulative_wins: number;
  cumulative_losses: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  largest_win: number;
  largest_loss: number;
  max_drawdown: number;
  current_drawdown: number;
}

interface AmpPerformanceData {
  metrics: AggregateMetrics;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  amp_name: string;
  allocated_capital: number;
}

/**
 * Fetch performance data for a single amp
 */
export function useAmpPerformance(userAmpId: string) {
  return useQuery({
    queryKey: ['amp-performance', userAmpId],
    queryFn: async (): Promise<AmpPerformanceData> => {
      // Fetch user amp details
      const { data: ampData, error: ampError } = await supabase
        .from('user_amps')
        .select('name, allocated_capital')
        .eq('id', userAmpId)
        .single();

      if (ampError) throw ampError;

      // Fetch performance snapshots
      const { data: snapshots, error: perfError } = await supabase
        .from('amp_performance' as any)
        .select('*')
        .eq('user_amp_id', userAmpId)
        .order('date', { ascending: true });

      if (perfError) throw perfError;

      const initialCapital = ampData.allocated_capital || 10000;
      const typedSnapshots = (snapshots || []) as unknown as AmpPerformanceSnapshot[];

      // Calculate metrics
      const metrics = calculateAggregateMetrics(typedSnapshots, initialCapital);
      const equityCurve = generateEquityCurve(typedSnapshots, initialCapital);
      const drawdownCurve = generateDrawdownCurve(typedSnapshots);

      return {
        metrics,
        equityCurve,
        drawdownCurve,
        amp_name: ampData.name,
        allocated_capital: initialCapital,
      };
    },
    enabled: !!userAmpId,
  });
}

/**
 * Fetch performance data for all user amps
 */
export function useAllAmpsPerformance() {
  return useQuery({
    queryKey: ['all-amps-performance'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all user amps
      const { data: amps, error: ampsError } = await supabase
        .from('user_amps')
        .select('id, name, allocated_capital')
        .eq('user_id', user.id);

      if (ampsError) throw ampsError;

      // Fetch performance for each amp
      const performanceData = await Promise.all(
        (amps || []).map(async (amp) => {
          const { data: snapshots } = await supabase
            .from('amp_performance' as any)
            .select('*')
            .eq('user_amp_id', amp.id)
            .order('date', { ascending: true });

          const initialCapital = amp.allocated_capital || 10000;
          const typedSnapshots = (snapshots || []) as unknown as AmpPerformanceSnapshot[];
          const metrics = calculateAggregateMetrics(typedSnapshots, initialCapital);
          const equityCurve = generateEquityCurve(typedSnapshots, initialCapital);
          const drawdownCurve = generateDrawdownCurve(typedSnapshots);

          return {
            ampId: amp.id,
            amp_name: amp.name,
            allocated_capital: initialCapital,
            metrics,
            equityCurve,
            drawdownCurve,
          };
        })
      );

      return performanceData;
    },
  });
}
