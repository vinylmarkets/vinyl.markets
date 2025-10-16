/**
 * TubeAmp Integration Layer
 * Combines all three strategy modules with market regime detection
 * Based on Vinyl Bible specification (page 20)
 */

import {
  MomentumModule,
  MeanReversionModule,
  BreakoutModule,
  ModuleSignal,
  MarketBar,
  IndicatorSet,
} from './tubeamp-modules';

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleWeights {
  momentum: number;
  meanReversion: number;
  breakout: number;
}

export interface MarketRegime {
  type: 'trending' | 'range-bound' | 'high-volatility' | 'neutral';
  adx: number;
  vix?: number;
  weights: ModuleWeights;
  positionSizeMultiplier: number;
}

export interface AggregatedSignal {
  action: 'buy' | 'sell' | 'hold';
  totalConfidence: number;
  breakdown: {
    momentum: ModuleSignal;
    meanReversion: ModuleSignal;
    breakout: ModuleSignal;
  };
  regime: MarketRegime;
  shouldExecute: boolean;
  positionSizeMultiplier: number;
  reason: string;
}

// ============================================================================
// TUBEAMP INTEGRATOR
// ============================================================================

export class TubeAmpIntegrator {
  private momentumModule: MomentumModule;
  private meanReversionModule: MeanReversionModule;
  private breakoutModule: BreakoutModule;
  
  private baseWeights: ModuleWeights = {
    momentum: 0.45,
    meanReversion: 0.35,
    breakout: 0.20,
  };

  private confidenceThreshold = 0.2;

  constructor() {
    this.momentumModule = new MomentumModule();
    this.meanReversionModule = new MeanReversionModule();
    this.breakoutModule = new BreakoutModule();
  }

  /**
   * Detects market regime and adjusts module weights accordingly
   * 
   * Market Regimes:
   * 1. Trending Market (ADX > 30): momentum 60%, mean reversion 20%, breakout 20%
   * 2. Range-Bound Market (ADX < 20): momentum 20%, mean reversion 50%, breakout 30%
   * 3. High Volatility (VIX > 25): Reduce position sizes by 50%
   * 4. Normal Market: Use base weights
   */
  detectMarketRegime(adx: number, vix?: number): MarketRegime {
    let weights = { ...this.baseWeights };
    let positionSizeMultiplier = 1.0;
    let regimeType: MarketRegime['type'] = 'neutral';

    // Detect trending market
    if (adx > 30) {
      regimeType = 'trending';
      weights = {
        momentum: 0.60,
        meanReversion: 0.20,
        breakout: 0.20,
      };
    }
    // Detect range-bound market
    else if (adx < 20) {
      regimeType = 'range-bound';
      weights = {
        momentum: 0.20,
        meanReversion: 0.50,
        breakout: 0.30,
      };
    }

    // Detect high volatility
    if (vix !== undefined && vix > 25) {
      regimeType = 'high-volatility';
      positionSizeMultiplier = 0.5;
    }

    // Normalize weights to ensure they sum to ~1.0
    const weightSum = weights.momentum + weights.meanReversion + weights.breakout;
    if (weightSum > 0) {
      weights.momentum /= weightSum;
      weights.meanReversion /= weightSum;
      weights.breakout /= weightSum;
    }

    return {
      type: regimeType,
      adx,
      vix,
      weights,
      positionSizeMultiplier,
    };
  }

  /**
   * Determines final action using majority vote
   * If there's a tie, defaults to 'hold'
   */
  private getMajorityAction(signals: ModuleSignal[]): 'buy' | 'sell' | 'hold' {
    const votes = { buy: 0, sell: 0, hold: 0 };
    
    signals.forEach((signal) => {
      votes[signal.action]++;
    });

    // Find the action with the most votes
    if (votes.buy > votes.sell && votes.buy > votes.hold) {
      return 'buy';
    }
    if (votes.sell > votes.buy && votes.sell > votes.hold) {
      return 'sell';
    }
    
    return 'hold';
  }

