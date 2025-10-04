import { supabase } from '@/integrations/supabase/client';

export interface LayerMetrics {
  // Basic Performance
  totalReturn: number;
  annualizedReturn: number;
  totalPnL: number;
  
  // Risk-Adjusted Returns
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  informationRatio: number;
  
  // Risk Metrics
  maxDrawdown: number;
  maxDrawdownDuration: number; // days
  currentDrawdown: number;
  volatility: number;
  downsideVolatility: number;
  
  // Value at Risk
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalVaR95: number;
  conditionalVaR99: number;
  
  // Win/Loss Statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  
  // Streaks
  currentStreak: number; // positive = wins, negative = losses
  longestWinStreak: number;
  longestLossStreak: number;
  avgWinStreak: number;
  avgLossStreak: number;
  
  // Time-Based
  avgHoldingPeriod: number; // hours
  profitableMonths: number;
  totalMonths: number;
  monthlyWinRate: number;
  
  // Consistency
  ulcerIndex: number;
  stabilityOfReturns: number;
}

export class LayerMetricsEngine {
  /**
   * Calculate comprehensive metrics for a layer
   */
  static async calculateLayerMetrics(
    layerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LayerMetrics> {
    // Fetch performance data
    const { data: perfData, error } = await supabase
      .from('layer_performance')
      .select('*')
      .eq('layer_id', layerId)
      .order('date', { ascending: true });

    if (error) throw error;

    if (!perfData || perfData.length === 0) {
      return this.getEmptyMetrics();
    }

    // Calculate basic stats
    const returns = perfData.map(p => parseFloat(String(p.pnl_percentage || 0)) / 100);
    const pnls = perfData.map(p => parseFloat(String(p.pnl || 0)));
    const totalPnL = pnls.reduce((sum, p) => sum + p, 0);
    
    // Calculate win/loss stats
    const wins = perfData.filter(p => (p.pnl || 0) > 0);
    const losses = perfData.filter(p => (p.pnl || 0) < 0);
    const totalTrades = perfData.reduce((sum, p) => sum + (p.trades_count || 0), 0);
    const winningTrades = perfData.reduce((sum, p) => sum + (p.wins || 0), 0);
    const losingTrades = perfData.reduce((sum, p) => sum + (p.losses || 0), 0);

    const avgWin = wins.length > 0
      ? wins.reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0) / wins.length
      : 0;
    
    const avgLoss = losses.length > 0
      ? Math.abs(losses.reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0) / losses.length)
      : 0;

