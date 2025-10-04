import { supabase } from '@/integrations/supabase/client';

export interface AllocationResult {
  ampId: string;
  capital: number;
  percentage: number;
}

export interface RebalancingStrategy {
  type: 'performance' | 'risk' | 'equal' | 'kelly';
  minRebalanceThreshold: number;
  maxAllocationChange: number;
}

export interface RebalancingPlan {
  layerId: string;
  currentAllocations: AllocationResult[];
  proposedAllocations: AllocationResult[];
  changes: Array<{
    ampId: string;
    currentAllocation: number;
    proposedAllocation: number;
    changePercent: number;
    reason: string;
  }>;
  shouldRebalance: boolean;
  totalChangePercent: number;
}

export class AutoRebalancer {
  async analyzeRebalancing(
    layerId: string,
    strategy: RebalancingStrategy,
    lookbackDays: number = 30
  ): Promise<RebalancingPlan> {
    const { data: layer } = await supabase
      .from('amp_layers')
      .select('*')
      .eq('id', layerId)
      .single();

    if (!layer) throw new Error('Layer not found');

    const { data: layerAmps } = await supabase
      .from('layer_amps')
      .select('*')
      .eq('layer_id', layerId)
      .eq('is_enabled', true);

    if (!layerAmps) throw new Error('No amps found');

    const currentAllocations: AllocationResult[] = layerAmps.map(amp => ({
      ampId: amp.amp_id,
      capital: amp.capital_allocation,
      percentage: 0
    }));

    const totalCapital = currentAllocations.reduce((sum, a) => sum + a.capital, 0);
    currentAllocations.forEach(a => a.percentage = (a.capital / totalCapital) * 100);

    const performance = await this.getAmpPerformance(layerId, layerAmps.map(a => a.amp_id), lookbackDays);

    let proposedAllocations: AllocationResult[];
    switch (strategy.type) {
      case 'performance':
        proposedAllocations = this.rebalanceByPerformance(currentAllocations, performance, totalCapital);
        break;
      case 'risk':
        proposedAllocations = this.rebalanceByRisk(currentAllocations, performance, totalCapital);
        break;
      case 'kelly':
        proposedAllocations = this.rebalanceByKelly(currentAllocations, performance, totalCapital);
        break;
      default:
        proposedAllocations = this.rebalanceEqually(currentAllocations, totalCapital);
    }

    const changes = this.calculateChanges(currentAllocations, proposedAllocations);
    const totalChangePercent = changes.reduce((sum, c) => sum + Math.abs(c.changePercent), 0) / changes.length;
    const shouldRebalance = totalChangePercent >= strategy.minRebalanceThreshold;

    return {
      layerId,
      currentAllocations,
      proposedAllocations,
      changes,
      shouldRebalance,
      totalChangePercent
    };
  }

  async executeRebalancing(plan: RebalancingPlan): Promise<void> {
    const oldAllocations = plan.currentAllocations.map(a => ({
      amp_id: a.ampId,
      allocation: a.capital
    }));

    const newAllocations = plan.proposedAllocations.map(a => ({
      amp_id: a.ampId,
      allocation: a.capital
    }));

    for (const proposed of plan.proposedAllocations) {
      await supabase
        .from('layer_amps')
        .update({ capital_allocation: proposed.capital })
        .eq('layer_id', plan.layerId)
        .eq('amp_id', proposed.ampId);
    }

    await supabase.from('rebalancing_history').insert({
      layer_id: plan.layerId,
      rebalance_type: 'auto',
      old_allocations: oldAllocations,
      new_allocations: newAllocations,
      reason: `Automatic rebalancing: ${plan.totalChangePercent.toFixed(1)}% total change`
    });
  }

  private async getAmpPerformance(layerId: string, ampIds: string[], days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const performanceMap: Map<string, {
      pnl: number;
      trades: number;
      winRate: number;
      sharpe: number;
      maxDrawdown: number;
    }> = new Map();

    for (const ampId of ampIds) {
      const { data: perfData } = await supabase
        .from('layer_amp_performance')
        .select('*')
        .eq('layer_id', layerId)
        .eq('amp_id', ampId)
        .gte('date', cutoffDate.toISOString().split('T')[0]);

      const totalPnl = perfData?.reduce((sum, p) => sum + (p.pnl || 0), 0) || 0;
      const totalTrades = perfData?.reduce((sum, p) => sum + (p.trades_executed || 0), 0) || 0;
      const wins = perfData?.filter(p => (p.pnl || 0) > 0).length || 0;
      const winRate = totalTrades > 0 ? wins / totalTrades : 0.5;

      const returns = perfData?.map(p => p.pnl || 0) || [];
      const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
      const stdDev = this.calculateStdDev(returns, avgReturn);
      const sharpe = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

      const drawdown = this.calculateMaxDrawdown(returns);

      performanceMap.set(ampId, {
        pnl: totalPnl,
        trades: totalTrades,
        winRate,
        sharpe,
        maxDrawdown: drawdown
      });
    }

    return performanceMap;
  }

