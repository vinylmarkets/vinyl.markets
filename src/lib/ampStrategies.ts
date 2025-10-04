import { supabase } from '@/integrations/supabase/client';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateADX, 
  calculateSMA,
  calculateBollingerBands,
  calculateZScore,
  calculateVolumeProfile,
  calculateATR,
  PriceBar,
  BollingerBands
} from './indicators';

export interface StrategySignal {
  action: 'buy' | 'sell' | 'hold';
  symbol: string;
  quantity: number;
  confidence: number;
  reason: string;
}

/**
 * Fetch market data from Polygon.io or Alpaca
 */
async function fetchMarketData(
  symbol: string,
  bars: number = 50
): Promise<PriceBar[]> {
  try {
    // Use Alpaca for market data
    const { data, error } = await supabase.functions.invoke('market-data', {
      body: { symbol, bars }
    });

    if (error) throw error;
    
    // Transform Alpaca data to PriceBar format
    return data.bars?.map((bar: any) => ({
      open: parseFloat(bar.o),
      high: parseFloat(bar.h),
      low: parseFloat(bar.l),
      close: parseFloat(bar.c),
      volume: parseFloat(bar.v),
      timestamp: new Date(bar.t)
    })) || [];
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error);
    return [];
  }
}

/**
 * MOMENTUM STRATEGY
 * Buys stocks with strong upward momentum confirmed by multiple indicators
 */
export async function runMomentumStrategy(
  ampId: string,
  allocatedCapital: number,
  settings: {
    rsiPeriod?: number;
    rsiThreshold?: number;
    macdFast?: number;
    macdSlow?: number;
    macdSignal?: number;
    adxThreshold?: number;
    smaPeriod?: number;
    symbols?: string[];
  } = {}
): Promise<StrategySignal[]> {
  console.log('🚀 Running momentum strategy for amp:', ampId);
  
  const signals: StrategySignal[] = [];
  const symbols = settings.symbols || ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];
  
  const rsiPeriod = settings.rsiPeriod || 14;
  const rsiThreshold = settings.rsiThreshold || 50;
  const adxThreshold = settings.adxThreshold || 25;
  const smaPeriod = settings.smaPeriod || 50;

  for (const symbol of symbols) {
    try {
      const marketData = await fetchMarketData(symbol, 50);
      
      if (marketData.length < 30) {
        console.log(`⚠️ Insufficient data for ${symbol}`);
        continue;
      }

      const closePrices = marketData.map(bar => bar.close);
      const currentPrice = closePrices[closePrices.length - 1];

      // Calculate technical indicators
      const rsi = calculateRSI(closePrices, rsiPeriod);
      const macd = calculateMACD(closePrices, 12, 26, 9);
      const adx = calculateADX(marketData, 14);
      const sma50 = calculateSMA(closePrices, smaPeriod);

      // Check for BUY signal
      const isBullishRSI = rsi > rsiThreshold;
      const isBullishMACD = macd.histogram > 0;
      const hasStrongTrend = adx.adx > adxThreshold;
      const isAboveTrend = currentPrice > sma50;

      if (isBullishRSI && isBullishMACD && hasStrongTrend && isAboveTrend) {
        // Calculate confidence score
        const rsiConfidence = Math.min((rsi - rsiThreshold) / 50, 1.0) * 0.4;
        const macdConfidence = macd.histogram > 0 ? 0.3 : 0;
        const adxConfidence = Math.min((adx.adx - adxThreshold) / 75, 1.0) * 0.2;
        const trendConfidence = currentPrice > sma50 ? 0.1 : 0;
        
        const totalConfidence = rsiConfidence + macdConfidence + adxConfidence + trendConfidence;

        if (totalConfidence > 0.5) {
          // Calculate position size (25% allocation)
          const positionValue = allocatedCapital * 0.25;
          const shares = Math.floor(positionValue / currentPrice);

          signals.push({
            action: 'buy',
            symbol,
            quantity: shares,
            confidence: totalConfidence,
            reason: `Momentum: RSI ${rsi.toFixed(1)}, MACD+ ${macd.histogram.toFixed(2)}, ADX ${adx.adx.toFixed(1)}, Above SMA${smaPeriod}`
          });

          console.log(`✅ BUY signal for ${symbol}: Confidence ${(totalConfidence * 100).toFixed(1)}%`);
        }
      }

    } catch (error) {
      console.error(`Error analyzing ${symbol} for momentum:`, error);
      continue;
    }
  }

  return signals;
}

