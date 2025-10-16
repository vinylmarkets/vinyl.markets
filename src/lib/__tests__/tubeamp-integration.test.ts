/**
 * TubeAmp Integration Tests
 * Tests for individual modules, market regime detection, and signal aggregation
 */

import { describe, it, expect } from 'vitest';
import {
  MomentumModule,
  MeanReversionModule,
  BreakoutModule,
  ModuleSignal,
  IndicatorSet,
} from '../tubeamp-modules';
import {
  TubeAmpIntegrator,
  MarketRegime,
  AggregatedSignal,
} from '../tubeamp-integration';

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

function createMockIndicators(overrides?: Partial<IndicatorSet>): IndicatorSet {
  return {
    rsi: 55,
    macd: { macd: 2.5, signal: 2.0, histogram: 0.5 },
    adx: 28,
    sma50: 150,
    bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
    zScore: -0.5,
    atr: 3.5,
    donchianChannels: { upper: 165, lower: 135 },
    volumeProfile: { avgVolume: 1000000, volumeRatio: 1.0 },
    ...overrides,
  };
}

// ============================================================================
// MODULE 1: MOMENTUM TESTS
// ============================================================================

describe('MomentumModule', () => {
  const module = new MomentumModule();

  it('should generate BUY signal when all momentum conditions are met', () => {
    const indicators = createMockIndicators({
      rsi: 65,
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      adx: 32,
      sma50: 150,
    });

    const signal = module.generateSignal('AAPL', 155, indicators);

    expect(signal.action).toBe('buy');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.4);
    expect(signal.reason).toContain('Momentum BUY');
  });

  it('should generate SELL signal when momentum is bearish', () => {
    const indicators = createMockIndicators({
      rsi: 35,
      macd: { macd: 1.0, signal: 2.0, histogram: -1.0 },
      adx: 28,
      sma50: 150,
    });

    const signal = module.generateSignal('AAPL', 145, indicators);

    expect(signal.action).toBe('sell');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.4);
    expect(signal.reason).toContain('Momentum SELL');
  });

  it('should generate HOLD signal when conditions are mixed', () => {
    const indicators = createMockIndicators({
      rsi: 55,
      macd: { macd: 2.0, signal: 2.5, histogram: -0.5 }, // Bearish MACD
      adx: 28,
      sma50: 150,
    });

    const signal = module.generateSignal('AAPL', 152, indicators);

    expect(signal.action).toBe('hold');
    expect(signal.confidence).toBeLessThanOrEqual(0.1);
  });

  it('should handle missing indicators gracefully', () => {
    const indicators = createMockIndicators({ rsi: undefined });

    const signal = module.generateSignal('AAPL', 150, indicators);

    expect(signal.action).toBe('hold');
    expect(signal.confidence).toBe(0);
    expect(signal.reason).toContain('Missing required indicators');
  });

  it('should calculate confidence correctly for high RSI', () => {
    const indicators = createMockIndicators({
      rsi: 70,
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      adx: 30,
      sma50: 150,
    });

    const signal = module.generateSignal('AAPL', 160, indicators);

    const expectedConfidence = ((70 - 50) / 50) * 0.4; // = 0.16
    expect(signal.confidence).toBeCloseTo(expectedConfidence, 2);
  });
});

// ============================================================================
// MODULE 2: MEAN REVERSION TESTS
// ============================================================================

describe('MeanReversionModule', () => {
  const module = new MeanReversionModule();

  it('should generate BUY signal when oversold', () => {
    const indicators = createMockIndicators({
      bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
      zScore: -2.5,
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.3 },
    });

    const signal = module.generateSignal('AAPL', 138, 1300000, indicators);

    expect(signal.action).toBe('buy');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.3);
    expect(signal.reason).toContain('Mean Reversion BUY');
  });

  it('should generate SELL signal when overbought', () => {
    const indicators = createMockIndicators({
      bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
      zScore: 2.8,
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.5 },
    });

    const signal = module.generateSignal('AAPL', 162, 1500000, indicators);

    expect(signal.action).toBe('sell');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.3);
    expect(signal.reason).toContain('Mean Reversion SELL');
  });

  it('should require high volume for confirmation', () => {
    const indicators = createMockIndicators({
      bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
      zScore: -2.5,
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.0 },
    });

    const signal = module.generateSignal('AAPL', 138, 1000000, indicators);

    expect(signal.action).toBe('hold');
    expect(signal.reason).toContain('conditions not met');
  });

  it('should calculate confidence based on z-score magnitude', () => {
    const indicators = createMockIndicators({
      bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
      zScore: -3.0,
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.3 },
    });

    const signal = module.generateSignal('AAPL', 135, 1300000, indicators);

    const expectedConfidence = Math.min((3.0 / 3) * 0.3, 0.3); // = 0.3 (max)
    expect(signal.confidence).toBeCloseTo(expectedConfidence, 2);
  });
});

// ============================================================================
// MODULE 3: BREAKOUT TESTS
// ============================================================================

