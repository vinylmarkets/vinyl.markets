import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TradingSignal {
  id: string;
  symbol: string;
  strategy_type: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  confidence_score: number;
  current_price: number;
  target_price?: number;
  stop_loss_price?: number;
  reasoning: string;
  market_data: any;
  strategy_params: any;
  generated_at: string;
  expires_at: string;
  executed: boolean;
}

interface RiskSettings {
  max_position_size: number;
  max_portfolio_risk: number;
  daily_loss_limit: number;
  max_open_positions: number;
  stop_loss_percent: number;
  take_profit_percent: number;
  min_confidence_score: number;
  trading_enabled: boolean;
}

interface AlpacaOrder {
  id: string;
  symbol: string;
  side: string;
  order_type: string;
  qty: string;
  filled_qty: string;
  status: string;
  created_at: string;
  filled_at?: string;
  filled_avg_price?: string;
}

async function getRiskSettings(): Promise<RiskSettings> {
  const { data, error } = await supabase
    .from('trading.risk_settings')
    .select('*')
    .limit(1)
    .single();
    
  if (error) {
    console.warn('Failed to fetch risk settings, using defaults:', error);
    return {
      max_position_size: 1000,
      max_portfolio_risk: 0.02,
      daily_loss_limit: 500,
      max_open_positions: 10,
      stop_loss_percent: 0.02,
      take_profit_percent: 0.04,
      min_confidence_score: 75,
      trading_enabled: true
    };
  }
  
  return data;
}

async function getExecutableSignals(minConfidence: number): Promise<TradingSignal[]> {
  const { data, error } = await supabase
    .from('trading.signals')
    .select('*')
    .eq('executed', false)
    .gte('confidence_score', minConfidence)
    .gt('expires_at', new Date().toISOString())
    .order('confidence_score', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('Error fetching signals:', error);
    return [];
  }
  
  return data || [];
}

async function getCurrentPositions() {
  const { data, error } = await supabase
    .from('trading.positions')
    .select('*')
    .eq('status', 'open');
    
  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
  
  return data || [];
}

async function getTodaysPnL(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('trading.daily_performance')
    .select('net_pnl')
    .eq('trading_date', today)
    .single();
    
  if (error || !data) {
    return 0;
  }
  
  return data.net_pnl || 0;
}

function calculatePositionSize(
  signal: TradingSignal, 
  riskSettings: RiskSettings, 
  accountBalance: number = 100000 // Default paper trading balance
): number {
  const maxRiskAmount = Math.min(
    riskSettings.max_position_size,
    accountBalance * riskSettings.max_portfolio_risk
  );
  
  const stopLossDistance = signal.stop_loss_price 
    ? Math.abs(signal.current_price - signal.stop_loss_price) 
    : signal.current_price * riskSettings.stop_loss_percent;
    
  const shares = Math.floor(maxRiskAmount / stopLossDistance);
  const maxShares = Math.floor(riskSettings.max_position_size / signal.current_price);
  
  return Math.min(shares, maxShares);
}

