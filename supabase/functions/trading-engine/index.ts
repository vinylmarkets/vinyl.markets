import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Technical indicator calculations
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // neutral if not enough data
  
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(closes: number[]): { macd: number, signal: number, histogram: number } {
  if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12 - ema26;
  
  // For signal line, we'd need more historical MACD values
  // Simplified: use a shorter EMA of recent MACD approximation
  const signal = macd * 0.8; // Simplified signal line
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function calculateEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < closes.length; i++) {
    ema = (closes[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Sector Context Analysis Functions
async function getSector(symbol: string, supabaseClient: any): Promise<string | null> {
  const { data, error } = await supabaseClient
    .schema('trading')
    .from('sector_mappings')
    .select('sector, industry, market_cap_category, correlation_group')
    .eq('symbol', symbol)
    .single();
    
  if (error) {
    console.log(`No sector mapping found for ${symbol}`);
    return null;
  }
  
  return data.sector;
}

async function getSectorStrength(sector: string, supabaseClient: any): Promise<number> {
  const { data, error } = await supabaseClient
    .schema('trading')
    .from('sector_performance')
    .select('relative_strength')
    .eq('sector', sector)
    .eq('performance_date', new Date().toISOString().split('T')[0])
    .single();
    
  if (error || !data) {
    console.log(`No sector performance data found for ${sector}`);
    return 0.5; // neutral
  }
  
  return data.relative_strength || 0.5;
}

async function getCorrelatedStocks(symbol: string, threshold: number, supabaseClient: any): Promise<string[]> {
  const { data, error } = await supabaseClient
    .schema('trading')
    .from('correlation_matrix')
    .select('symbol_a, symbol_b, correlation_coefficient')
    .or(`symbol_a.eq.${symbol},symbol_b.eq.${symbol}`)
    .eq('timeframe', 'daily')
    .gte('correlation_coefficient', threshold);
    
  if (error || !data) {
    return [];
  }
  
  return data.map((row: any) => 
    row.symbol_a === symbol ? row.symbol_b : row.symbol_a
  );
}

async function checkCorrelatedSignals(correlatedSymbols: string[], supabaseClient: any): Promise<number> {
  if (correlatedSymbols.length === 0) return 0.5;
  
  // This would check recent signals for correlated stocks
  // For now, return a mock confirmation score
  const mockConfirmationScore = 0.6 + (Math.random() * 0.3);
  return Math.min(mockConfirmationScore, 1.0);
}

async function analyzeSectorContext(symbol: string, supabaseClient: any): Promise<{
  contextMultiplier: number;
  sectorStrength: number;
  correlatedMovers: string[];
  sector?: string;
}> {
  try {
    // Get the stock's sector
    const sector = await getSector(symbol, supabaseClient);
    
    if (!sector) {
      return {
        contextMultiplier: 1.0,
        sectorStrength: 0.5,
        correlatedMovers: []
      };
    }
    
    // Check sector momentum
    const sectorStrength = await getSectorStrength(sector, supabaseClient);
    
    // Find correlated stocks
    const correlatedSymbols = await getCorrelatedStocks(symbol, 0.7, supabaseClient);
    
    // Adjust signal confidence based on sector context
    let contextMultiplier = 1.0;
    
    if (sectorStrength > 0.8) {
      contextMultiplier = 1.2; // Sector is hot, increase confidence
    } else if (sectorStrength < 0.2) {
      contextMultiplier = 0.8; // Sector is weak, decrease confidence
    }
    
    // Check if correlated stocks are also showing similar signals
    const correlationConfirmation = await checkCorrelatedSignals(correlatedSymbols, supabaseClient);
    if (correlationConfirmation > 0.6) {
      contextMultiplier *= 1.1; // Friends are moving together, good sign
    }
    
    return {
      contextMultiplier,
      sectorStrength,
      correlatedMovers: correlatedSymbols,
      sector
    };
  } catch (error) {
    console.error('Error in sector context analysis:', error);
    return {
      contextMultiplier: 1.0,
      sectorStrength: 0.5,
      correlatedMovers: []
    };
  }
}

// Momentum Strategy
function momentumStrategy(marketData: any) {
  const rsi = calculateRSI(marketData.closes, 14)
  const macd = calculateMACD(marketData.closes)
  const volumeRatio = marketData.volume / marketData.avgVolume

  let signal = 'HOLD'
  let confidence = 0

  if (rsi < 30 && macd.histogram > 0 && volumeRatio > 1.2) {
    signal = 'BUY'
    confidence = 80
  } else if (rsi > 70 && macd.histogram < 0 && volumeRatio > 1.2) {
    signal = 'SELL'
    confidence = 80
  }

  return { signal, confidence, strategy: 'momentum' }
}

// Mean Reversion Strategy
function meanReversionStrategy(marketData: any) {
  const currentPrice = marketData.currentPrice
  const sma20 = marketData.closes.slice(-20).reduce((a: number, b: number) => a + b) / 20
  const stdDev = calculateStdDev(marketData.closes.slice(-20))
  
  const upperBand = sma20 + (stdDev * 2)
  const lowerBand = sma20 - (stdDev * 2)
  const bbPosition = (currentPrice - lowerBand) / (upperBand - lowerBand)

  let signal = 'HOLD'
  let confidence = 0

  if (bbPosition < 0.2) {
    signal = 'BUY'
    confidence = 70
  } else if (bbPosition > 0.8) {
    signal = 'SELL'
    confidence = 70
  }

  return { signal, confidence, strategy: 'mean_reversion' }
}

// ML Strategy (simplified for edge function)
function mlStrategy(marketData: any) {
  // Simplified ML logic - in production, call a proper ML model
  const features = {
    rsi: calculateRSI(marketData.closes, 14),
    priceChange: marketData.change,
    volumeRatio: marketData.volume / marketData.avgVolume
  }

  // Simple decision tree logic as placeholder
  let signal = 'HOLD'
  let confidence = 0

  if (features.rsi < 35 && features.volumeRatio > 1.5) {
    signal = 'BUY'
    confidence = 65
  } else if (features.rsi > 65 && features.priceChange < -2) {
    signal = 'SELL'
    confidence = 65
  }

  return { signal, confidence, strategy: 'ml_prediction' }
}

// Combine all strategies
function combineSignals(signals: any[]) {
  const weights: { [key: string]: number } = { momentum: 0.35, mean_reversion: 0.35, ml_prediction: 0.30 }
  let buyScore = 0
  let sellScore = 0

  signals.forEach((s: any) => {
    const weight = weights[s.strategy] || 0
    if (s.signal === 'BUY') buyScore += s.confidence * weight
    if (s.signal === 'SELL') sellScore += s.confidence * weight
  })

  if (buyScore > 50) return { action: 'BUY', confidence: buyScore }
  if (sellScore > 50) return { action: 'SELL', confidence: sellScore }
  return { action: 'HOLD', confidence: 0 }
}

async function fetchHistoricalData(symbol: string): Promise<any> {
  try {
    // Fetch 30 days of historical data for technical analysis
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const indicators = result.indicators.quote[0];
    
    // Get the last 30 days of closes for technical analysis
    const closes = indicators.close.filter((c: number) => c !== null);
    const volumes = indicators.volume.filter((v: number) => v !== null);
    
    // Calculate average volume (20-day)
    const avgVolume = volumes.slice(-20).reduce((a: number, b: number) => a + b, 0) / Math.min(20, volumes.length);
    
    return {
      symbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: meta.regularMarketVolume,
      avgVolume,
      closes,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow
    };

  } catch (error) {
    console.warn(`Failed to fetch historical data for ${symbol}:`, error);
    
    // Return mock data for testing
    const mockPrice = 100 + Math.random() * 400;
    const mockCloses = Array.from({ length: 30 }, (_, i) => 
      mockPrice + (Math.random() - 0.5) * 20 + Math.sin(i / 5) * 10
    );
    
    return {
      symbol,
      currentPrice: mockPrice,
      previousClose: mockPrice * 0.99,
      change: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      avgVolume: Math.floor(Math.random() * 8000000),
      closes: mockCloses,
      high: mockPrice * 1.03,
      low: mockPrice * 0.97
    };
  }
}

function isMarketOpen(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();
  
  // Convert to EST (UTC-5)
  const estHour = utcHour - 5;
  
  // Market is open Monday-Friday, 9:30 AM - 4:00 PM EST
  const isWeekday = utcDay >= 1 && utcDay <= 5;
  const isMarketHours = estHour >= 9.5 && estHour < 16;
  
  return isWeekday && isMarketHours;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Trading engine starting...');
    
    // Check if market is open
    if (!isMarketOpen()) {
      console.log('Market is closed, skipping signal generation');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Market closed, no signals generated',
          marketStatus: 'closed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN'];
    const allSignals = [];

    console.log(`Analyzing ${symbols.length} symbols...`);

    // Initialize Supabase client for sector analysis
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Process each symbol
    for (const symbol of symbols) {
      try {
        console.log(`Fetching data for ${symbol}...`);
        const marketData = await fetchHistoricalData(symbol);
        
        // Run sector context analysis
        const sectorContext = await analyzeSectorContext(symbol, supabase);
        console.log(`${symbol}: Sector context - ${sectorContext.sector} (strength: ${sectorContext.sectorStrength.toFixed(2)}, multiplier: ${sectorContext.contextMultiplier.toFixed(2)})`);
        
        // Run all three strategies
        const momentumSignal = momentumStrategy(marketData);
        const meanReversionSignal = meanReversionStrategy(marketData);
        const mlSignal = mlStrategy(marketData);
        
        const individualSignals = [momentumSignal, meanReversionSignal, mlSignal];
        
        // Apply sector context to individual signals
        const contextualSignals = individualSignals.map(signal => ({
          ...signal,
          confidence: Math.min(100, signal.confidence * sectorContext.contextMultiplier)
        }));
        
        // Combine signals for final decision
        const combinedSignal = combineSignals(contextualSignals);
        
        // Store only high-confidence individual strategy signals (>= 70%)
        for (const strategySignal of contextualSignals) {
          if (strategySignal.confidence >= 70) {
            allSignals.push({
              symbol,
              action: strategySignal.signal,
              confidence: strategySignal.confidence / 100, // Convert to decimal
              current_price: marketData.currentPrice
            });
          }
        }

        // Store combined signal if high confidence (>= 70%)
        if (combinedSignal.confidence >= 70) {
          allSignals.push({
            symbol,
            action: combinedSignal.action,
            confidence: combinedSignal.confidence / 100, // Convert to decimal
            current_price: marketData.currentPrice
          });
        }

        console.log(`${symbol}: Combined signal = ${combinedSignal.action} (${Math.round(combinedSignal.confidence)}%)`);

      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
      }
    }

    // Store signals in database
    if (allSignals.length > 0) {
      console.log(`Storing ${allSignals.length} signals in database...`);

      // Format signals for trading_signals table
      const formattedSignals = allSignals.map(signal => ({
        symbol: signal.symbol,
        signal_type: signal.action,
        confidence_score: signal.confidence * 100, // Convert back to percentage
        target_price: signal.current_price,
        stop_loss_price: signal.current_price * (signal.action === 'BUY' ? 0.98 : 1.02),
        take_profit_price: signal.current_price * (signal.action === 'BUY' ? 1.04 : 0.96),
        reasoning: `Generated by automated trading engine`,
        signal_data: { 
          strategy: 'combined',
          current_price: signal.current_price
        },
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));

      const { error } = await supabase
        .from('trading_signals')
        .insert(formattedSignals);

      if (error) {
        console.error('Error storing signals:', error);
        throw error;
      }

      console.log('Successfully stored signals in trading_signals table');
    }

    const response = {
      success: true,
      marketStatus: 'open',
      timestamp: new Date().toISOString(),
      symbolsAnalyzed: symbols.length,
      totalSignals: allSignals.length,
      highConfidenceSignals: allSignals.filter(s => s.confidence >= 0.7).length,
      signalBreakdown: {
        totalSignals: allSignals.length,
        highConfidenceOnly: true
      }
    };

    console.log(`Trading engine completed: ${allSignals.length} signals generated`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Trading engine error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})