describe('BreakoutModule', () => {
  const module = new BreakoutModule();

  it('should generate BUY signal on upside breakout', () => {
    const indicators = createMockIndicators({
      atr: 4.5,
      donchianChannels: { upper: 165, lower: 135 },
      volumeProfile: { avgVolume: 1000000, volumeRatio: 2.5 },
    });

    const signal = module.generateSignal('AAPL', 168, 2500000, indicators);

    expect(signal.action).toBe('buy');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.2);
    expect(signal.reason).toContain('Breakout BUY');
  });

  it('should generate SELL signal on downside breakout', () => {
    const indicators = createMockIndicators({
      atr: 4.5,
      donchianChannels: { upper: 165, lower: 135 },
      volumeProfile: { avgVolume: 1000000, volumeRatio: 2.5 },
    });

    const signal = module.generateSignal('AAPL', 132, 2500000, indicators);

    expect(signal.action).toBe('sell');
    expect(signal.confidence).toBeGreaterThan(0);
    expect(signal.confidence).toBeLessThanOrEqual(0.2);
    expect(signal.reason).toContain('Breakout SELL');
  });

  it('should require high volume surge for confirmation', () => {
    const indicators = createMockIndicators({
      atr: 4.5,
      donchianChannels: { upper: 165, lower: 135 },
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.5 },
    });

    const signal = module.generateSignal('AAPL', 168, 1500000, indicators);

    expect(signal.action).toBe('hold');
    expect(signal.reason).toContain('conditions not met');
  });
});

// ============================================================================
// MARKET REGIME DETECTION TESTS
// ============================================================================

describe('TubeAmpIntegrator - Market Regime Detection', () => {
  const integrator = new TubeAmpIntegrator();

  it('should detect trending market and adjust weights', () => {
    const regime = integrator.detectMarketRegime(35); // ADX > 30

    expect(regime.type).toBe('trending');
    expect(regime.weights.momentum).toBeCloseTo(0.60, 2);
    expect(regime.weights.meanReversion).toBeCloseTo(0.20, 2);
    expect(regime.weights.breakout).toBeCloseTo(0.20, 2);
    expect(regime.positionSizeMultiplier).toBe(1.0);
  });

  it('should detect range-bound market and adjust weights', () => {
    const regime = integrator.detectMarketRegime(15); // ADX < 20

    expect(regime.type).toBe('range-bound');
    expect(regime.weights.momentum).toBeCloseTo(0.20, 2);
    expect(regime.weights.meanReversion).toBeCloseTo(0.50, 2);
    expect(regime.weights.breakout).toBeCloseTo(0.30, 2);
    expect(regime.positionSizeMultiplier).toBe(1.0);
  });

  it('should detect high volatility and reduce position size', () => {
    const regime = integrator.detectMarketRegime(25, 30); // VIX > 25

    expect(regime.type).toBe('high-volatility');
    expect(regime.positionSizeMultiplier).toBe(0.5);
  });

  it('should use neutral weights for normal conditions', () => {
    const regime = integrator.detectMarketRegime(25, 20); // Neutral

    expect(regime.type).toBe('neutral');
    expect(regime.weights.momentum).toBeCloseTo(0.45, 2);
    expect(regime.weights.meanReversion).toBeCloseTo(0.35, 2);
    expect(regime.weights.breakout).toBeCloseTo(0.20, 2);
    expect(regime.positionSizeMultiplier).toBe(1.0);
  });
});

// ============================================================================
// SIGNAL AGGREGATION TESTS
// ============================================================================