  /**
   * Aggregates signals from all three modules into a final trading decision
   * 
   * Algorithm:
   * 1. Get individual signals from each module
   * 2. Detect market regime and adjust weights
   * 3. Calculate weighted total confidence
   * 4. If confidence > threshold (0.5), determine action by majority vote
   * 5. Apply position size multiplier based on regime
   */
  generateAggregatedSignal(
    symbol: string,
    currentPrice: number,
    currentVolume: number,
    indicators: IndicatorSet,
    vix?: number
  ): AggregatedSignal {
    // Step 1: Generate individual module signals
    const momentumSignal = this.momentumModule.generateSignal(
      symbol,
      currentPrice,
      indicators
    );

    const meanReversionSignal = this.meanReversionModule.generateSignal(
      symbol,
      currentPrice,
      currentVolume,
      indicators
    );

    const breakoutSignal = this.breakoutModule.generateSignal(
      symbol,
      currentPrice,
      currentVolume,
      indicators
    );

    // Step 2: Detect market regime (requires ADX)
    const adx = indicators.adx || 25; // Default to neutral if not provided
    const regime = this.detectMarketRegime(adx, vix);

    // Step 3: Calculate weighted total confidence
    const totalConfidence =
      momentumSignal.confidence * regime.weights.momentum +
      meanReversionSignal.confidence * regime.weights.meanReversion +
      breakoutSignal.confidence * regime.weights.breakout;

    // Step 4: Determine if we should execute and what action to take
    const shouldExecute = totalConfidence > this.confidenceThreshold;
    const action = shouldExecute
      ? this.getMajorityAction([momentumSignal, meanReversionSignal, breakoutSignal])
      : 'hold';

    // Generate explanation
    let reason = '';
    if (shouldExecute) {
      const activeSignals = [
        momentumSignal.action !== 'hold' ? `Momentum: ${momentumSignal.action}` : null,
        meanReversionSignal.action !== 'hold' ? `Mean Rev: ${meanReversionSignal.action}` : null,
        breakoutSignal.action !== 'hold' ? `Breakout: ${breakoutSignal.action}` : null,
      ].filter(Boolean);
      
      reason = `${action.toUpperCase()} signal (confidence: ${totalConfidence.toFixed(2)}) | `;
      reason += `Regime: ${regime.type} | `;
      reason += `Active: ${activeSignals.join(', ') || 'None'} | `;
      reason += `Weights: M=${(regime.weights.momentum * 100).toFixed(0)}% MR=${(regime.weights.meanReversion * 100).toFixed(0)}% B=${(regime.weights.breakout * 100).toFixed(0)}%`;
    } else {
      reason = `No execution: confidence ${totalConfidence.toFixed(2)} below threshold ${this.confidenceThreshold} | Regime: ${regime.type}`;
    }

    return {
      action,
      totalConfidence,
      breakdown: {
        momentum: momentumSignal,
        meanReversion: meanReversionSignal,
        breakout: breakoutSignal,
      },
      regime,
      shouldExecute,
      positionSizeMultiplier: regime.positionSizeMultiplier,
      reason,
    };
  }

  /**
   * Sets the confidence threshold for signal execution
   * Default is 0.5 per the specification
   */
  setConfidenceThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Confidence threshold must be between 0 and 1');
    }
    this.confidenceThreshold = threshold;
  }

  /**
   * Sets custom base weights for the modules
   * Note: These will be overridden by market regime detection
   */
  setBaseWeights(weights: ModuleWeights): void {
    const sum = weights.momentum + weights.meanReversion + weights.breakout;
    if (Math.abs(sum - 1.0) > 0.01) {
      throw new Error('Weights must sum to approximately 1.0');
    }
    this.baseWeights = weights;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      baseWeights: this.baseWeights,
      confidenceThreshold: this.confidenceThreshold,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR INDICATOR CALCULATION
// ============================================================================

/**
 * Helper to calculate all required indicators from price history
 * This assumes you have indicator calculation functions available
 */
export function calculateAllIndicators(
  priceHistory: number[],
  volumeHistory: number[],
  bars: MarketBar[]
): IndicatorSet {
  // NOTE: This is a placeholder structure
  // In production, you would import and use the actual indicator calculation functions
  // from your indicators.ts file
  
  // Example structure (replace with actual calculations):
  return {
    // rsi: calculateRSI(priceHistory, 14),
    // macd: calculateMACD(priceHistory, 12, 26, 9),
    // adx: calculateADX(bars, 14),
    // sma50: calculateSMA(priceHistory, 50),
    // bollingerBands: calculateBollingerBands(priceHistory, 20, 2),
    // zScore: calculateZScore(priceHistory[priceHistory.length - 1], priceHistory, 20),
    // atr: calculateATR(bars, 14),
    // donchianChannels: calculateDonchianChannels(bars, 20),
    // volumeProfile: calculateVolumeProfile(bars, 20),
  };
}

// ============================================================================
// EXPORT CONVENIENCE FUNCTION
// ============================================================================

/**
 * Convenience function to generate a signal with all steps in one call
 */
export function generateTubeAmpSignal(
  symbol: string,
  currentPrice: number,
  currentVolume: number,
  indicators: IndicatorSet,
  vix?: number
): AggregatedSignal {
  const integrator = new TubeAmpIntegrator();
  return integrator.generateAggregatedSignal(
    symbol,
    currentPrice,
    currentVolume,
    indicators,
    vix
  );
}
