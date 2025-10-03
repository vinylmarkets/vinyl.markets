import { corsHeaders } from '../_shared/cors.ts'

const ALPACA_KEY = Deno.env.get('ALPACA_API_KEY')
const ALPACA_SECRET = Deno.env.get('ALPACA_SECRET_KEY')
const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '1M'
    const timeframe = url.searchParams.get('timeframe') || '1D'
    
    console.log(`Fetching portfolio history: period=${period}, timeframe=${timeframe}`);
    
    const response = await fetch(
      `${ALPACA_BASE_URL}/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}`,
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_KEY!,
          'APCA-API-SECRET-KEY': ALPACA_SECRET!
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alpaca API error:', errorText);
      throw new Error(`Alpaca API error: ${response.status}`);
    }
    
    const data = await response.json()
    console.log('Successfully fetched portfolio history');
    
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in trader-portfolio-history function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