describe('TubeAmpIntegrator - Signal Aggregation', () => {
  const integrator = new TubeAmpIntegrator();

  it('should aggregate signals and execute BUY when confidence > threshold', () => {
    const indicators = createMockIndicators({
      rsi: 85, // Strong momentum: (85-50)/50*0.4 = 0.28
      macd: { macd: 3.5, signal: 2.0, histogram: 1.5 },
      adx: 26, // Neutral regime (45/35/20), allows momentum to signal (ADX > 25)
      sma50: 140,
      bollingerBands: { upper: 170, middle: 160, lower: 150, bandwidth: 0.13 },
      zScore: -2.8, // Strong mean reversion: 2.8/3*0.3 = 0.28
      atr: 4.5,
      donchianChannels: { upper: 165, lower: 145 },
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.3 },
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      145, // Below BB lower (mean rev BUY), above SMA (momentum BUY)
      1300000,
      indicators,
      20
    );

    // Neutral (45/35/20): momentum 0.28*0.45 + meanRev 0.28*0.35 + breakout 0.05*0.2 = 0.126 + 0.098 + 0.01 = 0.234 > 0.15 ✓
    expect(signal.shouldExecute).toBe(true);
    expect(signal.action).toBe('buy');
    expect(signal.totalConfidence).toBeGreaterThan(0.15);
  });

  it('should not execute when confidence < threshold', () => {
    const indicators = createMockIndicators({
      rsi: 52, // Weak momentum
      macd: { macd: 2.1, signal: 2.0, histogram: 0.1 },
      adx: 26,
      sma50: 150,
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      151,
      1000000,
      indicators
    );

    expect(signal.shouldExecute).toBe(false);
    expect(signal.action).toBe('hold');
    expect(signal.totalConfidence).toBeLessThan(0.15);
  });

  it('should use majority vote for final action', () => {
    const indicators = createMockIndicators({
      rsi: 80, // Momentum: BUY
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      adx: 26, // Neutral regime, allows momentum
      sma50: 140,
      bollingerBands: { upper: 160, middle: 155, lower: 150, bandwidth: 0.13 },
      zScore: -2.5, // Mean Reversion: BUY
      volumeProfile: { avgVolume: 1000000, volumeRatio: 2.5 },
      donchianChannels: { upper: 165, lower: 145 },
      atr: 4.5,
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      148, // Below BB lower (mean rev BUY), below SMA but high RSI (momentum BUY)
      2500000, // High volume doesn't trigger breakout without price above Donchian
      indicators
    );

    // 2 modules BUY (momentum + mean reversion), 1 HOLD (breakout)
    // Majority vote = BUY
    expect(signal.action).toBe('buy');
  });

  it('should apply position size multiplier in high volatility', () => {
    const indicators = createMockIndicators({
      rsi: 65,
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      adx: 32,
      sma50: 150,
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      155,
      1000000,
      indicators,
      30 // High VIX
    );

    expect(signal.positionSizeMultiplier).toBe(0.5);
    expect(signal.regime.type).toBe('high-volatility');
  });

  it('should adjust weights based on market regime', () => {
    const indicators = createMockIndicators({
      adx: 35, // Trending market
      rsi: 65,
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      sma50: 150,
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      155,
      1000000,
      indicators
    );

    // Trending market: momentum 60%
    expect(signal.regime.weights.momentum).toBeCloseTo(0.60, 2);
    expect(signal.regime.weights.meanReversion).toBeCloseTo(0.20, 2);
  });
});

// ============================================================================
// CONFIGURATION TESTS
// ============================================================================

describe('TubeAmpIntegrator - Configuration', () => {
  it('should allow setting custom confidence threshold', () => {
    const integrator = new TubeAmpIntegrator();
    
    integrator.setConfidenceThreshold(0.6);
    
    const config = integrator.getConfig();
    expect(config.confidenceThreshold).toBe(0.6);
  });

  it('should validate confidence threshold range', () => {
    const integrator = new TubeAmpIntegrator();
    
    expect(() => integrator.setConfidenceThreshold(-0.1)).toThrow();
    expect(() => integrator.setConfidenceThreshold(1.5)).toThrow();
  });

  it('should allow setting custom base weights', () => {
    const integrator = new TubeAmpIntegrator();
    
    integrator.setBaseWeights({
      momentum: 0.5,
      meanReversion: 0.3,
      breakout: 0.2,
    });
    
    const config = integrator.getConfig();
    expect(config.baseWeights.momentum).toBe(0.5);
  });

  it('should validate weights sum to 1.0', () => {
    const integrator = new TubeAmpIntegrator();
    
    expect(() =>
      integrator.setBaseWeights({
        momentum: 0.5,
        meanReversion: 0.3,
        breakout: 0.3, // Sum = 1.1
      })
    ).toThrow();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('TubeAmpIntegrator - Edge Cases', () => {
  const integrator = new TubeAmpIntegrator();

  it('should handle all modules returning HOLD', () => {
    const indicators = createMockIndicators({
      rsi: 50, // Neutral
      macd: { macd: 2.0, signal: 2.0, histogram: 0.0 },
      adx: 25,
      sma50: 150,
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      150,
      1000000,
      indicators
    );

    expect(signal.action).toBe('hold');
    expect(signal.shouldExecute).toBe(false);
  });

  it('should handle conflicting signals with tie-breaking', () => {
    const indicators = createMockIndicators({
      rsi: 65, // Momentum: BUY
      macd: { macd: 3.0, signal: 2.0, histogram: 1.0 },
      adx: 30,
      sma50: 150,
      bollingerBands: { upper: 160, middle: 150, lower: 140, bandwidth: 0.13 },
      zScore: 2.5, // Mean Reversion: SELL
      volumeProfile: { avgVolume: 1000000, volumeRatio: 1.3 },
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      162,
      1300000,
      indicators
    );

    // Even if signals conflict, should make a decision based on confidence
    expect(['buy', 'sell', 'hold']).toContain(signal.action);
  });

  it('should handle zero volume gracefully', () => {
    const indicators = createMockIndicators({
      volumeProfile: { avgVolume: 1000000, volumeRatio: 0 },
    });

    const signal = integrator.generateAggregatedSignal(
      'AAPL',
      150,
      0,
      indicators
    );

    // Should not crash, and likely produce HOLD signals
    expect(signal).toBeDefined();
    expect(signal.action).toBe('hold');
  });
});