/**
 * MEAN REVERSION STRATEGY
 * Buys oversold stocks and sells overbought stocks using statistical analysis
 */
export async function runMeanReversionStrategy(
  ampId: string,
  allocatedCapital: number,
  settings: {
    bbPeriod?: number;
    bbStdDev?: number;
    zScoreThreshold?: number;
    volumeMultiplier?: number;
    symbols?: string[];
  } = {}
): Promise<StrategySignal[]> {
  console.log('🔄 Running mean reversion strategy for amp:', ampId);
  
  const signals: StrategySignal[] = [];
  const symbols = settings.symbols || ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  
  const bbPeriod = settings.bbPeriod || 20;
  const bbStdDev = settings.bbStdDev || 2;
  const zScoreThreshold = settings.zScoreThreshold || 2;
  const volumeMultiplier = settings.volumeMultiplier || 1.2;

  for (const symbol of symbols) {
    try {
      const marketData = await fetchMarketData(symbol, 30);
      
      if (marketData.length < 20) {
        console.log(`⚠️ Insufficient data for ${symbol}`);
        continue;
      }

      const closePrices = marketData.map(bar => bar.close);
      const currentPrice = closePrices[closePrices.length - 1];

      // Calculate indicators
      const bb = calculateBollingerBands(closePrices, bbPeriod, bbStdDev);
      const zScore = calculateZScore(currentPrice, closePrices, 20);
      const volumeProfile = calculateVolumeProfile(marketData, 20);

      // BUY oversold condition
      if (currentPrice < bb.lower && 
          zScore < -zScoreThreshold && 
          volumeProfile.volumeRatio > volumeMultiplier) {
        
        const confidence = calculateMeanReversionConfidence(
          zScore, currentPrice, bb, volumeProfile
        );
        
        if (confidence > 0.5) {
          // More aggressive sizing for extreme mean reversion
          const extremeness = Math.min(Math.abs(zScore) / 3, 1.0);
          const allocationPct = Math.min(0.15 + (extremeness * 0.1), 0.25);
          const positionValue = allocatedCapital * allocationPct;
          const shares = Math.floor(positionValue / currentPrice);

          signals.push({
            action: 'buy',
            symbol,
            quantity: shares,
            confidence,
            reason: `Oversold: Z-Score ${zScore.toFixed(2)}, Below BB Lower, Vol ${volumeProfile.volumeRatio.toFixed(2)}x`
          });

          console.log(`✅ BUY (oversold) signal for ${symbol}: Confidence ${(confidence * 100).toFixed(1)}%`);
        }
      }

      // SELL overbought condition
      if (currentPrice > bb.upper && 
          zScore > zScoreThreshold && 
          volumeProfile.volumeRatio > volumeMultiplier) {
        
        const confidence = calculateMeanReversionConfidence(
          zScore, currentPrice, bb, volumeProfile
        );
        
        if (confidence > 0.5) {
          signals.push({
            action: 'sell',
            symbol,
            quantity: 0, // Will be calculated from existing position
            confidence,
            reason: `Overbought: Z-Score ${zScore.toFixed(2)}, Above BB Upper, Vol ${volumeProfile.volumeRatio.toFixed(2)}x`
          });

          console.log(`✅ SELL (overbought) signal for ${symbol}: Confidence ${(confidence * 100).toFixed(1)}%`);
        }
      }

    } catch (error) {
      console.error(`Error in mean reversion for ${symbol}:`, error);
      continue;
    }
  }

  return signals;
}

