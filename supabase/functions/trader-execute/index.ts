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

async function executeTradeViaAPI(tradeRequest: TradeRequest): Promise<TradeResponse> {
  try {
    console.log('Attempting to execute trade via API:', tradeRequest);
    
    // Placeholder for future API integration
    // const response = await fetch(`${TRADING_API_URL}/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${API_TOKEN}`
    //   },
    //   body: JSON.stringify(tradeRequest)
    // });
    
    // For now, simulate trade execution with demo response
    const simulatedResponse: TradeResponse = {
      orderId: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // Simulate pending status for regulatory compliance
      symbol: tradeRequest.symbol,
      action: tradeRequest.action,
      quantity: tradeRequest.quantity,
      timestamp: new Date().toISOString(),
      message: 'Trading will be enabled after regulatory approval'
    };
    
    console.log('Simulated trade execution:', simulatedResponse);
    return simulatedResponse;
    
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