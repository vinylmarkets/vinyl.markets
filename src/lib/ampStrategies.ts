import { supabase } from '@/integrations/supabase/client';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateADX, 
  calculateSMA,
  calculateBollingerBands,
  calculateZScore,
  calculateVolumeProfile,
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
 * Placeholder for future implementation
 */
export async function runBreakoutStrategy(
  ampId: string,
  allocatedCapital: number
): Promise<StrategySignal[]> {
  console.log('📈 Breakout strategy not yet implemented');
  return [];
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
