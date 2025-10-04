/**
 * Signal Aggregation System
 * Combines signals from multiple strategies with intelligent weighting
 */

import { StrategySignal } from './ampStrategies';

export interface AggregatedSignal {
  action: 'buy' | 'sell' | 'hold';
  symbol: string;
  quantity: number;
  confidence: number;
  reasoning: {
    momentum?: StrategySignal;
    meanReversion?: StrategySignal;
    breakout?: StrategySignal;
    finalDecision: string;
  };
}

export interface StrategyWeights {
  momentum: number;      // 0-1
  meanReversion: number; // 0-1
  breakout: number;      // 0-1
}

/**
 * Aggregate signals from all strategies
 */
export async function aggregateSignals(
  momentumSignals: StrategySignal[],
  meanReversionSignals: StrategySignal[],
  breakoutSignals: StrategySignal[],
  weights: StrategyWeights,
  minConfidence: number = 0.5
): Promise<AggregatedSignal[]> {
  
  // Group signals by symbol
  const signalsBySymbol = new Map<string, {
    momentum?: StrategySignal;
    meanReversion?: StrategySignal;
    breakout?: StrategySignal;
  }>();
  
  // Collect all signals
  momentumSignals.forEach(s => {
    if (!signalsBySymbol.has(s.symbol)) {
      signalsBySymbol.set(s.symbol, {});
    }
    signalsBySymbol.get(s.symbol)!.momentum = s;
  });
  
  meanReversionSignals.forEach(s => {
    if (!signalsBySymbol.has(s.symbol)) {
      signalsBySymbol.set(s.symbol, {});
    }
    signalsBySymbol.get(s.symbol)!.meanReversion = s;
  });
  
  breakoutSignals.forEach(s => {
    if (!signalsBySymbol.has(s.symbol)) {
      signalsBySymbol.set(s.symbol, {});
    }
    signalsBySymbol.get(s.symbol)!.breakout = s;
  });
  
  // Aggregate for each symbol
  const aggregated: AggregatedSignal[] = [];
  
  for (const [symbol, signals] of signalsBySymbol.entries()) {
    const result = aggregateSymbolSignals(symbol, signals, weights);
    
    if (result.confidence >= minConfidence) {
      aggregated.push(result);
    }
  }
  
  // Sort by confidence (highest first)
  return aggregated.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Aggregate signals for a single symbol
 */
function aggregateSymbolSignals(
  symbol: string,
  signals: {
    momentum?: StrategySignal;
    meanReversion?: StrategySignal;
    breakout?: StrategySignal;
  },
  weights: StrategyWeights
): AggregatedSignal {
  
  // Calculate weighted confidence for each action
  const buyConfidence = 
    (signals.momentum?.action === 'buy' ? signals.momentum.confidence * weights.momentum : 0) +
    (signals.meanReversion?.action === 'buy' ? signals.meanReversion.confidence * weights.meanReversion : 0) +
    (signals.breakout?.action === 'buy' ? signals.breakout.confidence * weights.breakout : 0);
  
  const sellConfidence = 
    (signals.momentum?.action === 'sell' ? signals.momentum.confidence * weights.momentum : 0) +
    (signals.meanReversion?.action === 'sell' ? signals.meanReversion.confidence * weights.meanReversion : 0) +
    (signals.breakout?.action === 'sell' ? signals.breakout.confidence * weights.breakout : 0);
  
  // Detect conflicts
  const hasConflict = 
    (signals.momentum?.action === 'buy' && signals.meanReversion?.action === 'sell') ||
    (signals.momentum?.action === 'sell' && signals.meanReversion?.action === 'buy');
  
  // Determine final action
  let action: 'buy' | 'sell' | 'hold';
  let confidence: number;
  let reasoning: string;
  
  if (buyConfidence > sellConfidence) {
    action = 'buy';
    confidence = buyConfidence;
    reasoning = buildReasoning(signals, weights, 'buy', hasConflict);
  } else if (sellConfidence > buyConfidence) {
    action = 'sell';
    confidence = sellConfidence;
    reasoning = buildReasoning(signals, weights, 'sell', hasConflict);
  } else {
    action = 'hold';
    confidence = 0;
    reasoning = 'No clear signal consensus';
  }
  
  // Calculate quantity (use highest confidence signal's quantity)
  let quantity = 0;
  if (action === 'buy') {
    quantity = Math.max(
      signals.momentum?.action === 'buy' ? signals.momentum.quantity : 0,
      signals.meanReversion?.action === 'buy' ? signals.meanReversion.quantity : 0,
      signals.breakout?.action === 'buy' ? signals.breakout.quantity : 0
    );
  }
  
  return {
    action,
    symbol,
    quantity,
    confidence,
    reasoning: {
      momentum: signals.momentum,
      meanReversion: signals.meanReversion,
      breakout: signals.breakout,
      finalDecision: reasoning
    }
  };
}

/**
 * Build reasoning explanation
 */
function buildReasoning(
  signals: {
    momentum?: StrategySignal;
    meanReversion?: StrategySignal;
    breakout?: StrategySignal;
  },
  weights: StrategyWeights,
  action: 'buy' | 'sell',
  hasConflict: boolean
): string {
  const contributors: string[] = [];
  
  if (signals.momentum?.action === action) {
    contributors.push(`Momentum (${(weights.momentum * 100).toFixed(0)}%): ${signals.momentum.reason}`);
  }
  if (signals.meanReversion?.action === action) {
    contributors.push(`Mean Reversion (${(weights.meanReversion * 100).toFixed(0)}%): ${signals.meanReversion.reason}`);
  }
  if (signals.breakout?.action === action) {
    contributors.push(`Breakout (${(weights.breakout * 100).toFixed(0)}%): ${signals.breakout.reason}`);
  }
  
  let reasoning = contributors.join(' | ');
  
  if (hasConflict) {
    reasoning += ' [Note: Conflicting signals detected, proceeding with weighted majority]';
  }
  
  return reasoning;
}

/**
 * Market Regime Detection
 * Adapts strategy weights based on market conditions
 */
export async function detectMarketRegime(
  vixLevel: number = 20,
  spyADX: number = 25
): Promise<StrategyWeights> {
  
  // High volatility regime (VIX > 25)
  if (vixLevel > 25) {
    return {
      momentum: 0.20,
      meanReversion: 0.50, // Mean reversion works better in volatile markets
      breakout: 0.30
    };
  }
  
  // Trending market (ADX > 30)
  if (spyADX > 30) {
    return {
      momentum: 0.60, // Momentum dominant in trends
      meanReversion: 0.20,
      breakout: 0.20
    };
  }
  
  // Range-bound market (ADX < 20)
  if (spyADX < 20) {
    return {
      momentum: 0.20,
      meanReversion: 0.60, // Mean reversion excels in ranges
      breakout: 0.20
    };
  }
  
  // Default balanced weights
  return {
    momentum: 0.40,
    meanReversion: 0.35,
    breakout: 0.25
  };
}