/**
 * Helper: Calculate mean reversion confidence
 */
function calculateMeanReversionConfidence(
  zScore: number,
  currentPrice: number,
  bb: BollingerBands,
  volumeProfile: { volumeRatio: number }
): number {
  // Z-Score confidence (0.4 weight)
  const zScoreConfidence = Math.min(Math.abs(zScore) / 3, 1.0) * 0.4;
  
  // Bollinger Band confidence (0.3 weight)
  const bbConfidence = calculateBBConfidence(currentPrice, bb) * 0.3;
  
  // Volume confirmation (0.3 weight)
  const volumeConfidence = volumeProfile.volumeRatio > 1.2 ? 0.3 : 0;
  
  return zScoreConfidence + bbConfidence + volumeConfidence;
}

/**
 * Helper: Calculate Bollinger Band confidence
 */
function calculateBBConfidence(currentPrice: number, bb: BollingerBands): number {
  // Distance from band as percentage
  if (currentPrice < bb.lower) {
    return Math.min((bb.lower - currentPrice) / bb.lower, 0.3);
  }
  if (currentPrice > bb.upper) {
    return Math.min((currentPrice - bb.upper) / bb.upper, 0.3);
  }
  return 0;
}

/**
 * BREAKOUT STRATEGY
 * Trades volatility expansion and price breakouts using Donchian Channels
 */
export async function runBreakoutStrategy(
  ampId: string,
  allocatedCapital: number,
  settings: {
    donchianPeriod?: number;
    volumeMultiplier?: number;
    atrPeriod?: number;
    atrMultiplier?: number;
    symbols?: string[];
  } = {}
): Promise<StrategySignal[]> {
  console.log('💥 Running breakout strategy for amp:', ampId);
  
  const signals: StrategySignal[] = [];
  const symbols = settings.symbols || ['NVDA', 'TSLA', 'AMD', 'COIN'];
  
  const donchianPeriod = settings.donchianPeriod || 20;
  const volumeMultiplier = settings.volumeMultiplier || 2.0;
  const atrPeriod = settings.atrPeriod || 14;

  for (const symbol of symbols) {
    try {
      const marketData = await fetchMarketData(symbol, 30);
      
      if (marketData.length < donchianPeriod) {
        console.log(`⚠️ Insufficient data for ${symbol}`);
        continue;
      }

      const currentPrice = marketData[marketData.length - 1].close;

      // Calculate indicators
      const donchian = calculateDonchianChannels(marketData, donchianPeriod);
      const atr = calculateATR(marketData, atrPeriod);
      
      // Calculate ATR moving average
      const atrValues: number[] = [];
      for (let i = atrPeriod; i < marketData.length; i++) {
        const slice = marketData.slice(i - atrPeriod, i);
        atrValues.push(calculateATR(slice, atrPeriod));
      }
      const atrMA = calculateSMA(atrValues, Math.min(14, atrValues.length));
      
      const volumeProfile = calculateVolumeProfile(marketData, 20);

      // Upside breakout
      if (currentPrice > donchian.upper && 
          volumeProfile.volumeRatio > volumeMultiplier &&
          atr > atrMA * 1.5) {
        
        const confidence = calculateBreakoutConfidence(
          'buy',
          currentPrice,
          donchian,
          volumeProfile,
          atr,
          atrMA
        );
        
        if (confidence > 0.6) { // Higher threshold for breakouts
          const positionValue = allocatedCapital * 0.20;
          const shares = Math.floor(positionValue / currentPrice);

          signals.push({
            action: 'buy',
            symbol,
            quantity: shares,
            confidence,
            reason: `Upside breakout: New ${donchianPeriod}-day high, Volume ${volumeProfile.volumeRatio.toFixed(1)}x, ATR expanding`
          });

          console.log(`✅ BUY (breakout) signal for ${symbol}: Confidence ${(confidence * 100).toFixed(1)}%`);
        }
      }

      // Downside breakout (for shorting or avoiding longs)
      if (currentPrice < donchian.lower && 
          volumeProfile.volumeRatio > volumeMultiplier) {
        
        const confidence = calculateBreakoutConfidence(
          'sell',
          currentPrice,
          donchian,
          volumeProfile,
          atr,
          atrMA
        );
        
        if (confidence > 0.6) {
          signals.push({
            action: 'sell',
            symbol,
            quantity: 0, // Will calculate from position
            confidence,
            reason: `Downside breakout: New ${donchianPeriod}-day low, Volume ${volumeProfile.volumeRatio.toFixed(1)}x`
          });

          console.log(`✅ SELL (breakout) signal for ${symbol}: Confidence ${(confidence * 100).toFixed(1)}%`);
        }
      }

    } catch (error) {
      console.error(`Error in breakout strategy for ${symbol}:`, error);
      continue;
    }
  }

  return signals;
}

