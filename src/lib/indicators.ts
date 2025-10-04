/**
 * Technical Indicators Library for TubeAmp
 * Provides comprehensive technical analysis tools for algorithmic trading
 */

export interface PriceBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

/**
 * Calculate RSI (Relative Strength Index)
 * Measures momentum by comparing upward and downward price movements
 * @param prices - Array of closing prices
 * @param period - Lookback period (default 14)
 * @returns RSI value between 0-100
 * @example
 * const rsi = calculateRSI([44, 44.34, 44.09, 43.61, 44.33], 14);
 * console.log(rsi); // ~50
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (!prices || prices.length < period + 1) {
    throw new Error(`Insufficient data for RSI calculation. Need at least ${period + 1} prices.`);
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate subsequent values using smoothing
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Shows relationship between two moving averages
 * @param prices - Array of closing prices
 * @param fastPeriod - Fast EMA period (default 12)
 * @param slowPeriod - Slow EMA period (default 26)
 * @param signalPeriod - Signal line period (default 9)
 * @returns MACD line, signal line, and histogram
 * @example
 * const macd = calculateMACD(prices, 12, 26, 9);
 * if (macd.histogram > 0) console.log('Bullish momentum');
 */
export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (prices.length < slowPeriod + signalPeriod) {
    throw new Error(`Insufficient data for MACD. Need at least ${slowPeriod + signalPeriod} prices.`);
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdLine = fastEMA - slowEMA;

  // Calculate signal line (EMA of MACD values)
  // For simplicity, we'll use a simple approximation
  const macdValues = [macdLine]; // In production, calculate for all periods
  const signalLine = calculateEMA(macdValues.concat([macdLine]), signalPeriod);
  const histogram = macdLine - signalLine;

  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

/**
 * Calculate Bollinger Bands
 * Shows volatility and potential overbought/oversold levels
 * @param prices - Array of closing prices
 * @param period - Lookback period (default 20)
 * @param stdDev - Standard deviation multiplier (default 2)
 * @returns Upper, middle, and lower bands plus bandwidth
 * @example
 * const bb = calculateBollingerBands(prices, 20, 2);
 * if (price < bb.lower) console.log('Oversold');
 */
export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
}

