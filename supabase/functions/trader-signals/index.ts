import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

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
    action: 'BUY',
    confidence: 78,
    targetPrice: 185.00,
    currentPrice: 182.45,
    reasoning: 'Strong support level with positive catalysts',
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

async function storeSignalsInDatabase(signals: TradingSignal[]) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Storing ${signals.length} signals in database...`);

  // Only store BUY and SELL signals with confidence >= 70
  const executableSignals = signals.filter(s => 
    (s.action === 'BUY' || s.action === 'SELL') && s.confidence >= 70
  );

  if (executableSignals.length === 0) {
    console.log('No executable signals to store');
    return;
  }

  const signalsToStore = executableSignals.map(signal => ({
    symbol: signal.symbol,
    signal_type: signal.action.toLowerCase(),
    confidence_score: signal.confidence,
    target_price: signal.targetPrice,
    current_price: signal.currentPrice,
    reasoning: signal.reasoning,
    status: 'active',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    stop_loss_price: signal.action === 'BUY' 
      ? signal.currentPrice * 0.98 
      : signal.currentPrice * 1.02,
    take_profit_price: signal.action === 'BUY'
      ? signal.targetPrice
      : signal.targetPrice
  }));

  const { error } = await supabase
    .from('trading_signals')
    .upsert(signalsToStore, { 
      onConflict: 'symbol',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error storing signals:', error);
  } else {
    console.log(`Successfully stored ${signalsToStore.length} signals`);
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

    // Store signals in database for execute-trades to use
    await storeSignalsInDatabase(signals);

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