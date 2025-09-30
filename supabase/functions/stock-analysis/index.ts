import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');

interface StockAnalysis {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  analysis: string;
}

async function fetchStockQuote(symbol: string) {
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
  
  const data = await response.json();
  return data.results?.[0];
}

async function fetchTickerDetails(symbol: string) {
  const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apikey=${POLYGON_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch details for ${symbol}`);
  }
  
  const data = await response.json();
  return data.results;
}

async function generateAnalysis(symbol: string, quote: any, details: any): Promise<string> {
  const priceChange = ((quote.c - quote.o) / quote.o * 100).toFixed(2);
  const trend = parseFloat(priceChange) > 0 ? 'upward' : 'downward';
  
  // Generate contextual analysis based on real data
  const volumeDescription = quote.v > 1000000 ? 'high trading volume' : 'moderate trading volume';
  const momentumDescription = Math.abs(parseFloat(priceChange)) > 2 ? 'strong momentum' : 'stable momentum';
  
  return `${details.name} is showing ${momentumDescription} with ${volumeDescription}. ` +
    `Recent price action indicates ${trend} pressure. ` +
    `Current technical indicators suggest ${parseFloat(priceChange) > 0 ? 'bullish' : 'bearish'} sentiment in the near term.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: symbols array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching analysis for ${symbols.length} symbols:`, symbols);

    const analyses: StockAnalysis[] = [];

    for (const symbol of symbols) {
      try {
        // Fetch quote and details in parallel
        const [quote, details] = await Promise.all([
          fetchStockQuote(symbol),
          fetchTickerDetails(symbol)
        ]);

        if (!quote) {
          console.warn(`No quote data for ${symbol}`);
          continue;
        }

        const analysis = await generateAnalysis(symbol, quote, details);

        analyses.push({
          symbol,
          currentPrice: quote.c,
          change: quote.c - quote.o,
          changePercent: ((quote.c - quote.o) / quote.o) * 100,
          volume: quote.v,
          marketCap: details.market_cap,
          analysis
        });
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
        // Continue with other symbols
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analyses,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in stock-analysis function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