export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): BollingerBands {
  if (prices.length < period) {
    throw new Error(`Insufficient data for Bollinger Bands. Need at least ${period} prices.`);
  }

  const middle = calculateSMA(prices, period);
  
  // Calculate standard deviation
  const recentPrices = prices.slice(-period);
  const squaredDiffs = recentPrices.map(price => Math.pow(price - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = middle + (stdDev * standardDeviation);
  const lower = middle - (stdDev * standardDeviation);
  const bandwidth = (upper - lower) / middle;

  return { upper, middle, lower, bandwidth };
}

/**
 * Calculate ATR (Average True Range)
 * Measures market volatility
 * @param bars - Array of price bars (OHLC)
 * @param period - Lookback period (default 14)
 * @returns ATR value
 * @example
 * const atr = calculateATR(priceBars, 14);
 * console.log(`Volatility: ${atr}`);
 */
export function calculateATR(bars: PriceBar[], period: number = 14): number {
  if (bars.length < period + 1) {
    throw new Error(`Insufficient data for ATR. Need at least ${period + 1} bars.`);
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trueRanges.push(tr);
  }

  // Use EMA of true ranges
  return calculateEMA(trueRanges, period);
}

/**
 * Calculate EMA (Exponential Moving Average)
 * Weighted average that gives more weight to recent prices
 * @param prices - Array of prices
 * @param period - Lookback period
 * @returns Current EMA value
 * @example
 * const ema20 = calculateEMA(prices, 20);
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) {
    throw new Error(`Insufficient data for EMA. Need at least ${period} prices.`);
  }

  const multiplier = 2 / (period + 1);
  
  // Start with SMA
  let ema = calculateSMA(prices.slice(0, period), period);

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate SMA (Simple Moving Average)
 * Arithmetic mean of prices over a period
 * @param prices - Array of prices
 * @param period - Lookback period
 * @returns Average price
 * @example
 * const sma50 = calculateSMA(prices, 50);
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) {
    throw new Error(`Insufficient data for SMA. Need at least ${period} prices.`);
  }

  const recentPrices = prices.slice(-period);
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate ADX (Average Directional Index)
 * Measures trend strength (not direction)
 * @param bars - Array of price bars
 * @param period - Lookback period (default 14)
 * @returns ADX value and directional indicators
 * @example
 * const adx = calculateADX(priceBars, 14);
 * if (adx.adx > 25) console.log('Strong trend');
 */
export interface ADXResult {
  adx: number;
  plusDI: number;
  minusDI: number;
}

export function calculateADX(bars: PriceBar[], period: number = 14): ADXResult {
  if (bars.length < period + 1) {
    throw new Error(`Insufficient data for ADX. Need at least ${period + 1} bars.`);
  }

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trueRanges: number[] = [];

  // Calculate directional movements
  for (let i = 1; i < bars.length; i++) {
    const highDiff = bars[i].high - bars[i - 1].high;
    const lowDiff = bars[i - 1].low - bars[i].low;

    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    );
    trueRanges.push(tr);
  }

  // Calculate smoothed values
  const avgPlusDM = calculateEMA(plusDM, period);
  const avgMinusDM = calculateEMA(minusDM, period);
  const avgTR = calculateEMA(trueRanges, period);

  // Calculate directional indicators
  const plusDI = avgTR !== 0 ? (avgPlusDM / avgTR) * 100 : 0;
  const minusDI = avgTR !== 0 ? (avgMinusDM / avgTR) * 100 : 0;

  // Calculate DX and ADX
  const dx = plusDI + minusDI !== 0 
    ? (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100 
    : 0;
  
  // ADX is smoothed DX (simplified here)
  const adx = dx;

  return { adx, plusDI, minusDI };
}

/**
 * Calculate Z-Score for mean reversion
 * Measures how many standard deviations price is from mean
 * @param currentPrice - Current price
 * @param prices - Historical prices
 * @param period - Lookback period (default 20)
 * @returns Z-Score (positive = above mean, negative = below mean)
 * @example
 * const z = calculateZScore(currentPrice, prices, 20);
 * if (z < -2) console.log('Extremely oversold');
 */
export function calculateZScore(
  currentPrice: number,
  prices: number[],
  period: number = 20
): number {
  if (prices.length < period) {
    throw new Error(`Insufficient data for Z-Score. Need at least ${period} prices.`);
  }

  const recentPrices = prices.slice(-period);
  const mean = recentPrices.reduce((a, b) => a + b, 0) / period;
  
  const squaredDiffs = recentPrices.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;
  return (currentPrice - mean) / stdDev;
}

/**
 * Calculate Volume Profile
 * Analyzes volume patterns to confirm price movements
 * @param bars - Array of price bars
 * @param period - Lookback period (default 20)
 * @returns Average volume and volume ratio
 * @example
 * const vol = calculateVolumeProfile(bars, 20);
 * if (vol.isAboveAverage) console.log('High volume confirmation');
 */
export function calculateVolumeProfile(
  bars: PriceBar[],
  period: number = 20
): {
  avgVolume: number;
  volumeRatio: number;
  isAboveAverage: boolean;
} {
  if (bars.length < period) {
    throw new Error(`Insufficient data for Volume Profile. Need at least ${period} bars.`);
  }

  const recentBars = bars.slice(-period);
  const volumes = recentBars.map(bar => bar.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / period;
  
  const currentVolume = bars[bars.length - 1].volume;
  const volumeRatio = avgVolume !== 0 ? currentVolume / avgVolume : 0;
  const isAboveAverage = volumeRatio > 1.0;

  return { avgVolume, volumeRatio, isAboveAverage };
}
