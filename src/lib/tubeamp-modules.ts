/**
 * TubeAmp Strategy Modules
 * Individual trading modules that generate signals independently
 * Based on Vinyl Bible specification (pages 18-20)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MarketBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ModuleSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1 scale
  symbol: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface IndicatorSet {
  rsi?: number;
  macd?: { macd: number; signal: number; histogram: number };
  adx?: number;
  sma50?: number;
  bollingerBands?: { upper: number; middle: number; lower: number; bandwidth: number };
  zScore?: number;
  atr?: number;
  donchianChannels?: { upper: number; lower: number };
  volumeProfile?: { avgVolume: number; volumeRatio: number };
}

// ============================================================================
// MODULE 1: MOMENTUM STRATEGY (40% base weight)
// ============================================================================

export class MomentumModule {
  /**
   * Generates momentum-based trading signals using RSI, MACD, ADX, and SMA
   * 
   * BUY Signal when:
   * - RSI > 50 (bullish momentum)
   * - MACD line > MACD signal (momentum confirming)
   * - ADX > 25 (strong trend exists)
   * - price > SMA_50 (above trend line)
   * 
   * Confidence = (RSI - 50) / 50 * 0.4 (scaled 0-0.4)
   */
  generateSignal(
    symbol: string,
    currentPrice: number,
    indicators: IndicatorSet
  ): ModuleSignal {
    const { rsi, macd, adx, sma50 } = indicators;

    // Validate required indicators
    if (rsi === undefined || !macd || adx === undefined || sma50 === undefined) {
      return {
        action: 'hold',
        confidence: 0,
        symbol,
        reason: 'Missing required indicators for momentum module',
      };
    }

    // Check BUY conditions
    if (
      rsi > 50 &&
      macd.macd > macd.signal &&
      adx > 25 &&
      currentPrice > sma50
    ) {
      const confidence = Math.min(((rsi - 50) / 50) * 0.4, 0.4);
      return {
        action: 'buy',
        confidence,
        symbol,
        reason: `Momentum BUY: RSI=${rsi.toFixed(1)}, MACD bullish, ADX=${adx.toFixed(1)}, Price above SMA50`,
        metadata: { rsi, macdDiff: macd.macd - macd.signal, adx, priceVsSMA: currentPrice - sma50 },
      };
    }

    // Check SELL conditions
    if (
      rsi < 50 &&
      macd.macd < macd.signal &&
      currentPrice < sma50
    ) {
      const confidence = Math.min(((50 - rsi) / 50) * 0.4, 0.4);
      return {
        action: 'sell',
        confidence,
        symbol,
        reason: `Momentum SELL: RSI=${rsi.toFixed(1)}, MACD bearish, Price below SMA50`,
        metadata: { rsi, macdDiff: macd.signal - macd.macd, priceVsSMA: sma50 - currentPrice },
      };
    }

    // No clear signal
    return {
      action: 'hold',
      confidence: 0.05,
      symbol,
      reason: 'Momentum conditions not met',
    };
  }
}

// ============================================================================
// MODULE 2: MEAN REVERSION STRATEGY (30% base weight)
// ============================================================================

