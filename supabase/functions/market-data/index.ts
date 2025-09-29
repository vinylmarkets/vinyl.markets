import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN']
    const marketData = []

    console.log('Fetching market data for symbols:', symbols);

    for (const symbol of symbols) {
      try {
        // Fetch from Yahoo Finance API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        )
        
        if (!response.ok) {
          console.warn(`Failed to fetch data for ${symbol}: ${response.status}`);
          continue;
        }

        const data = await response.json()
        
        if (!data.chart?.result?.[0]) {
          console.warn(`No data returned for ${symbol}`);
          continue;
        }

        const quote = data.chart.result[0].meta
        const indicators = data.chart.result[0].indicators.quote[0]
        
        const changePercent = ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100;
        
        marketData.push({
          symbol,
          current_price: quote.regularMarketPrice,
          volume: quote.regularMarketVolume,
          previous_close: quote.previousClose,
          change_percent: changePercent
        })

        console.log(`Successfully fetched data for ${symbol}: $${quote.regularMarketPrice}`);
        
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Continue with other symbols even if one fails
      }
    }

    if (marketData.length === 0) {
      throw new Error('No market data could be fetched');
    }

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log(`Storing ${marketData.length} market data records in database`);

    const { error: insertError } = await supabase
      .from('trading.market_data')
      .insert(marketData)

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to store market data: ${insertError.message}`);
    }

    console.log('Successfully stored market data in database');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: marketData,
        timestamp: new Date().toISOString(),
        symbolsProcessed: marketData.length
      }), 
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Market data function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
})