    // Calculate returns
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);
    const avgReturn = totalReturn / returns.length;
    const annualizedReturn = avgReturn * 252; // Trading days

    // Calculate volatility
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252);

    // Calculate downside volatility
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVariance = downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length
      : 0;
    const downsideVolatility = Math.sqrt(downsideVariance) * Math.sqrt(252);

    // Calculate Sharpe Ratio (assuming 0% risk-free rate)
    const sharpeRatio = volatility !== 0 ? annualizedReturn / volatility : 0;

    // Calculate Sortino Ratio
    const sortinoRatio = downsideVolatility !== 0 ? annualizedReturn / downsideVolatility : 0;

    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    let maxDrawdownDuration = 0;
    let currentDrawdownDuration = 0;

    let cumPnL = 0;
    perfData.forEach(p => {
      cumPnL += parseFloat(String(p.pnl || 0));
      
      if (cumPnL > peak) {
        peak = cumPnL;
        currentDrawdownDuration = 0;
      } else {
        currentDrawdownDuration++;
      }

      const drawdown = peak - cumPnL;
      currentDrawdown = drawdown;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownDuration = currentDrawdownDuration;
      }
    });

    // Calculate Calmar Ratio
    const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / maxDrawdown : 0;

    // Calculate VaR (Value at Risk)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var99Index = Math.floor(sortedReturns.length * 0.01);
    const valueAtRisk95 = sortedReturns[var95Index] || 0;
    const valueAtRisk99 = sortedReturns[var99Index] || 0;

    // Calculate CVaR (Conditional Value at Risk)
    const conditionalVaR95 = var95Index > 0
      ? sortedReturns.slice(0, var95Index).reduce((sum, r) => sum + r, 0) / var95Index
      : 0;
    
    const conditionalVaR99 = var99Index > 0
      ? sortedReturns.slice(0, var99Index).reduce((sum, r) => sum + r, 0) / var99Index
      : 0;

    // Calculate streaks
    const streaks = this.calculateStreaks(perfData);

    // Calculate Ulcer Index
    const ulcerIndex = this.calculateUlcerIndex(perfData);

    // Calculate profit factor
    const totalWins = wins.reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0);
    const totalLosses = Math.abs(losses.reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0));
    const profitFactor = totalLosses !== 0 ? totalWins / totalLosses : 0;

    // Calculate monthly stats
    const months = new Set(perfData.map(p => new Date(p.date).toISOString().substring(0, 7)));
    const profitableMonths = [...months].filter(month => {
      const monthPnL = perfData
        .filter(p => new Date(p.date).toISOString().startsWith(month))
        .reduce((sum, p) => sum + parseFloat(String(p.pnl || 0)), 0);
      return monthPnL > 0;
    }).length;

    return {
      totalReturn,
      annualizedReturn,
      totalPnL,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      informationRatio: sharpeRatio, // Simplified
      maxDrawdown,
      maxDrawdownDuration,
      currentDrawdown,
      volatility,
      downsideVolatility,
      valueAtRisk95,
      valueAtRisk99,
      conditionalVaR95,
      conditionalVaR99,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winningTrades / Math.max(totalTrades, 1),
      avgWin,
      avgLoss,
      profitFactor,
      currentStreak: streaks.current,
      longestWinStreak: streaks.longestWin,
      longestLossStreak: streaks.longestLoss,
      avgWinStreak: streaks.avgWin,
      avgLossStreak: streaks.avgLoss,
      avgHoldingPeriod: 24, // Placeholder
      profitableMonths,
      totalMonths: months.size,
      monthlyWinRate: profitableMonths / Math.max(months.size, 1),
      ulcerIndex,
      stabilityOfReturns: 1 / (volatility + 0.001), // Higher = more stable
    };
  }

  private static calculateStreaks(perfData: any[]): {
    current: number;
    longestWin: number;
    longestLoss: number;
    avgWin: number;
    avgLoss: number;
  } {
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let winStreaks: number[] = [];
    let lossStreaks: number[] = [];
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    perfData.forEach(p => {
      const pnl = parseFloat(String(p.pnl || 0));
      
      if (pnl > 0) {
        currentWinStreak++;
        if (currentLossStreak > 0) {
          lossStreaks.push(currentLossStreak);
          currentLossStreak = 0;
        }
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
        currentStreak = currentWinStreak;
      } else if (pnl < 0) {
        currentLossStreak++;
        if (currentWinStreak > 0) {
          winStreaks.push(currentWinStreak);
          currentWinStreak = 0;
        }
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
        currentStreak = -currentLossStreak;
      }
    });

    const avgWin = winStreaks.length > 0
      ? winStreaks.reduce((sum, s) => sum + s, 0) / winStreaks.length
      : 0;
    
    const avgLoss = lossStreaks.length > 0
      ? lossStreaks.reduce((sum, s) => sum + s, 0) / lossStreaks.length
      : 0;

    return {
      current: currentStreak,
      longestWin: longestWinStreak,
      longestLoss: longestLossStreak,
      avgWin,
      avgLoss,
    };
  }

  private static calculateUlcerIndex(perfData: any[]): number {
    let peak = 0;
    let squaredDrawdowns = 0;
    let cumPnL = 0;

    perfData.forEach(p => {
      cumPnL += parseFloat(String(p.pnl || 0));
      
      if (cumPnL > peak) {
        peak = cumPnL;
      }

      const drawdownPercent = peak > 0 ? ((peak - cumPnL) / peak) * 100 : 0;
      squaredDrawdowns += Math.pow(drawdownPercent, 2);
    });

    return Math.sqrt(squaredDrawdowns / perfData.length);
  }

  private static getEmptyMetrics(): LayerMetrics {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      totalPnL: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      informationRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      currentDrawdown: 0,
      volatility: 0,
      downsideVolatility: 0,
      valueAtRisk95: 0,
      valueAtRisk99: 0,
      conditionalVaR95: 0,
      conditionalVaR99: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      currentStreak: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      avgWinStreak: 0,
      avgLossStreak: 0,
      avgHoldingPeriod: 0,
      profitableMonths: 0,
      totalMonths: 0,
      monthlyWinRate: 0,
      ulcerIndex: 0,
      stabilityOfReturns: 0,
    };
  }
}
