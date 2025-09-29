import { corsHeaders } from '../_shared/cors.ts'

const PYTHON_API_URL = 'http://localhost:8080';

interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  timestamp: string;
}

// Demo data matching the TradingDashboard
const DEMO_SIGNALS: TradingSignal[] = [
  {
    symbol: 'NVDA',
    action: 'BUY',
    confidence: 82,
    targetPrice: 485.25,
    currentPrice: 480.10,
    reasoning: 'Strong momentum with bullish volume pattern',
    timestamp: new Date().toISOString()
  },
  {
    symbol: 'TSLA',
    action: 'SELL', 
    confidence: 75,
    targetPrice: 275.50,
    currentPrice: 280.25,
    reasoning: 'Bearish divergence on technical indicators',
    timestamp: new Date().toISOString()
  },
  {
    symbol: 'AAPL',
    action: 'HOLD',
    confidence: 65,
    targetPrice: 185.00,
    currentPrice: 182.45,
    reasoning: 'Consolidating within support/resistance range',
    timestamp: new Date().toISOString()
  }
];

async function fetchSignalsFromPythonAPI(): Promise<TradingSignal[]> {
  try {
    console.log('Attempting to fetch signals from Python API...');
    
    const response = await fetch(`${PYTHON_API_URL}/signals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Python API responded with ${response.status}`);
    }

    const signals = await response.json();
    console.log('Successfully fetched signals from Python API');
    return signals;
    
  } catch (error) {
    console.warn('Failed to fetch from Python API, using demo data:', error instanceof Error ? error.message : String(error));
    return DEMO_SIGNALS;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching trading signals...');

    // Try to fetch from Python API, fallback to demo data
    const signals = await fetchSignalsFromPythonAPI();

    const response = {
      success: true,
      data: signals,
      timestamp: new Date().toISOString(),
      source: signals === DEMO_SIGNALS ? 'demo' : 'python_api'
    };

    console.log(`Returning ${signals.length} trading signals`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in trader-signals function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch trading signals',
        data: DEMO_SIGNALS, // Fallback to demo data
        source: 'demo_fallback'
      }),
      { 
        status: 200, // Return 200 with demo data rather than error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});