/**
 * Helper: Calculate Donchian Channels
 */
function calculateDonchianChannels(
  bars: PriceBar[], 
  period: number = 20
): { upper: number; lower: number; middle: number } {
  const recentBars = bars.slice(-period);
  const highs = recentBars.map(b => b.high);
  const lows = recentBars.map(b => b.low);
  
  const upper = Math.max(...highs);
  const lower = Math.min(...lows);
  
  return {
    upper,
    lower,
    middle: (upper + lower) / 2
  };
}

/**
 * Helper: Calculate breakout confidence
 */
function calculateBreakoutConfidence(
  direction: 'buy' | 'sell',
  currentPrice: number,
  donchian: { upper: number; lower: number; middle: number },
  volumeProfile: { volumeRatio: number },
  atr: number,
  atrMA: number
): number {
  // Volume component (0-0.4)
  const volumeConf = Math.min((volumeProfile.volumeRatio - 1) * 0.2, 0.4);
  
  // ATR expansion component (0-0.3)
  const atrExpansion = atr / atrMA;
  const atrConf = atrExpansion > 1.5 ? 0.3 : Math.max((atrExpansion - 1) * 0.6, 0);
  
  // Breakout strength component (0-0.3)
  let breakoutConf = 0;
  if (direction === 'buy') {
    const breakoutPct = (currentPrice - donchian.upper) / donchian.upper;
    breakoutConf = Math.min(breakoutPct * 15, 0.3); // 2% breakout = max confidence
  } else {
    const breakoutPct = (donchian.lower - currentPrice) / donchian.lower;
    breakoutConf = Math.min(breakoutPct * 15, 0.3);
  }
  
  return volumeConf + atrConf + breakoutConf;
}

export async function executeStrategy(ampId: string) {
  console.log('🎯 Executing strategy for amp:', ampId);

  // Get amp details
  const { data: amp, error } = await supabase
    .from('user_amps')
    .select('*')
    .eq('id', ampId)
    .single();

  if (error) {
    console.error('❌ Failed to fetch amp:', error);
    return [];
  }

  if (!amp || amp.status !== 'active') {
    console.log('⏸️ Amp not active, skipping');
    return [];
  }

  const allocatedCapital = parseFloat(amp.allocated_capital.toString());
  let signals: StrategySignal[] = [];

  // Run appropriate strategy
  switch (amp.strategy_type) {
    case 'momentum':
      signals = await runMomentumStrategy(ampId, allocatedCapital);
      break;
    case 'mean_reversion':
      signals = await runMeanReversionStrategy(ampId, allocatedCapital);
      break;
    case 'breakout':
      signals = await runBreakoutStrategy(ampId, allocatedCapital);
      break;
    default:
      console.log('⚠️ Unknown strategy type:', amp.strategy_type);
  }

  console.log(`✅ Strategy execution complete: ${signals.length} signals generated`);
  return signals;
}
