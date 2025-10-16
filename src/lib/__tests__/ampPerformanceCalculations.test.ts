import { describe, it, expect } from 'vitest';
import {
  calculateSharpeRatio,
  calculateMaxDrawdown,
  calculateCurrentDrawdown,
  calculateProfitFactor,
  generateEquityCurve,
  generateDrawdownCurve,
  calculateAggregateMetrics,
} from '../ampPerformanceCalculations';

describe('ampPerformanceCalculations', () => {
  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio correctly', () => {
      const dailyReturns = [0.01, 0.02, -0.01, 0.015, 0.005];
      const sharpe = calculateSharpeRatio(dailyReturns);
      expect(sharpe).toBeGreaterThan(0);
      expect(sharpe).toBeLessThan(10);
    });

    it('should return 0 for insufficient data', () => {
      expect(calculateSharpeRatio([])).toBe(0);
      expect(calculateSharpeRatio([0.01])).toBe(0);
    });

    it('should return 0 for zero volatility', () => {
      const dailyReturns = [0.01, 0.01, 0.01, 0.01];
      expect(calculateSharpeRatio(dailyReturns)).toBe(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should calculate max drawdown correctly', () => {
      const equityCurve = [10000, 10500, 10200, 9800, 10100, 10400];
      const maxDD = calculateMaxDrawdown(equityCurve);
      expect(maxDD).toBeCloseTo(6.67, 1);
    });

    it('should return 0 for empty curve', () => {
      expect(calculateMaxDrawdown([])).toBe(0);
    });

    it('should return 0 for always increasing curve', () => {
      const equityCurve = [10000, 10500, 11000, 11500];
      expect(calculateMaxDrawdown(equityCurve)).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateMaxDrawdown([10000])).toBe(0);
    });
  });

  describe('calculateCurrentDrawdown', () => {
    it('should calculate current drawdown correctly', () => {
      const equityCurve = [10000, 10500, 10200, 9800];
      const currentDD = calculateCurrentDrawdown(equityCurve);
      expect(currentDD).toBeCloseTo(6.67, 1);
    });

    it('should return 0 for empty curve', () => {
      expect(calculateCurrentDrawdown([])).toBe(0);
    });

    it('should return 0 when at peak', () => {
      const equityCurve = [10000, 10500, 11000];
      expect(calculateCurrentDrawdown(equityCurve)).toBe(0);
    });
  });

  describe('calculateProfitFactor', () => {
    it('should calculate profit factor correctly', () => {
      const pf = calculateProfitFactor(5000, -2000);
      expect(pf).toBe(2.5);
    });

    it('should return Infinity when no losses', () => {
      expect(calculateProfitFactor(5000, 0)).toBe(Infinity);
    });

    it('should return 0 when no wins', () => {
      expect(calculateProfitFactor(0, -2000)).toBe(0);
    });

    it('should handle both zero', () => {
      expect(calculateProfitFactor(0, 0)).toBe(0);
    });
  });

  describe('generateEquityCurve', () => {
    it('should generate equity curve correctly', () => {
      const snapshots = [
        { date: '2024-01-01', cumulative_pnl: 100 } as any,
        { date: '2024-01-02', cumulative_pnl: 250 } as any,
        { date: '2024-01-03', cumulative_pnl: 180 } as any,
      ];

      const curve = generateEquityCurve(snapshots, 10000);
      expect(curve).toHaveLength(3);
      expect(curve[0].value).toBe(10100);
      expect(curve[1].value).toBe(10250);
      expect(curve[2].value).toBe(10180);
    });

    it('should handle empty snapshots', () => {
      const curve = generateEquityCurve([]);
      expect(curve).toHaveLength(0);
    });
  });

  describe('generateDrawdownCurve', () => {
    it('should generate drawdown curve correctly', () => {
      const snapshots = [
        { date: '2024-01-01', current_drawdown: 0 } as any,
        { date: '2024-01-02', current_drawdown: 2.5 } as any,
        { date: '2024-01-03', current_drawdown: 5.0 } as any,
      ];

      const curve = generateDrawdownCurve(snapshots);
      expect(curve).toHaveLength(3);
      expect(curve[0].drawdown).toBe(0);
      expect(curve[1].drawdown).toBe(2.5);
      expect(curve[2].drawdown).toBe(5.0);
    });
  });

  describe('calculateAggregateMetrics', () => {
    it('should calculate all metrics correctly', () => {
      const snapshots = [
        {
          date: '2024-01-01',
          trades_executed: 5,
          winning_trades: 3,
          losing_trades: 2,
          cumulative_pnl: 500,
          win_rate: 60,
          avg_win: 200,
          avg_loss: -100,
          largest_win: 300,
          largest_loss: -150,
          max_drawdown: 5,
          current_drawdown: 2,
          cumulative_trades: 5,
          cumulative_wins: 3,
          cumulative_losses: 2,
        } as any,
        {
          date: '2024-01-02',
          trades_executed: 3,
          winning_trades: 2,
          losing_trades: 1,
          cumulative_pnl: 800,
          win_rate: 62.5,
          avg_win: 210,
          avg_loss: -110,
          largest_win: 320,
          largest_loss: -150,
          max_drawdown: 5,
          current_drawdown: 0,
          cumulative_trades: 8,
          cumulative_wins: 5,
          cumulative_losses: 3,
        } as any,
      ];

      const metrics = calculateAggregateMetrics(snapshots, 10000);

      expect(metrics.totalReturn).toBe(800);
      expect(metrics.totalReturnPct).toBe(8);
      expect(metrics.totalTrades).toBe(8);
      expect(metrics.winningTrades).toBe(5);
      expect(metrics.losingTrades).toBe(3);
      expect(metrics.winRate).toBe(62.5);
      expect(metrics.maxDrawdown).toBe(5);
      expect(metrics.currentDrawdown).toBe(0);
      expect(metrics.activeDays).toBe(2);
    });

    it('should return zero metrics for empty snapshots', () => {
      const metrics = calculateAggregateMetrics([]);
      expect(metrics.totalReturn).toBe(0);
      expect(metrics.totalReturnPct).toBe(0);
      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.totalTrades).toBe(0);
    });
  });
});
