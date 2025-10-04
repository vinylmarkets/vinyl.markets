/**
 * Performance Metrics Calculator
 * Enhanced metrics and risk analytics for backtesting
 */

import { BacktestResult, BacktestTrade } from './backtestEngine';

export interface EnhancedMetrics {
  // Risk-adjusted returns
  sortinoRatio: number;
  informationRatio: number;
  treynorRatio: number;

  // Win/Loss analysis
  largestWin: number;
  largestLoss: number;
  averageWinStreak: number;
  averageLossStreak: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;

  // Time-based metrics
  avgHoldingPeriod: number;
  profitableMonths: number;
  totalMonths: number;
  monthlyWinRate: number;

  // Advanced risk metrics
  valueAtRisk95: number;     // VaR at 95% confidence
  conditionalVaR95: number;  // CVaR (expected shortfall)
  ulcerIndex: number;        // Pain index

  // Consistency metrics
  stabilityOfReturn: number;
  consistencyScore: number;

  // Recovery metrics
  avgRecoveryTime: number;   // Days to recover from drawdown
  maxRecoveryTime: number;
}

export class PerformanceCalculator {
  /**
   * Calculate all enhanced metrics
   */
  static calculateEnhancedMetrics(result: BacktestResult): EnhancedMetrics {
    return {
      sortinoRatio: this.calculateSortinoRatio(result),
      informationRatio: this.calculateInformationRatio(result),
      treynorRatio: this.calculateTreynorRatio(result),
      largestWin: this.getLargestWin(result.trades),
      largestLoss: this.getLargestLoss(result.trades),
      averageWinStreak: this.getAverageWinStreak(result.trades),
      averageLossStreak: this.getAverageLossStreak(result.trades),
      currentStreak: this.getCurrentStreak(result.trades),
      longestWinStreak: this.getLongestWinStreak(result.trades),
      longestLossStreak: this.getLongestLossStreak(result.trades),
      avgHoldingPeriod: this.getAvgHoldingPeriod(result.trades),
      profitableMonths: this.getProfitableMonths(result),
      totalMonths: this.getTotalMonths(result),
      monthlyWinRate: this.getMonthlyWinRate(result),
      valueAtRisk95: this.calculateVaR(result, 0.95),
      conditionalVaR95: this.calculateCVaR(result, 0.95),
      ulcerIndex: this.calculateUlcerIndex(result),
      stabilityOfReturn: this.calculateStabilityOfReturn(result),
      consistencyScore: this.calculateConsistencyScore(result),
      avgRecoveryTime: this.getAvgRecoveryTime(result),
      maxRecoveryTime: this.getMaxRecoveryTime(result)
    };
  }

  /**
   * Sortino Ratio - like Sharpe but only penalizes downside volatility
   */
  private static calculateSortinoRatio(result: BacktestResult): number {
    const returns = this.getDailyReturns(result.equityCurve);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Only count negative returns for downside deviation
    const downsideReturns = returns.filter(r => r < 0);
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((sum, r) => sum + r * r, 0) / returns.length
    );