export class MeanReversionModule {
  /**
   * Generates mean reversion signals using Bollinger Bands, Z-Score, and Volume
   * 
   * BUY Signal when oversold:
   * - price < Bollinger Lower Band (oversold)
   * - z-score < -2 (statistically extreme)
   * - volume > average_volume * 1.2 (confirming)
   * 
   * Confidence = min(|z-score| / 3 * 0.3, 0.3)
   */
  generateSignal(
    symbol: string,
    currentPrice: number,
    currentVolume: number,
    indicators: IndicatorSet
  ): ModuleSignal {
    const { bollingerBands, zScore, volumeProfile } = indicators;

    // Validate required indicators
    if (!bollingerBands || zScore === undefined || !volumeProfile) {
      return {
        action: 'hold',
        confidence: 0,
        symbol,
        reason: 'Missing required indicators for mean reversion module',
      };
    }

    const volumeRatio = currentVolume / volumeProfile.avgVolume;

    // Check BUY conditions (oversold)
    if (
      currentPrice < bollingerBands.lower &&
      zScore < -2 &&
      volumeRatio > 1.2
    ) {
      const confidence = Math.min((Math.abs(zScore) / 3) * 0.3, 0.3);
      return {
        action: 'buy',
        confidence,
        symbol,
        reason: `Mean Reversion BUY: Price below BB lower (${currentPrice.toFixed(2)} < ${bollingerBands.lower.toFixed(2)}), Z-Score=${zScore.toFixed(2)}, High volume`,
        metadata: { 
          zScore, 
          bbDistance: bollingerBands.lower - currentPrice, 
          volumeRatio: volumeRatio.toFixed(2) 
        },
      };
    }

    // Check SELL conditions (overbought)
    if (
      currentPrice > bollingerBands.upper &&
      zScore > 2 &&
      volumeRatio > 1.2
    ) {
      const confidence = Math.min((Math.abs(zScore) / 3) * 0.3, 0.3);
      return {
        action: 'sell',
        confidence,
        symbol,
        reason: `Mean Reversion SELL: Price above BB upper (${currentPrice.toFixed(2)} > ${bollingerBands.upper.toFixed(2)}), Z-Score=${zScore.toFixed(2)}, High volume`,
        metadata: { 
          zScore, 
          bbDistance: currentPrice - bollingerBands.upper, 
          volumeRatio: volumeRatio.toFixed(2) 
        },
      };
    }

    // No clear signal
    return {
      action: 'hold',
      confidence: 0.05,
      symbol,
      reason: 'Mean reversion conditions not met',
    };
  }
}

// ============================================================================
// MODULE 3: BREAKOUT STRATEGY (20% base weight)
// ============================================================================

export class BreakoutModule {
  /**
   * Generates breakout signals using ATR, Donchian Channels, and Volume
   * 
   * BUY on upside breakout:
   * - price > Donchian Upper Channel (new 20-day high)
   * - volume > average_volume * 2 (strong confirmation)
   * - ATR > ATR_MA * 1.5 (volatility expanding)
   * 
   * Confidence = (volume / avg_volume - 1) * 0.2
   */
  generateSignal(
    symbol: string,
    currentPrice: number,
    currentVolume: number,
    indicators: IndicatorSet
  ): ModuleSignal {
    const { atr, donchianChannels, volumeProfile } = indicators;

    // Validate required indicators
    if (atr === undefined || !donchianChannels || !volumeProfile) {
      return {
        action: 'hold',
        confidence: 0,
        symbol,
        reason: 'Missing required indicators for breakout module',
      };
    }

    const volumeRatio = currentVolume / volumeProfile.avgVolume;
    
    // For ATR expansion check, we'd need historical ATR values
    // For now, we'll simplify by checking if volume surge exists (proxy for volatility expansion)
    const atrExpanding = volumeRatio > 1.5;

    // Check BUY conditions (upside breakout)
    if (
      currentPrice > donchianChannels.upper &&
      volumeRatio > 2.0 &&
      atrExpanding
    ) {
      const confidence = Math.min((volumeRatio - 1) * 0.2, 0.2);
      return {
        action: 'buy',
        confidence,
        symbol,
        reason: `Breakout BUY: Price broke above Donchian upper (${currentPrice.toFixed(2)} > ${donchianChannels.upper.toFixed(2)}), Volume surge ${volumeRatio.toFixed(1)}x`,
        metadata: { 
          breakoutSize: currentPrice - donchianChannels.upper, 
          volumeRatio: volumeRatio.toFixed(2),
          atr 
        },
      };
    }

    // Check SELL conditions (downside breakout)
    if (
      currentPrice < donchianChannels.lower &&
      volumeRatio > 2.0 &&
      atrExpanding
    ) {
      const confidence = Math.min((volumeRatio - 1) * 0.2, 0.2);
      return {
        action: 'sell',
        confidence,
        symbol,
        reason: `Breakout SELL: Price broke below Donchian lower (${currentPrice.toFixed(2)} < ${donchianChannels.lower.toFixed(2)}), Volume surge ${volumeRatio.toFixed(1)}x`,
        metadata: { 
          breakoutSize: donchianChannels.lower - currentPrice, 
          volumeRatio: volumeRatio.toFixed(2),
          atr 
        },
      };
    }

    // No clear signal
    return {
      action: 'hold',
      confidence: 0.05,
      symbol,
      reason: 'Breakout conditions not met',
    };
  }
}
