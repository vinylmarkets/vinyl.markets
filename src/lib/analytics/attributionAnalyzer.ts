import { supabase } from '@/integrations/supabase/client';

export interface AmpAttribution {
  ampId: string;
  ampName: string;
  // Contribution
  totalPnL: number;
  percentageOfTotalPnL: number;
  tradesExecuted: number;
  percentageOfTrades: number;
  // Performance
  winRate: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio: number;
  // Efficiency
  signalsGenerated: number;
  executionRate: number; // signals executed / signals generated
  conflictsWon: number;
  conflictsLost: number;
  // Impact
  bestTrade: number;
  worstTrade: number;
  contributionScore: number; // 0-100
}

export interface CorrelationMatrix {
  amps: string[];
  matrix: number[][]; // Correlation coefficients
  averageCorrelation: number;
  diversificationScore: number; // 0-100, higher = better diversification
}

export class AttributionAnalyzer {
  /**
   * Calculate attribution for all amps in a layer
   */
  static async calculateAttribution(
    layerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AmpAttribution[]> {
    // Fetch layer amp performance
    const { data: ampPerfData, error } = await supabase
      .from('layer_amp_performance')
      .select('*')
      .eq('layer_id', layerId)
      .order('date', { ascending: true });

    if (error) throw error;

    if (!ampPerfData || ampPerfData.length === 0) {
      return [];
    }

    // Group by amp_id
    const ampGroups = ampPerfData.reduce((acc: any, curr: any) => {
      if (!acc[curr.amp_id]) {
        acc[curr.amp_id] = [];
      }
      acc[curr.amp_id].push(curr);
      return acc;
    }, {});

    // Calculate totals for percentages
    const totalPnL = ampPerfData.reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0);
    const totalTrades = ampPerfData.reduce((sum, p) => sum + (p.trades_executed || 0), 0);

    // Calculate attribution for each amp
    const attributions: AmpAttribution[] = Object.entries(ampGroups).map(([ampId, data]: [string, any]) => {
      const ampPnL = data.reduce((sum: number, p: any) => sum + parseFloat(String(p.pnl || 0)), 0);
      const ampTrades = data.reduce((sum: number, p: any) => sum + (p.trades_executed || 0), 0);
      const ampSignals = data.reduce((sum: number, p: any) => sum + (p.signals_generated || 0), 0);
      const ampConflictsWon = data.reduce((sum: number, p: any) => sum + (p.conflicts_won || 0), 0);

      // Calculate wins and losses
      const wins = data.filter((p: any) => parseFloat(String(p.pnl || 0)) > 0);
      const losses = data.filter((p: any) => parseFloat(String(p.pnl || 0)) < 0);

      const avgWin = wins.length > 0
        ? wins.reduce((sum: number, p: any) => sum + parseFloat(String(p.pnl || 0)), 0) / wins.length
        : 0;

      const avgLoss = losses.length > 0
        ? Math.abs(losses.reduce((sum: number, p: any) => sum + parseFloat(String(p.pnl || 0)), 0) / losses.length)
        : 0;

      const winRate = ampTrades > 0 ? wins.length / data.length : 0;

      // Calculate Sharpe ratio (simplified)
      const avgReturn = ampPnL / Math.max(data.length, 1);
      const variance = data.reduce((sum: number, p: any) => {
        const ret = parseFloat(String(p.pnl || 0));
        return sum + Math.pow(ret - avgReturn, 2);
      }, 0) / Math.max(data.length, 1);
      const volatility = Math.sqrt(variance);
      const sharpeRatio = volatility !== 0 ? avgReturn / volatility : 0;

      // Find best and worst trades
      const pnls = data.map((p: any) => parseFloat(String(p.pnl || 0)));
      const bestTrade = Math.max(...pnls, 0);
      const worstTrade = Math.min(...pnls, 0);

      // Calculate contribution score (0-100)
      const pnlScore = totalPnL !== 0 ? (ampPnL / totalPnL) * 40 : 0;
      const winRateScore = winRate * 30;
      const sharpeScore = Math.max(0, Math.min(30, (sharpeRatio + 1) * 15));
      const contributionScore = Math.max(0, Math.min(100, pnlScore + winRateScore + sharpeScore));

      return {
        ampId,
        ampName: ampId,
        totalPnL: ampPnL,
        percentageOfTotalPnL: totalPnL !== 0 ? (ampPnL / totalPnL) * 100 : 0,
        tradesExecuted: ampTrades,
        percentageOfTrades: totalTrades !== 0 ? (ampTrades / totalTrades) * 100 : 0,
        winRate,
        avgWin,
        avgLoss,
        sharpeRatio,
        signalsGenerated: ampSignals,
        executionRate: ampSignals !== 0 ? (ampTrades / ampSignals) * 100 : 0,
        conflictsWon: ampConflictsWon,
        conflictsLost: 0, // Would need additional tracking
        bestTrade,
        worstTrade,
        contributionScore,
      };
    });

    // Sort by contribution score
    return attributions.sort((a, b) => b.contributionScore - a.contributionScore);
  }

  /**
   * Calculate correlation matrix between amps
   */
  static async calculateCorrelation(layerId: string): Promise<CorrelationMatrix> {
    // Fetch layer amp performance
    const { data: ampPerfData, error } = await supabase
      .from('layer_amp_performance')
      .select('*')
      .eq('layer_id', layerId)
      .order('date', { ascending: true });

    if (error) throw error;

    if (!ampPerfData || ampPerfData.length === 0) {
      return {
        amps: [],
        matrix: [],
        averageCorrelation: 0,
        diversificationScore: 0,
      };
    }

    // Get unique amps and dates
    const ampIds = [...new Set(ampPerfData.map((p: any) => p.amp_id))];
    const dates = [...new Set(ampPerfData.map((p: any) => p.date))];

    // Build returns matrix (amps x dates)
    const returnsMatrix: number[][] = ampIds.map(ampId => {
      return dates.map(date => {
        const perf = ampPerfData.find((p: any) => p.amp_id === ampId && p.date === date);
        return parseFloat(String(perf?.pnl || 0));
      });
    });

    // Calculate correlation matrix
    const n = ampIds.length;
    const correlationMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = this.calculatePearsonCorrelation(
            returnsMatrix[i],
            returnsMatrix[j]
          );
        }
      }
    }

    // Calculate average correlation (excluding diagonal)
    let sumCorr = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        sumCorr += Math.abs(correlationMatrix[i][j]);
        count++;
      }
    }
    const avgCorrelation = count > 0 ? sumCorr / count : 0;

    // Calculate diversification score (lower correlation = better diversification)
    const diversificationScore = Math.max(0, Math.min(100, (1 - avgCorrelation) * 100));

    return {
      amps: ampIds,
      matrix: correlationMatrix,
      averageCorrelation: avgCorrelation,
      diversificationScore,
    };
  }

  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom !== 0 ? numerator / denom : 0;
  }
}