    return downsideDeviation > 0
      ? (avgReturn / downsideDeviation) * Math.sqrt(252)
      : 0;
  }

  /**
   * Information Ratio - excess return per unit of tracking error
   */
  private static calculateInformationRatio(result: BacktestResult): number {
    // Assume benchmark is 0% (can be enhanced to use SPY)
    const returns = this.getDailyReturns(result.equityCurve);
    const avgExcessReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    const trackingError = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgExcessReturn, 2), 0) / returns.length
    );

    return trackingError > 0
      ? (avgExcessReturn / trackingError) * Math.sqrt(252)
      : 0;
  }

  /**
   * Treynor Ratio - return per unit of systematic risk (beta)
   */
  private static calculateTreynorRatio(result: BacktestResult): number {
    // Simplified - assumes beta = 1
    // In production, would calculate beta vs SPY
    const totalReturn = result.totalReturn;
    const years = result.durationDays / 365;
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

    return annualizedReturn; // Simplified
  }

  /**
   * Win/Loss streak analysis
   */
  private static getAverageWinStreak(trades: BacktestTrade[]): number {
    const streaks = this.getWinStreaks(trades);
    return streaks.length > 0
      ? streaks.reduce((sum, s) => sum + s, 0) / streaks.length
      : 0;
  }

  private static getAverageLossStreak(trades: BacktestTrade[]): number {
    const streaks = this.getLossStreaks(trades);
    return streaks.length > 0
      ? streaks.reduce((sum, s) => sum + s, 0) / streaks.length
      : 0;
  }

  private static getLongestWinStreak(trades: BacktestTrade[]): number {
    const streaks = this.getWinStreaks(trades);
    return streaks.length > 0 ? Math.max(...streaks) : 0;
  }

  private static getLongestLossStreak(trades: BacktestTrade[]): number {
    const streaks = this.getLossStreaks(trades);
    return streaks.length > 0 ? Math.max(...streaks) : 0;
  }

  private static getCurrentStreak(trades: BacktestTrade[]): number {
    if (trades.length === 0) return 0;

    let streak = 0;
    const isWinning = trades[trades.length - 1].pnl > 0;

    for (let i = trades.length - 1; i >= 0; i--) {
      if ((trades[i].pnl > 0) === isWinning) {
        streak++;
      } else {
        break;
      }
    }

    return isWinning ? streak : -streak;
  }

  private static getWinStreaks(trades: BacktestTrade[]): number[] {
    const streaks: number[] = [];
    let currentStreak = 0;

    for (const trade of trades) {
      if (trade.pnl > 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
      }
    }

    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  private static getLossStreaks(trades: BacktestTrade[]): number[] {
    const streaks: number[] = [];
    let currentStreak = 0;

    for (const trade of trades) {
      if (trade.pnl < 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
      }
    }

    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  /**
   * Largest win/loss
   */
  private static getLargestWin(trades: BacktestTrade[]): number {
    return trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  }

  private static getLargestLoss(trades: BacktestTrade[]): number {
    return trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;
  }

  /**
   * Value at Risk (VaR) - maximum expected loss at given confidence level
   */
  private static calculateVaR(result: BacktestResult, confidence: number): number {
    const returns = this.getDailyReturns(result.equityCurve);
    returns.sort((a, b) => a - b);

    const index = Math.floor((1 - confidence) * returns.length);
    return returns[index] || 0;
  }

  /**
   * Conditional VaR (CVaR) - expected loss beyond VaR
   */
  private static calculateCVaR(result: BacktestResult, confidence: number): number {
    const returns = this.getDailyReturns(result.equityCurve);
    returns.sort((a, b) => a - b);

    const index = Math.floor((1 - confidence) * returns.length);
    const tailReturns = returns.slice(0, index);

    return tailReturns.length > 0
      ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length
      : 0;
  }

  /**
   * Ulcer Index - measure of downside volatility and pain
   */
  private static calculateUlcerIndex(result: BacktestResult): number {
    const drawdowns = result.drawdownCurve.map(d => d.drawdown);
    const squaredDrawdowns = drawdowns.map(d => d * d);
    const avgSquaredDrawdown = squaredDrawdowns.reduce((sum, d) => sum + d, 0) / drawdowns.length;

    return Math.sqrt(avgSquaredDrawdown);
  }

  /**
   * Monthly win rate
   */
  private static getMonthlyWinRate(result: BacktestResult): number {
    const monthlyReturns = this.getMonthlyReturns(result.equityCurve);
    const profitableMonths = monthlyReturns.filter(r => r > 0).length;

    return monthlyReturns.length > 0
      ? profitableMonths / monthlyReturns.length
      : 0;
  }

  private static getProfitableMonths(result: BacktestResult): number {
    return this.getMonthlyReturns(result.equityCurve).filter(r => r > 0).length;
  }

  private static getTotalMonths(result: BacktestResult): number {
    return this.getMonthlyReturns(result.equityCurve).length;
  }

  /**
   * Average holding period
   */
  private static getAvgHoldingPeriod(trades: BacktestTrade[]): number {
    return trades.length > 0
      ? trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / trades.length
      : 0;
  }

  /**
   * Stability of return - consistency of monthly returns
   */
  private static calculateStabilityOfReturn(result: BacktestResult): number {
    const monthlyReturns = this.getMonthlyReturns(result.equityCurve);
    const avgReturn = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;

    const variance = monthlyReturns.reduce((sum, r) =>
      sum + Math.pow(r - avgReturn, 2), 0
    ) / monthlyReturns.length;

    return avgReturn > 0 ? avgReturn / Math.sqrt(variance) : 0;
  }

  /**
   * Consistency score - percentage of positive months
   */
  private static calculateConsistencyScore(result: BacktestResult): number {
    return this.getMonthlyWinRate(result) * 100;
  }

  /**
   * Recovery time metrics
   */
  private static getAvgRecoveryTime(result: BacktestResult): number {
    const recoveryTimes = this.getRecoveryTimes(result);

    return recoveryTimes.length > 0
      ? recoveryTimes.reduce((sum, t) => sum + t, 0) / recoveryTimes.length
      : 0;
  }

  private static getMaxRecoveryTime(result: BacktestResult): number {
    const recoveryTimes = this.getRecoveryTimes(result);
    return recoveryTimes.length > 0 ? Math.max(...recoveryTimes) : 0;
  }

  private static getRecoveryTimes(result: BacktestResult): number[] {
    const recoveryTimes: number[] = [];
    let inDrawdown = false;
    let drawdownStart = 0;
    let highWaterMark = result.config.initialCapital;

    for (let i = 0; i < result.equityCurve.length; i++) {
      const point = result.equityCurve[i];

      if (point.value > highWaterMark) {
        if (inDrawdown) {
          recoveryTimes.push(i - drawdownStart);
          inDrawdown = false;
        }
        highWaterMark = point.value;
      } else if (point.value < highWaterMark && !inDrawdown) {
        inDrawdown = true;
        drawdownStart = i;
      }
    }

    return recoveryTimes;
  }

  /**
   * Helper: Get daily returns from equity curve
   */
  private static getDailyReturns(equityCurve: { date: Date; value: number }[]): number[] {
    const returns: number[] = [];

    for (let i = 1; i < equityCurve.length; i++) {
      const prevValue = equityCurve[i - 1].value;
      const currValue = equityCurve[i].value;
      returns.push((currValue - prevValue) / prevValue);
    }

    return returns;
  }

  /**
   * Helper: Get monthly returns
   */
  private static getMonthlyReturns(equityCurve: { date: Date; value: number }[]): number[] {
    const monthlyValues = new Map<string, number>();

    for (const point of equityCurve) {
      const monthKey = `${point.date.getFullYear()}-${point.date.getMonth()}`;
      monthlyValues.set(monthKey, point.value);
    }

    const values = Array.from(monthlyValues.values());
    const returns: number[] = [];

    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    return returns;
  }
}
