/**
 * Risk Management Engine
 * Comprehensive risk controls and safeguards for trading
 */

import { AggregatedSignal } from './signalAggregator';
import { calculateATR } from './indicators';

export interface RiskLimits {
  // Position limits
  maxPositions: number;              // Max simultaneous positions (default: 5)
  maxSinglePosition: number;         // Max % in one trade (default: 0.20 = 20%)
  maxTotalExposure: number;          // Max % of capital deployed (default: 0.60 = 60%)
  
  // Loss limits
  maxDailyLoss: number;              // Max daily loss % (default: 0.03 = 3%)
  maxDrawdown: number;               // Kill switch % (default: 0.15 = 15%)
  
  // Stop loss / Take profit
  stopLossMultiplier: number;        // ATR multiplier for stop (default: 2.0)
  takeProfitMultiplier: number;      // ATR multiplier for profit (default: 3.0)
  trailingStopEnabled: boolean;      // Enable trailing stops (default: true)
  trailingStopDistance: number;      // % below peak (default: 0.02 = 2%)
}

export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositions: 5,
  maxSinglePosition: 0.20,
  maxTotalExposure: 0.60,
  maxDailyLoss: 0.03,
  maxDrawdown: 0.15,
  stopLossMultiplier: 2.0,
  takeProfitMultiplier: 3.0,
  trailingStopEnabled: true,
  trailingStopDistance: 0.02
};

export interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  entryPrice: number;
}

export interface PortfolioStatus {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  currentDrawdown: number;
  highWaterMark: number;
}

/**
 * Validate position size against risk limits
 */
export function validatePositionSize(
  proposedQuantity: number,
  price: number,
  totalCapital: number,
  currentPositions: Position[],
  limits: RiskLimits
): {
  approved: boolean;
  adjustedQuantity: number;
  reason: string;
} {
  
  // VALIDATION CHECK 1: Maximum Position Count (5 positions)
  if (currentPositions.length >= limits.maxPositions) {
    return {
      approved: false,
      adjustedQuantity: 0,
      reason: `Already at maximum number of positions (${limits.maxPositions}). Cannot open new position.`
    };
  }
  
  // VALIDATION CHECK 2: Maximum Position Size (20% per position)
  const positionValue = proposedQuantity * price;
  const positionPercent = positionValue / totalCapital;
  const maxPerPosition = limits.maxSinglePosition; // 0.20 (20%)
  
  if (positionPercent > maxPerPosition) {
    const maxValue = totalCapital * maxPerPosition;
    const adjustedQuantity = Math.floor(maxValue / price);
    return {
      approved: false,
      reason: `Position size ${(positionPercent * 100).toFixed(1)}% exceeds maximum ${(maxPerPosition * 100)}% per position`,
      adjustedQuantity
    };
  }
  
  // VALIDATION CHECK 3: Maximum Total Exposure (60% of capital)
  const currentExposure = currentPositions.reduce((sum, pos) =>
    sum + (pos.quantity * pos.currentPrice), 0
  );
  const totalExposure = currentExposure + positionValue;
  const exposurePercent = totalExposure / totalCapital;
  const maxExposure = limits.maxTotalExposure; // 0.60 (60%)
  
  if (exposurePercent > maxExposure) {
    const availableCapital = (totalCapital * maxExposure) - currentExposure;
    const adjustedQuantity = Math.max(0, Math.floor(availableCapital / price));
    
    if (adjustedQuantity === 0) {
      return {
        approved: false,
        reason: `Total exposure at ${(exposurePercent * 100).toFixed(1)}%, max ${(maxExposure * 100)}%. No capital available.`,
        adjustedQuantity: 0
      };
    }
    
    return {
      approved: false,
      reason: `Would exceed ${(maxExposure * 100)}% total exposure limit. Current: ${((currentExposure / totalCapital) * 100).toFixed(1)}%`,
      adjustedQuantity
    };
  }
  
  return {
    approved: true,
    adjustedQuantity: proposedQuantity,
    reason: 'Position size approved'
  };
}

