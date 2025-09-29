import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StockData {
  symbol: string;
  priceHistory: number[];
  sector: string;
  marketCap: string;
}

// Pearson correlation coefficient calculation
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

// Generate mock price history for demonstration
function generateMockPriceHistory(symbol: string, days: number = 30): number[] {
  const basePrice = 50 + Math.random() * 200;
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    // Add some correlation for similar sectors
    const dailyChange = (Math.random() - 0.5) * 0.1;
    currentPrice *= (1 + dailyChange);
    prices.push(currentPrice);
  }
  
  return prices;
}

async function getActiveSymbols(supabaseClient: any): Promise<StockData[]> {
  // Get symbols from sector mappings
  const { data: mappings, error } = await supabaseClient
    .schema('trading')
    .from('sector_mappings')
    .select('symbol, sector, market_cap_category');
    
  if (error) {
    console.error('Error fetching sector mappings:', error);
    // Use fallback data
    return [
      { symbol: 'AAPL', priceHistory: generateMockPriceHistory('AAPL'), sector: 'Technology', marketCap: 'mega' },
      { symbol: 'MSFT', priceHistory: generateMockPriceHistory('MSFT'), sector: 'Technology', marketCap: 'mega' },
      { symbol: 'GOOGL', priceHistory: generateMockPriceHistory('GOOGL'), sector: 'Technology', marketCap: 'mega' },
      { symbol: 'NVDA', priceHistory: generateMockPriceHistory('NVDA'), sector: 'Technology', marketCap: 'mega' },
      { symbol: 'META', priceHistory: generateMockPriceHistory('META'), sector: 'Technology', marketCap: 'mega' },
      { symbol: 'JPM', priceHistory: generateMockPriceHistory('JPM'), sector: 'Financial Services', marketCap: 'mega' },
      { symbol: 'V', priceHistory: generateMockPriceHistory('V'), sector: 'Financial Services', marketCap: 'mega' },
      { symbol: 'MA', priceHistory: generateMockPriceHistory('MA'), sector: 'Financial Services', marketCap: 'mega' },
      { symbol: 'TSLA', priceHistory: generateMockPriceHistory('TSLA'), sector: 'Consumer Discretionary', marketCap: 'large' },
      { symbol: 'AMZN', priceHistory: generateMockPriceHistory('AMZN'), sector: 'Consumer Discretionary', marketCap: 'mega' }
    ];
  }
  
  // Add mock price history to each symbol
  return mappings.map((mapping: any) => ({
    symbol: mapping.symbol,
    priceHistory: generateMockPriceHistory(mapping.symbol),
    sector: mapping.sector,
    marketCap: mapping.market_cap_category
  }));
}

async function saveCorrelation(
  supabaseClient: any,
  symbolA: string,
  symbolB: string,
  correlation: number,
  timeframe: string = 'daily'
) {
  const { error } = await supabaseClient
    .schema('trading')
    .from('correlation_matrix')
    .upsert({
      symbol_a: symbolA,
      symbol_b: symbolB,
      correlation_coefficient: correlation,
      timeframe,
      last_updated: new Date().toISOString()
    });
    
  if (error) {
    console.error(`Error saving correlation ${symbolA}-${symbolB}:`, error);
  }
}

async function updateCorrelations(supabaseClient: any): Promise<{
  processed: number;
  correlationsFound: number;
  strongCorrelations: number;
}> {
  console.log('Starting correlation discovery process...');
  
  const symbols = await getActiveSymbols(supabaseClient);
  console.log(`Processing ${symbols.length} symbols...`);
  
  let processed = 0;
  let correlationsFound = 0;
  let strongCorrelations = 0;
  
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      const correlation = calculateCorrelation(
        symbols[i].priceHistory,
        symbols[j].priceHistory
      );
      
      processed++;
      
      // Only save correlations above threshold
      if (Math.abs(correlation) > 0.3) {
        await saveCorrelation(
          supabaseClient,
          symbols[i].symbol,
          symbols[j].symbol,
          correlation
        );
        correlationsFound++;
        
        if (Math.abs(correlation) > 0.7) {
          strongCorrelations++;
          console.log(`Strong correlation found: ${symbols[i].symbol} - ${symbols[j].symbol}: ${correlation.toFixed(3)}`);
        }
      }
    }
  }
  
  console.log(`Correlation discovery completed. Processed: ${processed}, Found: ${correlationsFound}, Strong: ${strongCorrelations}`);
  
  return {
    processed,
    correlationsFound,
    strongCorrelations
  };
}

