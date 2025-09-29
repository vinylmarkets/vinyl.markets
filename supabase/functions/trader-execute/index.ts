import { corsHeaders } from '../_shared/cors.ts'

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

async function checkAssetTradeable(symbol: string, alpacaApiKey: string, alpacaSecret: string, alpacaBaseUrl: string): Promise<{ tradeable: boolean; reason?: string }> {
  try {
    const response = await fetch(`${alpacaBaseUrl}/v2/assets/${symbol}`, {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { tradeable: false, reason: 'Symbol not found or delisted' };
      }
      return { tradeable: false, reason: 'Unable to verify symbol' };
    }
    
    const asset = await response.json();
    
    if (asset.status !== 'active') {
      return { tradeable: false, reason: `Asset status: ${asset.status}` };
    }
    
    if (!asset.tradable) {
      return { tradeable: false, reason: 'Asset is not tradeable' };
    }
    
    return { tradeable: true };
  } catch (error) {
    console.error('Error checking asset tradeability:', error);
    return { tradeable: false, reason: 'Error verifying symbol' };
  }
}

async function executeTradeViaAPI(tradeRequest: TradeRequest): Promise<TradeResponse> {
  try {
    console.log('Attempting to execute trade via Alpaca API:', tradeRequest);
    
    // Get Alpaca credentials from environment
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
    
    if (!alpacaApiKey || !alpacaSecret) {
      throw new Error('Alpaca API credentials not configured');
    }
    
    // Check if asset is tradeable first
    const tradeabilityCheck = await checkAssetTradeable(tradeRequest.symbol, alpacaApiKey, alpacaSecret, alpacaBaseUrl);
    if (!tradeabilityCheck.tradeable) {
      throw new Error(`Cannot trade ${tradeRequest.symbol}: ${tradeabilityCheck.reason}`);
    }
    
    // Convert our trade request to Alpaca format
    const alpacaOrder = {
      symbol: tradeRequest.symbol,
      qty: tradeRequest.quantity,
      side: tradeRequest.action.toLowerCase(), // 'buy' or 'sell'
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
    
    console.log('Trade executed successfully:', tradeResponse);
    return tradeResponse;
    
  } catch (error) {
    console.error('Failed to execute trade:', error instanceof Error ? error.message : String(error));
    throw new Error(`Trade execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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

    const tradeResponse = await executeTradeViaAPI(tradeRequest);

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