/**
 * Calculate stop loss and take profit levels
 */
export function calculateStops(
  entryPrice: number,
  atr: number,
  limits: RiskLimits
): {
  stopLoss: number;
  takeProfit: number;
} {
  
  // Handle negative ATR by using absolute value
  const absATR = Math.abs(atr);
  
  // Stop loss: 2 ATR below entry price (default)
  const stopLoss = entryPrice - (absATR * limits.stopLossMultiplier);
  
  // Take profit: 3 ATR above entry price (default)
  const takeProfit = entryPrice + (absATR * limits.takeProfitMultiplier);
  
  return {
    stopLoss: Number(stopLoss.toFixed(2)),
    takeProfit: Number(takeProfit.toFixed(2))
  };
}

/**
 * Update trailing stop loss
 */
export function updateTrailingStop(
  currentPrice: number,
  highestPrice: number,
  currentStopLoss: number,
  limits: RiskLimits
): number {
  
  if (!limits.trailingStopEnabled) {
    return currentStopLoss;
  }
  
  // Calculate new trailing stop
  const newStop = highestPrice * (1 - limits.trailingStopDistance);
  
  // Only move stop up, never down
  return Math.max(newStop, currentStopLoss);
}

/**
 * Check kill switches (daily loss and drawdown limits)
 */
export function checkKillSwitches(
  status: PortfolioStatus,
  limits: RiskLimits
): {
  triggered: boolean;
  reason: string;
  action: 'pause' | 'liquidate' | 'continue';
} {
  
  // Check daily loss limit (3%)
  if (Math.abs(status.dailyPnLPercent) >= limits.maxDailyLoss) {
    return {
      triggered: true,
      reason: `Daily loss limit exceeded: ${(status.dailyPnLPercent * 100).toFixed(2)}% daily loss`,
      action: 'pause'
    };
  }
  
  // Check maximum drawdown (15%)
  if (status.currentDrawdown >= limits.maxDrawdown) {
    return {
      triggered: true,
      reason: `Maximum drawdown exceeded: ${(status.currentDrawdown * 100).toFixed(2)}% drawdown`,
      action: 'liquidate'
    };
  }
  
  return {
    triggered: false,
    reason: '',
    action: 'continue'
  };
}

/**
 * POSITION SIZING
 */

export type PositionSizingMethod = 
  | 'fixed'           // Fixed % per trade
  | 'kelly'           // Kelly Criterion
  | 'volatility'      // ATR-based volatility sizing
  | 'confidence';     // Based on signal confidence

/**
 * Calculate position size using specified method
 */
export function calculatePositionSize(
  method: PositionSizingMethod,
  params: {
    totalCapital: number;
    currentPrice: number;
    signal?: AggregatedSignal;
    atr?: number;
    winRate?: number;
    avgWin?: number;
    avgLoss?: number;
    fixedPercent?: number;
  }
): number {
  
  switch (method) {
    case 'fixed':
      return calculateFixedSize(params);
    case 'kelly':
      return calculateKellySize(params);
    case 'volatility':
      return calculateVolatilitySize(params);
    case 'confidence':
      return calculateConfidenceSize(params);
    default:
      return calculateFixedSize(params);
  }
}

/**
 * Fixed percentage sizing
 */
function calculateFixedSize(params: {
  totalCapital: number;
  currentPrice: number;
  fixedPercent?: number;
}): number {
  
  const percent = params.fixedPercent || 0.02; // Default 2%
  const dollarRisk = params.totalCapital * percent;
  const shares = Math.floor(dollarRisk / params.currentPrice);
  
  return shares;
}

/**
 * Kelly Criterion sizing
 */
