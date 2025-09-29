import { corsHeaders } from '../_shared/cors.ts'

interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  quantity: number;
  price?: number; // Required for limit orders
  stopPrice?: number; // Required for stop orders
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
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

async function validateTradeRequest(trade: TradeRequest): Promise<{ valid: boolean; error?: string }> {
  // Basic validation
  if (!trade.symbol || !trade.side || !trade.type || !trade.quantity) {
    return { valid: false, error: 'Missing required trade parameters' };
  }

  if (trade.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }

  if (trade.type === 'limit' && !trade.price) {
    return { valid: false, error: 'Limit orders require a price' };
  }

  if (trade.type === 'stop' && !trade.stopPrice) {
    return { valid: false, error: 'Stop orders require a stop price' };
  }

  // Check if market is open (basic check)
  const now = new Date();
  const hour = now.getUTCHours() - 5; // EST
  const isWeekday = now.getUTCDay() >= 1 && now.getUTCDay() <= 5;
  const isMarketHours = hour >= 9.5 && hour < 16; // 9:30 AM to 4:00 PM EST

  if (!isWeekday || !isMarketHours) {
    console.warn('Trade submitted outside market hours - will be queued');
  }

  return { valid: true };
}

async function submitOrderToAlpaca(trade: TradeRequest): Promise<AlpacaOrder> {
  const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
  const ALPACA_SECRET_KEY = Deno.env.get('ALPACA_SECRET_KEY');
  const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    throw new Error('Alpaca API credentials not configured');
  }

  const orderPayload = {
    symbol: trade.symbol,
    qty: trade.quantity,
    side: trade.side,
    type: trade.type,
    time_in_force: trade.timeInForce || 'day',
    ...(trade.price && { limit_price: trade.price }),
    ...(trade.stopPrice && { stop_price: trade.stopPrice })
  };

  console.log('Submitting order to Alpaca:', JSON.stringify(orderPayload));

  try {
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

  } catch (error) {
    console.error('Failed to submit order to Alpaca:', error);
    throw error;
  }
}

async function logTradeExecution(trade: TradeRequest, order: AlpacaOrder | null, error?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    trade: trade,
    order_id: order?.id || null,
    status: order ? 'submitted' : 'failed',
    error: error || null
  };

  console.log('Trade execution log:', JSON.stringify(logEntry));
  
  // Here you could store to a database table for audit trails
  // const { error: dbError } = await supabase.from('trade_executions').insert(logEntry);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tradeRequest: TradeRequest = await req.json();
    console.log('Trade execution request received:', JSON.stringify(tradeRequest));

    // Validate the trade request
    const validation = await validateTradeRequest(tradeRequest);
    if (!validation.valid) {
      await logTradeExecution(tradeRequest, null, validation.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Submit the order to Alpaca
    const order = await submitOrderToAlpaca(tradeRequest);

    // Log the successful execution
    await logTradeExecution(tradeRequest, order);

    const response = {
      success: true,
      orderId: order.id,
      status: order.status,
      symbol: order.symbol,
      side: order.side,
      quantity: order.qty,
      type: order.order_type,
      submittedAt: order.created_at,
      message: 'Trade executed successfully'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error executing trade:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error executing trade',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});