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

export interface AggregateMetrics {
  totalReturn: number;
  totalReturnPct: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdown: number;
  currentDrawdown: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  activeDays: number;
  return7d: number;
  return30d: number;
  return90d: number;
}

export interface EquityPoint {
  date: Date;
  value: number;
}

export interface DrawdownPoint {
  date: Date;
  drawdown: number;
}

/**
 * Calculate Sharpe Ratio (annualized, risk-adjusted return)
 * Formula: (Average Daily Return - Risk Free Rate) / Std Dev * sqrt(252)
 */
export function calculateSharpeRatio(
  dailyReturns: number[],
  riskFreeRate: number = 0.02
): number {
  if (dailyReturns.length < 2) return 0;

  const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const dailyRiskFreeRate = riskFreeRate / 252;

  const variance =
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    dailyReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return ((avgReturn - dailyRiskFreeRate) / stdDev) * Math.sqrt(252);
}

/**
 * Calculate maximum drawdown from equity curve
 */
export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown * 100;
}

/**
 * Calculate current drawdown from equity curve
 */
export function calculateCurrentDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;

  const peak = Math.max(...equityCurve);
  const current = equityCurve[equityCurve.length - 1];

  return ((peak - current) / peak) * 100;
}

/**
 * Calculate profit factor (gross wins / abs(gross losses))
 */
export function calculateProfitFactor(
  totalWins: number,
  totalLosses: number
): number {
  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  return totalWins / Math.abs(totalLosses);
}

/**
 * Generate equity curve from performance snapshots
 */
export function generateEquityCurve(
  snapshots: AmpPerformanceSnapshot[],
  initialCapital: number = 0
): EquityPoint[] {
  return snapshots.map((snapshot) => ({
    date: new Date(snapshot.date),
    value: initialCapital + snapshot.cumulative_pnl,
  }));
}

/**
 * Generate drawdown curve from performance snapshots
 */
export function generateDrawdownCurve(
  snapshots: AmpPerformanceSnapshot[]
): DrawdownPoint[] {
  return snapshots.map((snapshot) => ({
    date: new Date(snapshot.date),
    drawdown: snapshot.current_drawdown,
  }));
}

/**
 * Calculate aggregate performance metrics from snapshots
 */
export function calculateAggregateMetrics(
  snapshots: AmpPerformanceSnapshot[],
  initialCapital: number = 10000
): AggregateMetrics {
  if (snapshots.length === 0) {
    return {
      totalReturn: 0,
      totalReturnPct: 0,
      sharpeRatio: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      activeDays: 0,
      return7d: 0,
      return30d: 0,
      return90d: 0,
    };
  }

  const latestSnapshot = snapshots[snapshots.length - 1];
  const totalReturn = latestSnapshot.cumulative_pnl;
  const totalReturnPct = (totalReturn / initialCapital) * 100;

  // Calculate daily returns for Sharpe ratio
  const dailyReturns: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const prevValue = initialCapital + snapshots[i - 1].cumulative_pnl;
    const currValue = initialCapital + snapshots[i].cumulative_pnl;
    const dailyReturn = (currValue - prevValue) / prevValue;
    dailyReturns.push(dailyReturn);
  }

  const sharpeRatio = calculateSharpeRatio(dailyReturns);

  // Calculate gross wins and losses for profit factor
  let grossWins = 0;
  let grossLosses = 0;
  snapshots.forEach((snapshot) => {
    if (snapshot.avg_win > 0) {
      grossWins += snapshot.winning_trades * snapshot.avg_win;
    }
    if (snapshot.avg_loss < 0) {
      grossLosses += snapshot.losing_trades * snapshot.avg_loss;
    }
  });

  const profitFactor = calculateProfitFactor(grossWins, grossLosses);

  // Calculate period returns
  const return7d = calculatePeriodReturn(snapshots, 7, initialCapital);
  const return30d = calculatePeriodReturn(snapshots, 30, initialCapital);
  const return90d = calculatePeriodReturn(snapshots, 90, initialCapital);

  return {
    totalReturn,
    totalReturnPct,
    sharpeRatio,
    winRate: latestSnapshot.win_rate,
    totalTrades: latestSnapshot.cumulative_trades,
    winningTrades: latestSnapshot.cumulative_wins,
    losingTrades: latestSnapshot.cumulative_losses,
    maxDrawdown: latestSnapshot.max_drawdown,
    currentDrawdown: latestSnapshot.current_drawdown,
    profitFactor,
    avgWin: latestSnapshot.avg_win,
    avgLoss: latestSnapshot.avg_loss,
    largestWin: latestSnapshot.largest_win,
    largestLoss: latestSnapshot.largest_loss,
    activeDays: snapshots.length,
    return7d,
    return30d,
    return90d,
  };
}

/**
 * Calculate return over a specific period (days)
 */
function calculatePeriodReturn(
  snapshots: AmpPerformanceSnapshot[],
  days: number,
  initialCapital: number
): number {
  if (snapshots.length === 0) return 0;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);

  let startSnapshot = snapshots[0];
  for (const snapshot of snapshots) {
    if (new Date(snapshot.date) >= targetDate) {
      break;
    }
    startSnapshot = snapshot;
  }

  const endSnapshot = snapshots[snapshots.length - 1];
  const startValue = initialCapital + startSnapshot.cumulative_pnl;
  const endValue = initialCapital + endSnapshot.cumulative_pnl;

  return ((endValue - startValue) / startValue) * 100;
}