  private rebalanceByPerformance(
    current: AllocationResult[],
    performance: Map<string, any>,
    totalCapital: number
  ): AllocationResult[] {
    const scores = current.map(a => {
      const perf = performance.get(a.ampId);
      if (!perf) return { ampId: a.ampId, score: 1 };
      
      const sharpeScore = Math.max(0, perf.sharpe) / 2;
      const winRateScore = perf.winRate;
      const pnlScore = Math.max(0, Math.min(perf.pnl / 10000, 1));
      
      return {
        ampId: a.ampId,
        score: sharpeScore + winRateScore + pnlScore
      };
    });

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    
    return scores.map(s => ({
      ampId: s.ampId,
      capital: (s.score / totalScore) * totalCapital,
      percentage: (s.score / totalScore) * 100
    }));
  }

  private rebalanceByRisk(
    current: AllocationResult[],
    performance: Map<string, any>,
    totalCapital: number
  ): AllocationResult[] {
    const riskScores = current.map(a => {
      const perf = performance.get(a.ampId);
      if (!perf) return { ampId: a.ampId, risk: 1 };
      
      const drawdownRisk = 1 - Math.abs(perf.maxDrawdown);
      const volatilityRisk = perf.sharpe > 0 ? 1 / (1 + perf.sharpe) : 0.5;
      
      return {
        ampId: a.ampId,
        risk: (drawdownRisk + volatilityRisk) / 2
      };
    });

    const totalRisk = riskScores.reduce((sum, r) => sum + (1 - r.risk), 0);
    
    return riskScores.map(r => {
      const inverseRisk = 1 - r.risk;
      return {
        ampId: r.ampId,
        capital: (inverseRisk / totalRisk) * totalCapital,
        percentage: (inverseRisk / totalRisk) * 100
      };
    });
  }

  private rebalanceByKelly(
    current: AllocationResult[],
    performance: Map<string, any>,
    totalCapital: number
  ): AllocationResult[] {
    const kellyFractions = current.map(a => {
      const perf = performance.get(a.ampId);
      if (!perf || perf.trades < 10) return { ampId: a.ampId, kelly: 1 / current.length };
      
      const winRate = perf.winRate;
      const avgWin = perf.pnl > 0 ? perf.pnl / (perf.trades * winRate) : 1;
      const avgLoss = perf.pnl < 0 ? Math.abs(perf.pnl) / (perf.trades * (1 - winRate)) : 1;
      
      const kelly = (winRate - ((1 - winRate) / (avgWin / avgLoss))) * 0.25; // Quarter Kelly
      
      return {
        ampId: a.ampId,
        kelly: Math.max(0.05, Math.min(0.4, kelly))
      };
    });

    const totalKelly = kellyFractions.reduce((sum, k) => sum + k.kelly, 0);
    
    return kellyFractions.map(k => ({
      ampId: k.ampId,
      capital: (k.kelly / totalKelly) * totalCapital,
      percentage: (k.kelly / totalKelly) * 100
    }));
  }

  private rebalanceEqually(current: AllocationResult[], totalCapital: number): AllocationResult[] {
    const perAmp = totalCapital / current.length;
    return current.map(a => ({
      ampId: a.ampId,
      capital: perAmp,
      percentage: 100 / current.length
    }));
  }

  private calculateChanges(current: AllocationResult[], proposed: AllocationResult[]) {
    return current.map(curr => {
      const prop = proposed.find(p => p.ampId === curr.ampId)!;
      const change = prop.capital - curr.capital;
      const changePercent = (change / curr.capital) * 100;

      let reason = '';
      if (changePercent > 5) reason = 'Increase allocation due to strong performance';
      else if (changePercent < -5) reason = 'Decrease allocation due to underperformance';
      else reason = 'Minor adjustment for optimization';

      return {
        ampId: curr.ampId,
        currentAllocation: curr.capital,
        proposedAllocation: prop.capital,
        changePercent,
        reason
      };
    });
  }

  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    for (const ret of returns) {
      cumulative += ret;
      if (cumulative > peak) peak = cumulative;
      const drawdown = (peak - cumulative) / (peak || 1);
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
  }
}