function calculateKellySize(params: {
  totalCapital: number;
  currentPrice: number;
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
}): number {
  
  // Kelly Formula: f = (bp - q) / b
  // f = fraction of capital to bet
  // b = ratio of avg win to avg loss
  // p = win probability
  // q = loss probability (1 - p)
  
  const p = params.winRate || 0.55; // Default 55% win rate
  const q = 1 - p;
  const b = (params.avgWin || 1.5) / (params.avgLoss || 1.0);
  
  let kellyFraction = (b * p - q) / b;
  
  // Apply safety factor (use 1/4 Kelly for safety)
  kellyFraction = kellyFraction * 0.25;
  
  // Cap at 5% of capital
  kellyFraction = Math.min(kellyFraction, 0.05);
  
  // Ensure positive
  kellyFraction = Math.max(kellyFraction, 0);
  
  const dollarAmount = params.totalCapital * kellyFraction;
  const shares = Math.floor(dollarAmount / params.currentPrice);
  
  return shares;
}

/**
 * Volatility-based sizing
 */
function calculateVolatilitySize(params: {
  totalCapital: number;
  currentPrice: number;
  atr?: number;
}): number {
  
  // Size inversely proportional to volatility
  // More volatile = smaller position
  
  const atr = params.atr || params.currentPrice * 0.02; // Default 2% ATR
  const volatilityRatio = atr / params.currentPrice;
  
  // Base risk of 2% of capital
  const baseRisk = params.totalCapital * 0.02;
  
  // Adjust for volatility (less volatile = bigger position)
  const volatilityMultiplier = Math.min(0.5 / volatilityRatio, 2.0);
  const adjustedRisk = baseRisk * volatilityMultiplier;
  
  const shares = Math.floor(adjustedRisk / params.currentPrice);
  
  return shares;
}

/**
 * Confidence-based sizing (Issue #7 specification)
 * Base: 2% of capital
 * Adjusted by: signal confidence
 * Adjusted by: volatility (ATR)
 */
function calculateConfidenceSize(params: {
  totalCapital: number;
  currentPrice: number;
  signal?: AggregatedSignal;
  atr?: number;
}): number {
  
  const confidence = params.signal?.confidence || 0.5;
  const atr = params.atr || params.currentPrice * 0.02;
  
  // Base allocation: 2% of capital
  const baseAllocation = params.totalCapital * 0.02;
  
  // Confidence multiplier: ranges from 0.5 (confidence=0) to 1.5 (confidence=1)
  const confidenceMultiplier = 0.5 + confidence;
  
  // Apply confidence multiplier to base allocation
  const allocation = baseAllocation * confidenceMultiplier;
  
  // Adjust for volatility (reduce position in high volatility)
  const atrPercent = atr / params.currentPrice;
  const volatilityAdjustment = Math.max(0.5, 1 - atrPercent);
  
  const adjustedAllocation = allocation * volatilityAdjustment;
  return Math.floor(adjustedAllocation / params.currentPrice);
}

/**
 * Determine optimal position size using median of all methods
 */
export function determineOptimalPositionSize(
  signal: AggregatedSignal,
  totalCapital: number,
  currentPrice: number,
  atr: number,
  ampPerformance: {
    winRate: number;
    avgWin: number;
    avgLoss: number;
  }
): number {
  
  const methods: PositionSizingMethod[] = [
    'fixed',
    'kelly',
    'volatility',
    'confidence'
  ];
  
  const sizes: number[] = [];
  
  for (const method of methods) {
    const size = calculatePositionSize(method, {
      totalCapital,
      currentPrice,
      signal,
      atr,
      winRate: ampPerformance.winRate,
      avgWin: ampPerformance.avgWin,
      avgLoss: ampPerformance.avgLoss,
      fixedPercent: 0.02
    });
    
    sizes.push(size);
  }
  
  // Use median size (more conservative than mean)
  sizes.sort((a, b) => a - b);
  const medianSize = sizes[Math.floor(sizes.length / 2)];
  
  console.log('📐 Position sizes:', {
    fixed: sizes[0],
    kelly: sizes[1],
    volatility: sizes[2],
    confidence: sizes[3],
    median: medianSize
  });
  
  return medianSize;
}
