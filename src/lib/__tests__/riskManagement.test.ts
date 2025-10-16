import { describe, it, expect } from 'vitest';
import {
  validatePositionSize,
  calculateStops,
  updateTrailingStop,
  checkKillSwitches,
  calculatePositionSize,
  determineOptimalPositionSize,
  DEFAULT_RISK_LIMITS,
  type Position,
  type PortfolioStatus,
  type RiskLimits
} from '../riskManagement';
import type { AggregatedSignal } from '../signalAggregator';

describe('Risk Management - Issue #7 Full Implementation', () => {
  
  describe('Position Sizing - Base 2% Rule', () => {
    it('should use 2% base allocation for medium confidence signals', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.5,
        reasoning: { finalDecision: 'Buy based on confidence' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 2
      });

      const positionValue = quantity * 100;
      const allocationPct = positionValue / 10000;
      
      // 2% base * (0.5 + 0.5 confidence) = 2%
      expect(allocationPct).toBeGreaterThan(0.015);
      expect(allocationPct).toBeLessThan(0.025);
    });

    it('should scale up to 3% for high confidence signals', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 1.0,
        reasoning: { finalDecision: 'Strong buy signal' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 2
      });

      const positionValue = quantity * 100;
      const allocationPct = positionValue / 10000;
      
      // 2% base * (0.5 + 1.0 confidence) = 3%
      expect(allocationPct).toBeGreaterThan(0.025);
      expect(allocationPct).toBeLessThan(0.035);
    });

    it('should scale down to 1% for low confidence signals', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.0,
        reasoning: { finalDecision: 'Low confidence buy' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 2
      });

      const positionValue = quantity * 100;
      const allocationPct = positionValue / 10000;
      
      // 2% base * (0.5 + 0.0 confidence) = 1%
      expect(allocationPct).toBeGreaterThan(0.008);
      expect(allocationPct).toBeLessThan(0.012);
    });

    it('should adjust for volatility (reduce in high ATR)', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.7,
        reasoning: { finalDecision: 'Buy with volatility adjustment' }
      };

      // Low volatility case
      const lowVolQuantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 1 // 1% ATR
      });

      // High volatility case
      const highVolQuantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 10 // 10% ATR
      });

      // High volatility should result in smaller position
      expect(highVolQuantity).toBeLessThan(lowVolQuantity);
    });
  });

  describe('Stop Loss - 2 ATR Rule', () => {
    it('should set stop loss at 2 ATR below entry', () => {
      const entryPrice = 100;
      const atr = 5;
      
      const stops = calculateStops(entryPrice, atr, DEFAULT_RISK_LIMITS);
      
      expect(stops.stopLoss).toBe(90); // 100 - (2 * 5)
    });

    it('should calculate stop loss correctly for different ATR values', () => {
      const entryPrice = 50;
      const atr = 2;
      
      const stops = calculateStops(entryPrice, atr, DEFAULT_RISK_LIMITS);
      
      expect(stops.stopLoss).toBe(46); // 50 - (2 * 2)
    });

    it('should use stopLossMultiplier from risk limits', () => {
      const customLimits: RiskLimits = {
        ...DEFAULT_RISK_LIMITS,
        stopLossMultiplier: 3 // Custom 3 ATR stop
      };

      const stops = calculateStops(100, 5, customLimits);
      
      expect(stops.stopLoss).toBe(85); // 100 - (3 * 5)
    });
  });

  describe('Take Profit - 3 ATR Rule', () => {
    it('should set take profit at 3 ATR above entry', () => {
      const entryPrice = 100;
      const atr = 5;
      
      const stops = calculateStops(entryPrice, atr, DEFAULT_RISK_LIMITS);
      
      expect(stops.takeProfit).toBe(115); // 100 + (3 * 5)
    });

    it('should calculate take profit correctly for different ATR values', () => {
      const entryPrice = 50;
      const atr = 2;
      
      const stops = calculateStops(entryPrice, atr, DEFAULT_RISK_LIMITS);
      
      expect(stops.takeProfit).toBe(56); // 50 + (3 * 2)
    });

    it('should use takeProfitMultiplier from risk limits', () => {
      const customLimits: RiskLimits = {
        ...DEFAULT_RISK_LIMITS,
        takeProfitMultiplier: 4 // Custom 4 ATR target
      };

      const stops = calculateStops(100, 5, customLimits);
      
      expect(stops.takeProfit).toBe(120); // 100 + (4 * 5)
    });
  });

  describe('Max 5 Positions Limit', () => {
    it('should reject new position when 5 positions already exist', () => {
      const currentPositions: Position[] = [
        { symbol: 'AAPL', quantity: 10, entryPrice: 100, currentPrice: 105 },
        { symbol: 'MSFT', quantity: 10, entryPrice: 200, currentPrice: 210 },
        { symbol: 'GOOGL', quantity: 5, entryPrice: 150, currentPrice: 155 },
        { symbol: 'AMZN', quantity: 8, entryPrice: 120, currentPrice: 125 },
        { symbol: 'TSLA', quantity: 12, entryPrice: 180, currentPrice: 185 }
      ];

      const result = validatePositionSize(
        10,
        100,
        10000,
        currentPositions,
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(false);
      expect(result.reason).toContain('maximum number of positions');
    });

    it('should allow new position when less than 5 positions exist', () => {
      const currentPositions: Position[] = [
        { symbol: 'AAPL', quantity: 10, entryPrice: 100, currentPrice: 105 },
        { symbol: 'MSFT', quantity: 10, entryPrice: 200, currentPrice: 210 }
      ];

      const result = validatePositionSize(
        10,
        100,
        10000,
        currentPositions,
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(true);
    });
  });

  describe('Max 20% Per Position Limit', () => {
    it('should reject position exceeding 20% of capital', () => {
      const proposedQuantity = 50; // 50 * 100 = $5000 = 50% of $10k
      const price = 100;
      const totalCapital = 10000;

      const result = validatePositionSize(
        proposedQuantity,
        price,
        totalCapital,
        [],
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(false);
      expect(result.adjustedQuantity).toBe(20); // 20% = $2000 / $100 = 20 shares
    });

    it('should adjust oversized position down to 20%', () => {
      const result = validatePositionSize(
        100, // Wants $10k position
        100,
        10000,
        [],
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(false);
      expect(result.adjustedQuantity).toBe(20);
      expect(result.reason).toContain('Adjusted to maximum');
    });

    it('should allow position at exactly 20%', () => {
      const result = validatePositionSize(
        20, // 20 * 100 = $2000 = 20%
        100,
        10000,
        [],
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(true);
    });
  });

  describe('Max 60% Total Exposure Limit', () => {
    it('should reject position that would exceed 60% total exposure', () => {
      const currentPositions: Position[] = [
        { symbol: 'AAPL', quantity: 15, entryPrice: 100, currentPrice: 105 }, // $1575
        { symbol: 'MSFT', quantity: 15, entryPrice: 200, currentPrice: 210 }, // $3150
      ];
      // Current exposure: $4725 = 47.25%
      // Proposed: 15 * 100 = $1500 = 15%
      // Total would be: 62.25% > 60%

      const result = validatePositionSize(
        15,
        100,
        10000,
        currentPositions,
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(false);
      expect(result.reason).toContain('total exposure limit');
    });

    it('should adjust position to stay within 60% exposure', () => {
      const currentPositions: Position[] = [
        { symbol: 'AAPL', quantity: 20, entryPrice: 100, currentPrice: 100 }, // $2000
        { symbol: 'MSFT', quantity: 15, entryPrice: 200, currentPrice: 200 }, // $3000
      ];
      // Current: $5000 = 50%
      // Available: 60% - 50% = 10% = $1000

      const result = validatePositionSize(
        20, // Wants $2000
        100,
        10000,
        currentPositions,
        DEFAULT_RISK_LIMITS
      );

      expect(result.approved).toBe(false);
      expect(result.adjustedQuantity).toBe(10); // $1000 / $100
    });
  });

  describe('Max 3% Daily Loss Limit', () => {
    it('should trigger pause when daily loss exceeds 3%', () => {
      const portfolioStatus: PortfolioStatus = {
        totalValue: 9700, // Started at 10000
        dailyPnL: -300, // -3% daily loss
        dailyPnLPercent: -0.03,
        currentDrawdown: 0.03,
        highWaterMark: 10000
      };

      const result = checkKillSwitches(portfolioStatus, DEFAULT_RISK_LIMITS);

      expect(result.triggered).toBe(true);
      expect(result.action).toBe('pause');
      expect(result.reason).toContain('Daily loss limit');
    });

    it('should not trigger when daily loss is below 3%', () => {
      const portfolioStatus: PortfolioStatus = {
        totalValue: 9750,
        dailyPnL: -250, // -2.5% daily loss
        dailyPnLPercent: -0.025,
        currentDrawdown: 0.025,
        highWaterMark: 10000
      };

      const result = checkKillSwitches(portfolioStatus, DEFAULT_RISK_LIMITS);

      expect(result.triggered).toBe(false);
    });
  });

  describe('Max 15% Drawdown Kill Switch', () => {
    it('should trigger liquidation when drawdown exceeds 15%', () => {
      const portfolioStatus: PortfolioStatus = {
        totalValue: 8400, // Down 16% from high
        dailyPnL: -100,
        dailyPnLPercent: -0.01,
        currentDrawdown: 0.16,
        highWaterMark: 10000
      };

      const result = checkKillSwitches(portfolioStatus, DEFAULT_RISK_LIMITS);

      expect(result.triggered).toBe(true);
      expect(result.action).toBe('liquidate');
      expect(result.reason).toContain('Maximum drawdown');
    });

    it('should not trigger when drawdown is below 15%', () => {
      const portfolioStatus: PortfolioStatus = {
        totalValue: 8600, // Down 14% from high
        dailyPnL: -50,
        dailyPnLPercent: -0.005,
        currentDrawdown: 0.14,
        highWaterMark: 10000
      };

      const result = checkKillSwitches(portfolioStatus, DEFAULT_RISK_LIMITS);

      expect(result.triggered).toBe(false);
    });
  });

  describe('Trailing Stops', () => {
    it('should update trailing stop when price moves up', () => {
      const currentPrice = 110;
      const highestPrice = 110;
      const currentStopLoss = 90;
      const customLimits: RiskLimits = {
        ...DEFAULT_RISK_LIMITS,
        trailingStopEnabled: true,
        trailingStopDistance: 0.10 // 10% trailing stop
      };

      const newStop = updateTrailingStop(
        currentPrice,
        highestPrice,
        currentStopLoss,
        customLimits
      );

      // 10% below $110 = $99
      expect(newStop).toBe(99);
      expect(newStop).toBeGreaterThan(currentStopLoss);
    });

    it('should not lower trailing stop when price drops', () => {
      const currentPrice = 105; // Price dropped
      const highestPrice = 110; // Previous high
      const currentStopLoss = 99; // Current stop
      const customLimits: RiskLimits = {
        ...DEFAULT_RISK_LIMITS,
        trailingStopEnabled: true,
        trailingStopDistance: 0.10
      };

      const newStop = updateTrailingStop(
        currentPrice,
        highestPrice,
        currentStopLoss,
        customLimits
      );

      // Stop should remain at $99, not drop
      expect(newStop).toBe(99);
    });

    it('should not update when trailing stop is disabled', () => {
      const customLimits: RiskLimits = {
        ...DEFAULT_RISK_LIMITS,
        trailingStopEnabled: false
      };

      const newStop = updateTrailingStop(
        110,
        110,
        90,
        customLimits
      );

      // Should return original stop unchanged
      expect(newStop).toBe(90);
    });
  });

  describe('Integration Tests', () => {
    it('should properly size position with all constraints', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.8,
        reasoning: { finalDecision: 'Strong buy with constraints' }
      };

      const currentPositions: Position[] = [
        { symbol: 'AAPL', quantity: 10, entryPrice: 150, currentPrice: 155 }
      ];

      // Calculate optimal size
      const quantity = determineOptimalPositionSize(
        signal,
        10000,
        100,
        5,
        { winRate: 0.6, avgWin: 50, avgLoss: 30 }
      );

      // Validate against limits
      const validation = validatePositionSize(
        quantity,
        100,
        10000,
        currentPositions,
        DEFAULT_RISK_LIMITS
      );

      expect(validation.approved).toBe(true);
      expect(quantity * 100).toBeLessThanOrEqual(2000); // <= 20% of capital
    });

    it('should calculate stops based on ATR', () => {
      const entryPrice = 100;
      const atr = 4;

      const stops = calculateStops(entryPrice, atr, DEFAULT_RISK_LIMITS);

      expect(stops.stopLoss).toBe(92); // 100 - (2 * 4)
      expect(stops.takeProfit).toBe(112); // 100 + (3 * 4)
    });

    it('should handle complete trade lifecycle', () => {
      // 1. Size position
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.7,
        reasoning: { finalDecision: 'Complete trade lifecycle test' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 100,
        signal,
        atr: 3
      });

      // 2. Validate
      const validation = validatePositionSize(quantity, 100, 10000, [], DEFAULT_RISK_LIMITS);
      expect(validation.approved).toBe(true);

      // 3. Set stops
      const stops = calculateStops(100, 3, DEFAULT_RISK_LIMITS);
      expect(stops.stopLoss).toBe(94);
      expect(stops.takeProfit).toBe(109);

      // 4. Check trailing stop at profit
      const newStop = updateTrailingStop(
        108,
        108,
        stops.stopLoss,
        { ...DEFAULT_RISK_LIMITS, trailingStopEnabled: true, trailingStopDistance: 0.08 }
      );
      expect(newStop).toBeGreaterThan(stops.stopLoss);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero capital gracefully', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'TEST',
        quantity: 0,
        confidence: 0.5,
        reasoning: { finalDecision: 'Zero capital test' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 0,
        currentPrice: 100,
        signal,
        atr: 2
      });

      expect(quantity).toBe(0);
    });

    it('should handle very high price stocks', () => {
      const signal: AggregatedSignal = {
        action: 'buy',
        symbol: 'BRK.A',
        quantity: 0,
        confidence: 0.7,
        reasoning: { finalDecision: 'High price stock test' }
      };

      const quantity = calculatePositionSize('confidence', {
        totalCapital: 10000,
        currentPrice: 500000, // Expensive stock
        signal,
        atr: 5000
      });

      expect(quantity).toBe(0); // Can't afford even 1 share at 20% limit
    });

    it('should handle penny stocks', () => {
      const validation = validatePositionSize(
        10000, // Many shares
        0.50, // $0.50 per share
        10000,
        [],
        DEFAULT_RISK_LIMITS
      );

      // 10000 shares * $0.50 = $5000 = 50% > 20%
      expect(validation.approved).toBe(false);
      expect(validation.adjustedQuantity).toBe(4000); // 20% = $2000 / $0.50
    });

    it('should handle negative ATR input', () => {
      const stops = calculateStops(100, -5, DEFAULT_RISK_LIMITS);
      
      // Should use absolute value or minimum
      expect(stops.stopLoss).toBeLessThan(100);
      expect(stops.takeProfit).toBeGreaterThan(100);
    });
  });
});
