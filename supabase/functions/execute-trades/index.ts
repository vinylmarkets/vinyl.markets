import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const FUNCTION_VERSION = '1.1.0'; // Fixed user_amps.status query

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TradingSignal {
  id: string;
  user_id: string;
  symbol: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  confidence_score: number;
  target_price?: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  quantity?: number;
  reasoning: string;
  signal_data: any;
  status: string;
  created_at: string;
  expires_at: string;
  executed_at?: string;
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

async function getRiskSettings(userId: string): Promise<RiskSettings> {
  // Get user's trading settings from user_settings table
  const { data: userSettings, error: userError } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();
    
  if (userError || !userSettings?.settings) {
    console.warn('No user settings found, using defaults. Auto-trading disabled.');
    return {
      max_position_size: 1000,
      max_portfolio_risk: 0.02,
      daily_loss_limit: 500,
      max_open_positions: 10,
      stop_loss_percent: 0.02,
      take_profit_percent: 0.04,
      min_confidence_score: 75,
      trading_enabled: false // Disabled by default if no user settings
    };
  }
  
  const settings = userSettings.settings;
  return {
    max_position_size: settings.defaultPositionSize || 1000,
    max_portfolio_risk: (settings.riskTolerance || 3) * 0.01, // Convert risk level to percentage
    daily_loss_limit: (settings.riskTolerance || 3) * 250, // Higher risk = higher loss limit
    max_open_positions: Math.min(10, Math.max(3, settings.riskTolerance * 2)), // 3-10 positions based on risk
    stop_loss_percent: 0.02,
    take_profit_percent: 0.04,
    min_confidence_score: settings.signalThreshold || 75,
    trading_enabled: settings.autoTradeEnabled || false
  };
}

async function getExecutableSignals(minConfidence: number, userId: string): Promise<TradingSignal[]> {
  const { data, error } = await supabase
    .from('trading_signals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
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

async function getCurrentPositions(userId: string) {
  const { data, error } = await supabase
    .from('trading_positions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open');
    
  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
  
  return data || [];
}

async function getTodaysPnL(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('trading.daily_performance')
    .select('net_pnl')
    .eq('user_id', userId)
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
  
  // Get current price from target_price if available, otherwise use a default
  const currentPrice = signal.target_price || 100; // Fallback price
  
  const stopLossDistance = signal.stop_loss_price 
    ? Math.abs(currentPrice - signal.stop_loss_price) 
    : currentPrice * riskSettings.stop_loss_percent;
    
  const shares = Math.floor(maxRiskAmount / stopLossDistance);
  const maxShares = Math.floor(riskSettings.max_position_size / currentPrice);
  
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

async function createPosition(signal: TradingSignal, order: AlpacaOrder, quantity: number, userId: string) {
  const side = signal.signal_type === 'BUY' ? 'long' : 'short';
  const entryPrice = signal.target_price || 100; // Use target_price as entry price
  
  const position = {
    user_id: userId,
    symbol: signal.symbol,
    side,
    quantity,
    entry_price: entryPrice,
    current_price: entryPrice,
    market_value: quantity * entryPrice,
    unrealized_pnl: 0,
    unrealized_pnl_percent: 0,
    stop_loss_price: signal.stop_loss_price,
    take_profit_price: signal.take_profit_price,
    signal_id: signal.id,
    status: 'open'
  };
  
  const { error } = await supabase
    .from('trading_positions')
    .insert(position);
    
  if (error) {
    console.error('Error creating position:', error);
    throw error;
  }
  
  // Mark signal as executed
  await supabase
    .from('trading_signals')
    .update({ status: 'executed', executed_at: new Date().toISOString() })
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
    console.log(`Execute trades function starting... [v${FUNCTION_VERSION}]`);
    
    // Fetch all users with active amps (status = 'active')
    const { data: activeTraders, error: tradersError } = await supabase
      .from('user_amps')
      .select('user_id')
      .eq('status', 'active');
    
    if (tradersError) {
      throw new Error(`Failed to fetch active traders: ${tradersError.message}`);
    }
    
    if (!activeTraders || activeTraders.length === 0) {
      console.log('No active traders found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active traders found',
          totalTradesExecuted: 0,
          userResults: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(activeTraders.map(t => t.user_id))];
    console.log(`Processing trades for ${uniqueUserIds.length} unique users`);
    
    const userResults = [];
    let totalTradesExecuted = 0;
    
    // Loop through each user
    for (const userId of uniqueUserIds) {
      console.log(`\n=== Processing trades for user: ${userId} ===`);
      
      try {
        // Get user's risk settings
        const riskSettings = await getRiskSettings(userId);
        console.log(`User ${userId} risk settings:`, {
          tradingEnabled: riskSettings.trading_enabled,
          minConfidence: riskSettings.min_confidence_score,
          maxPositions: riskSettings.max_open_positions
        });
        
        // Skip if trading is disabled for this user
        if (!riskSettings.trading_enabled) {
          console.log(`User ${userId}: Trading disabled, skipping`);
          userResults.push({
            userId,
            success: true,
            message: 'Trading disabled',
            tradesExecuted: 0
          });
          continue;
        }
        
        // Get current positions and today's P&L for this user
        const [openPositions, todaysPnL] = await Promise.all([
          getCurrentPositions(userId),
          getTodaysPnL(userId)
        ]);
        
        console.log(`User ${userId} current state:`, {
          openPositions: openPositions.length,
          todaysPnL
        });
        
        // Check risk limits
        const riskCheck = await checkRiskLimits(riskSettings, openPositions, todaysPnL);
        if (!riskCheck.canTrade) {
          console.log(`User ${userId}: Risk check failed - ${riskCheck.reason}`);
          userResults.push({
            userId,
            success: true,
            message: riskCheck.reason,
            tradesExecuted: 0,
            riskStatus: 'blocked'
          });
          continue;
        }
        
        // Get executable signals for this user
        const signals = await getExecutableSignals(riskSettings.min_confidence_score, userId);
        console.log(`User ${userId}: Found ${signals.length} executable signals`);
        
        if (signals.length === 0) {
          userResults.push({
            userId,
            success: true,
            message: 'No signals meet execution criteria',
            tradesExecuted: 0,
            riskStatus: 'clear'
          });
          continue;
        }
        
        const executedTrades = [];
        const availableSlots = riskSettings.max_open_positions - openPositions.length;
        const signalsToExecute = signals.slice(0, availableSlots);
        
        console.log(`User ${userId}: Attempting to execute ${signalsToExecute.length} signals`);
        
        for (const signal of signalsToExecute) {
          try {
            if (signal.signal_type === 'HOLD') continue;
            
            // Calculate position size
            const quantity = signal.quantity || calculatePositionSize(signal, riskSettings);
            if (quantity <= 0) {
              console.log(`User ${userId}: Skipping ${signal.symbol} - position size too small`);
              continue;
            }
            
            // Execute order with Alpaca
            const side = signal.signal_type === 'BUY' ? 'buy' : 'sell';
            console.log(`User ${userId}: Executing ${side} ${quantity} ${signal.symbol}`);
            const order = await executeAlpacaOrder(signal.symbol, side, quantity);
            
            // Create position record
            await createPosition(signal, order, quantity, userId);
            
            executedTrades.push({
              symbol: signal.symbol,
              side: signal.signal_type,
              quantity,
              price: signal.target_price || 100,
              confidence: signal.confidence_score,
              orderId: order.id
            });
            
            console.log(`User ${userId}: ✅ Executed ${signal.signal_type} ${quantity} ${signal.symbol} @ ${signal.target_price || 'market'}`);
            
          } catch (error) {
            console.error(`User ${userId}: Failed to execute trade for ${signal.symbol}:`, error);
          }
        }
        
        totalTradesExecuted += executedTrades.length;
        
        userResults.push({
          userId,
          success: true,
          message: `Executed ${executedTrades.length} trades`,
          tradesExecuted: executedTrades.length,
          riskStatus: 'clear',
          trades: executedTrades,
          riskSummary: {
            openPositions: openPositions.length,
            maxPositions: riskSettings.max_open_positions,
            todaysPnL,
            dailyLossLimit: riskSettings.daily_loss_limit
          }
        });
        
        console.log(`User ${userId}: Completed with ${executedTrades.length} trades executed`);
        
      } catch (userError) {
        console.error(`User ${userId}: Error processing trades:`, userError);
        userResults.push({
          userId,
          success: false,
          message: userError instanceof Error ? userError.message : 'Unknown error',
          tradesExecuted: 0
        });
      }
    }
    
    const response = {
      success: true,
      message: `Processed ${uniqueUserIds.length} users, executed ${totalTradesExecuted} total trades`,
      totalTradesExecuted,
      usersProcessed: uniqueUserIds.length,
      timestamp: new Date().toISOString(),
      version: FUNCTION_VERSION,
      userResults
    };

    console.log(`\n=== Trade execution completed [v${FUNCTION_VERSION}] ===`);
    console.log(`Total users processed: ${uniqueUserIds.length}`);
    console.log(`Total trades executed: ${totalTradesExecuted}`);

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