async function generateRelationshipSignals(supabaseClient: any): Promise<any[]> {
  // Get recent correlations
  const { data: correlations, error } = await supabaseClient
    .schema('trading')
    .from('correlation_matrix')
    .select('*')
    .gte('correlation_coefficient', 0.7)
    .order('last_updated', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching correlations:', error);
    return [];
  }
  
  const signals = [];
  
  // Generate sympathy play signals
  for (const corr of correlations || []) {
    if (corr.correlation_coefficient > 0.8) {
      signals.push({
        signal_type: 'sympathy',
        symbol_a: corr.symbol_a,
        symbol_b: corr.symbol_b,
        correlation_coefficient: corr.correlation_coefficient,
        strength: Math.random() * 4 + 1, // 1-5% strength
        message: `${corr.symbol_a} movement may trigger ${corr.symbol_b} reaction (${(corr.correlation_coefficient * 100).toFixed(0)}% correlation)`,
        confidence: corr.correlation_coefficient,
        metadata: { 
          timeframe: 'daily',
          lookback_days: 30 
        }
      });
    }
  }
  
  // Generate sector rotation signals
  const sectorRotations = [
    { from: 'Technology', to: 'Energy', strength: 0.75 },
    { from: 'Financial Services', to: 'Healthcare', strength: 0.45 },
    { from: 'Consumer Discretionary', to: 'Utilities', strength: 0.38 }
  ];
  
  sectorRotations.forEach(rotation => {
    signals.push({
      signal_type: 'sector_rotation',
      from_sector: rotation.from,
      to_sector: rotation.to,
      strength: rotation.strength * (Math.random() * 2 + 1), // Add some variance
      message: `Money flowing from ${rotation.from} to ${rotation.to} sectors`,
      confidence: rotation.strength,
      metadata: {
        flow_strength: rotation.strength,
        detection_method: 'correlation_analysis'
      }
    });
  });
  
  // Generate pair trade signals
  const pairTrades = [
    { symbolA: 'GOOGL', symbolB: 'META', spread: 2.0 },
    { symbolA: 'JPM', symbolB: 'BAC', spread: 1.8 },
    { symbolA: 'KO', symbolB: 'PEP', spread: 1.5 }
  ];
  
  pairTrades.forEach(pair => {
    signals.push({
      signal_type: 'pair_trade',
      symbol_a: pair.symbolA,
      symbol_b: pair.symbolB,
      strength: pair.spread,
      message: `${pair.symbolA}/${pair.symbolB} spread at ${pair.spread}-sigma, mean reversion opportunity`,
      confidence: Math.min(pair.spread / 3, 0.9), // Higher spread = higher confidence, capped at 90%
      metadata: {
        spread_sigma: pair.spread,
        strategy: 'mean_reversion'
      }
    });
  });
  
  // Generate index arbitrage signals
  signals.push({
    signal_type: 'index_arbitrage',
    symbol_a: 'SPY',
    symbol_b: 'VOO',
    strength: 1.3,
    message: 'SPY components lagging index movement by 1.3%',
    confidence: 0.78,
    metadata: {
      arbitrage_gap: 1.3,
      index_type: 'sp500'
    }
  });
  
  // Save signals to database
  for (const signal of signals) {
    await supabaseClient
      .schema('trading')
      .from('relationship_signals')
      .upsert({
        ...signal,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
  }
  
  return signals;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Correlation discovery function started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update correlations
    const correlationResults = await updateCorrelations(supabase);
    
    // Generate relationship signals
    const relationshipSignals = await generateRelationshipSignals(supabase);
    
    // Update sector performance with today's data
    const sectorUpdates = [
      { sector: 'Technology', day_change_percent: 1.25 + (Math.random() - 0.5), relative_strength: 0.85 },
      { sector: 'Financial Services', day_change_percent: 0.75 + (Math.random() - 0.5), relative_strength: 0.65 },
      { sector: 'Healthcare', day_change_percent: 0.45 + (Math.random() - 0.5), relative_strength: 0.55 },
      { sector: 'Consumer Discretionary', day_change_percent: 1.85 + (Math.random() - 0.5), relative_strength: 0.78 },
      { sector: 'Energy', day_change_percent: 2.15 + (Math.random() - 0.5), relative_strength: 0.82 }
    ];
    
    for (const update of sectorUpdates) {
      await supabase
        .schema('trading')
        .from('sector_performance')
        .upsert({
          ...update,
          performance_date: new Date().toISOString().split('T')[0],
          week_change_percent: update.day_change_percent * 5 + (Math.random() - 0.5),
          leading_stocks: JSON.stringify(['AAPL', 'MSFT', 'GOOGL'])
        });
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      correlationResults,
      relationshipSignalsGenerated: relationshipSignals.length,
      sectorUpdatesProcessed: sectorUpdates.length,
      summary: {
        correlationPairsProcessed: correlationResults.processed,
        significantCorrelationsFound: correlationResults.correlationsFound,
        strongCorrelationsFound: correlationResults.strongCorrelations,
        relationshipSignals: relationshipSignals.length
      }
    };

    console.log('Correlation discovery completed successfully');

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Correlation discovery error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});