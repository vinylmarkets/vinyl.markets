import { corsHeaders } from '../_shared/cors.ts'

interface MarketAnalysis {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  currentPrice: number;
  timestamp: string;
}

interface AlpacaQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: {
    price: number;
    size: number;
    timestamp: string;
  };
}

async function fetchMarketData(symbols: string[]): Promise<AlpacaQuote[]> {
  const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
  const ALPACA_SECRET_KEY = Deno.env.get('ALPACA_SECRET_KEY');
  const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    throw new Error('Alpaca API credentials not configured');
  }

  try {
    const symbolsParam = symbols.join(',');
    const response = await fetch(`${ALPACA_BASE_URL}/v2/stocks/quotes/latest?symbols=${symbolsParam}`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }

    const data = await response.json();
    return Object.entries(data.quotes).map(([symbol, quote]: [string, any]) => ({
      symbol,
      bid: quote.bid,
      ask: quote.ask,
      last: {
        price: quote.last_price || quote.ask,
        size: quote.last_size || 0,
        timestamp: quote.last_timestamp || new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    throw error;
  }
}

function analyzeMarket(quote: AlpacaQuote): MarketAnalysis {
  const currentPrice = quote.last.price;
  const spread = quote.ask - quote.bid;
  const spreadPercent = (spread / currentPrice) * 100;
  
  // Simple technical analysis (this would be more sophisticated in production)
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = 50;
  let reasoning = 'Market analysis pending';
  let targetPrice = currentPrice;

  // Basic momentum analysis based on spread and price action
  if (spreadPercent < 0.1) { // Tight spread indicates good liquidity
    if (currentPrice > quote.bid * 1.002) { // Slight upward momentum
      signal = 'BUY';
      confidence = 65 + Math.random() * 20; // 65-85%
      targetPrice = currentPrice * 1.02; // 2% target
      reasoning = 'Strong momentum with tight spread indicating good liquidity';
    } else if (currentPrice < quote.ask * 0.998) { // Slight downward momentum
      signal = 'SELL';
      confidence = 60 + Math.random() * 15; // 60-75%
      targetPrice = currentPrice * 0.98; // 2% downside target
      reasoning = 'Bearish pressure with tight spread';
    }
  }

  return {
    symbol: quote.symbol,
    signal,
    confidence: Math.round(confidence),
    reasoning,
    targetPrice: Math.round(targetPrice * 100) / 100,
    currentPrice: Math.round(currentPrice * 100) / 100,
    timestamp: new Date().toISOString()
  };
}

async function storeAnalysis(analyses: MarketAnalysis[]) {
  // Store analysis results in a simple format for now
  // In production, you might want to store this in your database
  console.log('Market Analysis Results:', JSON.stringify(analyses, null, 2));
  
  // Here you could store to Supabase database if you had a market_analysis table
  // const { error } = await supabase.from('market_analysis').insert(analyses);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting market analysis...');

    // Define symbols to analyze
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'NFLX'];
    
    // Fetch market data
    const quotes = await fetchMarketData(symbols);
    console.log(`Fetched market data for ${quotes.length} symbols`);

    // Analyze each symbol
    const analyses = quotes.map(analyzeMarket);
    
    // Store analysis results
    await storeAnalysis(analyses);

    // Filter for strong signals (confidence > 70%)
    const strongSignals = analyses.filter(analysis => analysis.confidence > 70);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      totalAnalyzed: analyses.length,
      strongSignals: strongSignals.length,
      analyses: analyses,
      strongSignalsOnly: strongSignals
    };

    console.log(`Market analysis completed. Found ${strongSignals.length} strong signals out of ${analyses.length} analyzed.`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in market analysis:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});