async function executeAlpacaOrder(
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number,
  orderType: 'market' | 'limit' = 'market',
  limitPrice?: number
): Promise<AlpacaOrder> {
  const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
  const ALPACA_SECRET_KEY = Deno.env.get('ALPACA_SECRET_KEY');
  const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    throw new Error('Alpaca API credentials not configured');
  }

  const orderPayload = {
    symbol,
    qty: quantity,
    side,
    type: orderType,
    time_in_force: 'day',
    ...(limitPrice && { limit_price: limitPrice })
  };

  console.log('Submitting order to Alpaca:', JSON.stringify(orderPayload));

  const response = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
    method: 'POST',
    headers: {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alpaca order failed: ${response.status} - ${errorText}`);
  }

  const order = await response.json();
  console.log('Order submitted successfully:', order.id);
  return order;
}

async function createPosition(signal: TradingSignal, order: AlpacaOrder, quantity: number) {
  const side = signal.signal_type === 'BUY' ? 'long' : 'short';
  
  const position = {
    symbol: signal.symbol,
    side,
    quantity,
    entry_price: signal.current_price,
    current_price: signal.current_price,
    market_value: quantity * signal.current_price,
    unrealized_pnl: 0,
    unrealized_pnl_percent: 0,
    stop_loss_price: signal.stop_loss_price,
    take_profit_price: signal.target_price,
    signal_id: signal.id,
    alpaca_order_id: order.id,
    status: 'open'
  };
  
  const { error } = await supabase
    .from('trading.positions')
    .insert(position);
    
  if (error) {
    console.error('Error creating position:', error);
    throw error;
  }
  
  // Mark signal as executed
  await supabase
    .from('trading.signals')
    .update({ executed: true })
    .eq('id', signal.id);
}

async function checkRiskLimits(
  riskSettings: RiskSettings, 
  openPositions: any[], 
  todaysPnL: number
): Promise<{ canTrade: boolean; reason?: string }> {
  
  if (!riskSettings.trading_enabled) {
    return { canTrade: false, reason: 'Trading is disabled' };
  }
  
  if (openPositions.length >= riskSettings.max_open_positions) {
    return { canTrade: false, reason: 'Maximum open positions reached' };
  }
  
  if (todaysPnL <= -riskSettings.daily_loss_limit) {
    return { canTrade: false, reason: 'Daily loss limit reached' };
  }
  
  return { canTrade: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Execute trades function starting...');
    
    // Get risk settings
    const riskSettings = await getRiskSettings();
    console.log('Risk settings loaded:', riskSettings);
    
    // Get current positions and today's P&L
    const [openPositions, todaysPnL] = await Promise.all([
      getCurrentPositions(),
      getTodaysPnL()
    ]);
    
    // Check risk limits
    const riskCheck = await checkRiskLimits(riskSettings, openPositions, todaysPnL);
    if (!riskCheck.canTrade) {
      console.log('Risk check failed:', riskCheck.reason);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: riskCheck.reason,
          tradesExecuted: 0,
          riskStatus: 'blocked'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get executable signals
    const signals = await getExecutableSignals(riskSettings.min_confidence_score);
    console.log(`Found ${signals.length} executable signals`);
    
    if (signals.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No signals meet execution criteria',
          tradesExecuted: 0,
          riskStatus: 'clear'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const executedTrades = [];
    const availableSlots = riskSettings.max_open_positions - openPositions.length;
    const signalsToExecute = signals.slice(0, availableSlots);
    
    for (const signal of signalsToExecute) {
      try {
        if (signal.signal_type === 'HOLD') continue;
        
        // Calculate position size
        const quantity = calculatePositionSize(signal, riskSettings);
        if (quantity <= 0) {
          console.log(`Skipping ${signal.symbol}: position size too small`);
          continue;
        }
        
        // Execute order with Alpaca
        const side = signal.signal_type === 'BUY' ? 'buy' : 'sell';
        const order = await executeAlpacaOrder(signal.symbol, side, quantity);
        
        // Create position record
        await createPosition(signal, order, quantity);
        
        executedTrades.push({
          symbol: signal.symbol,
          side: signal.signal_type,
          quantity,
          price: signal.current_price,
          confidence: signal.confidence_score,
          strategy: signal.strategy_type,
          orderId: order.id
        });
        
        console.log(`Executed ${signal.signal_type} ${quantity} ${signal.symbol} @ ${signal.current_price}`);
        
      } catch (error) {
        console.error(`Failed to execute trade for ${signal.symbol}:`, error);
      }
    }
    
    const response = {
      success: true,
      message: `Executed ${executedTrades.length} trades`,
      tradesExecuted: executedTrades.length,
      riskStatus: 'clear',
      timestamp: new Date().toISOString(),
      trades: executedTrades,
      riskSummary: {
        openPositions: openPositions.length,
        maxPositions: riskSettings.max_open_positions,
        todaysPnL,
        dailyLossLimit: riskSettings.daily_loss_limit
      }
    };

    console.log(`Trade execution completed: ${executedTrades.length} trades executed`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Execute trades error:', error);
    
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