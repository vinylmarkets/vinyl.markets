import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TradeRequest {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop';
  limitPrice?: number;
  stopPrice?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
}

interface TradeResponse {
  orderId: string;
  status: 'filled' | 'pending' | 'rejected' | 'cancelled';
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  fillPrice?: number;
  fillQuantity?: number;
  timestamp: string;
  message: string;
}

async function executeTradeViaAPI(tradeRequest: TradeRequest, userId: string): Promise<TradeResponse> {
  try {
    console.log('Attempting to execute trade via Alpaca API:', tradeRequest);
    
    // Get Alpaca credentials from environment
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
    
    if (!alpacaApiKey || !alpacaSecret) {
      console.log('Alpaca credentials not configured, using paper trading simulation');
      return simulatePaperTrade(tradeRequest, userId);
    }
    
    // Convert our trade request to Alpaca format
    const alpacaOrder = {
      symbol: tradeRequest.symbol,
      qty: tradeRequest.quantity,
      side: tradeRequest.action.toLowerCase(),
      type: tradeRequest.orderType,
      time_in_force: tradeRequest.timeInForce.toUpperCase(),
      ...(tradeRequest.limitPrice && { limit_price: tradeRequest.limitPrice }),
      ...(tradeRequest.stopPrice && { stop_price: tradeRequest.stopPrice })
    };
    
    console.log('Alpaca order payload:', alpacaOrder);
    
    // Execute trade via Alpaca API
    const response = await fetch(`${alpacaBaseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret
      },
      body: JSON.stringify(alpacaOrder)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Alpaca API error response:', errorData);
      
      // If stock not found in Alpaca, fall back to paper trading simulation
      if (response.status === 404 || errorData.includes('not found') || errorData.includes('not_found')) {
        console.log(`${tradeRequest.symbol} not available in Alpaca, using paper trading simulation`);
        return simulatePaperTrade(tradeRequest, userId);
      }
      
      let errorMessage = errorData;
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorData;
      } catch (e) {
        // Error is not JSON, use as-is
      }
      
      throw new Error(`Order rejected: ${errorMessage}`);
    }
    
    const alpacaOrderResult = await response.json();
    console.log('Alpaca order result:', alpacaOrderResult);
    
    // Convert Alpaca response to our format
    const tradeResponse: TradeResponse = {
      orderId: alpacaOrderResult.id,
      status: alpacaOrderResult.status === 'filled' ? 'filled' : 'pending',
      symbol: alpacaOrderResult.symbol,
      action: alpacaOrderResult.side.toUpperCase() as 'BUY' | 'SELL',
      quantity: parseInt(alpacaOrderResult.qty),
      fillPrice: alpacaOrderResult.filled_avg_price ? parseFloat(alpacaOrderResult.filled_avg_price) : undefined,
      fillQuantity: alpacaOrderResult.filled_qty ? parseInt(alpacaOrderResult.filled_qty) : undefined,
      timestamp: alpacaOrderResult.created_at || new Date().toISOString(),
      message: `Order ${alpacaOrderResult.status} via Alpaca`
    };
    
    console.log('Trade executed successfully via Alpaca:', tradeResponse);
    return tradeResponse;
    
  } catch (error) {
    console.error('Failed to execute trade:', error instanceof Error ? error.message : String(error));
    throw new Error(`Trade execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getMarketPrice(symbol: string): Promise<number> {
  try {
    const polygonKey = Deno.env.get('POLYGON_API_KEY');
    if (!polygonKey) {
      console.log('Polygon API key not found, using default price');
      return 10.00; // Default fallback price
    }

    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${polygonKey}`
    );

    if (!response.ok) {
      console.error('Failed to fetch price from Polygon');
      return 10.00;
    }

    const data = await response.json();
    if (data.results && data.results[0]) {
      return data.results[0].c; // closing price
    }

    return 10.00;
  } catch (error) {
    console.error('Error fetching market price:', error);
    return 10.00;
  }
}

async function storePaperTrade(
  tradeRequest: TradeRequest,
  fillPrice: number,
  userId: string
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Storing paper trade for user:', userId);

  // Get or create paper account
  const { data: accounts, error: accountError } = await supabase
    .from('paper_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1);

  if (accountError) {
    console.error('Error fetching paper account:', accountError);
    throw new Error('Failed to fetch paper account');
  }

  let accountId: string;
  let currentCash: number;

  if (!accounts || accounts.length === 0) {
    // Create new paper account
    const { data: newAccount, error: createError } = await supabase
      .from('paper_accounts')
      .insert({
        user_id: userId,
        account_name: 'Paper Trading Account',
        initial_balance: 100000,
        current_cash: 100000,
        total_equity: 100000,
        is_active: true
      })
      .select()
      .single();

    if (createError || !newAccount) {
      console.error('Error creating paper account:', createError);
      throw new Error('Failed to create paper account');
    }

    accountId = newAccount.id;
    currentCash = 100000;
  } else {
    accountId = accounts[0].id;
    currentCash = accounts[0].current_cash;
  }

  const totalCost = fillPrice * tradeRequest.quantity;

  if (tradeRequest.action === 'BUY') {
    // Check if user has enough cash
    if (currentCash < totalCost) {
      throw new Error('Insufficient funds for this trade');
    }

    // Update or create position
    const { data: existingPosition } = await supabase
      .from('paper_positions')
      .select('*')
      .eq('account_id', accountId)
      .eq('symbol', tradeRequest.symbol)
      .eq('side', 'long')
      .maybeSingle();

    if (existingPosition) {
      // Update existing position
      const newQuantity = existingPosition.quantity + tradeRequest.quantity;
      const newAverageCost =
        (existingPosition.average_cost * existingPosition.quantity +
          fillPrice * tradeRequest.quantity) /
        newQuantity;

      await supabase
        .from('paper_positions')
        .update({
          quantity: newQuantity,
          average_cost: newAverageCost,
          current_price: fillPrice,
          market_value: newQuantity * fillPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPosition.id);
    } else {
      // Create new position
      await supabase.from('paper_positions').insert({
        account_id: accountId,
        symbol: tradeRequest.symbol,
        quantity: tradeRequest.quantity,
        average_cost: fillPrice,
        current_price: fillPrice,
        market_value: totalCost,
        side: 'long',
        asset_type: 'stock'
      });
    }

    // Update account cash
    await supabase
      .from('paper_accounts')
      .update({
        current_cash: currentCash - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);
  }

  // Create transaction record
  await supabase.from('paper_transactions').insert({
    account_id: accountId,
    symbol: tradeRequest.symbol,
    transaction_type: tradeRequest.action.toLowerCase(),
    quantity: tradeRequest.quantity,
    price: fillPrice,
    total_amount: totalCost,
    order_type: tradeRequest.orderType
  });

  console.log('Paper trade stored successfully');
}

async function simulatePaperTrade(tradeRequest: TradeRequest, userId: string): Promise<TradeResponse> {
  console.log('Simulating paper trade:', tradeRequest);
  
  // Get current market price
  const fillPrice = await getMarketPrice(tradeRequest.symbol);
  console.log(`Market price for ${tradeRequest.symbol}: $${fillPrice}`);
  
  // Store the trade in the database
  await storePaperTrade(tradeRequest, fillPrice, userId);
  
  // Simulate trade execution with local paper trading
  const simulatedResponse: TradeResponse = {
    orderId: `PAPER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'filled',
    symbol: tradeRequest.symbol,
    action: tradeRequest.action,
    quantity: tradeRequest.quantity,
    fillPrice: fillPrice,
    fillQuantity: tradeRequest.quantity,
    timestamp: new Date().toISOString(),
    message: `Paper trade executed at $${fillPrice.toFixed(2)}`
  };
  
  console.log('Paper trade simulated:', simulatedResponse);
  return simulatedResponse;
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

    console.log('Processing trade execution request:', tradeRequest);

    // Validate required fields
    if (!tradeRequest.symbol || !tradeRequest.action || !tradeRequest.quantity) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: symbol, action, quantity' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate action
    if (!['BUY', 'SELL'].includes(tradeRequest.action)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid action. Must be BUY or SELL' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate quantity
    if (tradeRequest.quantity <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Quantity must be greater than 0' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authorization required' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid authentication' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tradeResponse = await executeTradeViaAPI(tradeRequest, user.id);

    const response = {
      success: true,
      data: tradeResponse,
      timestamp: new Date().toISOString()
    };

    console.log('Trade execution completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in trader-execute function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to execute trade'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});