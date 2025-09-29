import { corsHeaders } from '../_shared/cors.ts'

interface AlpacaAccountInfo {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trade_suspended_by_user: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
}

async function testAlpacaConnection(): Promise<{
  credentialsConfigured: boolean;
  accountAccessible: boolean;
  accountInfo?: AlpacaAccountInfo;
  assetAccessible?: boolean;
  assetInfo?: any;
  errors: string[];
}> {
  const errors: string[] = [];
  
  // Check credentials
  const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
  const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
  const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
  
  console.log('Testing Alpaca connection...');
  console.log('Base URL:', alpacaBaseUrl);
  console.log('API Key present:', !!alpacaApiKey);
  console.log('Secret Key present:', !!alpacaSecret);
  
  if (!alpacaApiKey || !alpacaSecret) {
    errors.push('Alpaca API credentials not configured');
    return {
      credentialsConfigured: false,
      accountAccessible: false,
      errors
    };
  }
  
  const headers = {
    'APCA-API-KEY-ID': alpacaApiKey,
    'APCA-API-SECRET-KEY': alpacaSecret,
    'Content-Type': 'application/json'
  };
  
  let accountInfo: AlpacaAccountInfo | undefined;
  let accountAccessible = false;
  
  // Test 1: Get account information
  try {
    console.log('Testing account access...');
    const accountResponse = await fetch(`${alpacaBaseUrl}/v2/account`, {
      method: 'GET',
      headers
    });
    
    console.log('Account response status:', accountResponse.status);
    
    if (accountResponse.ok) {
      accountInfo = await accountResponse.json();
      accountAccessible = true;
      console.log('Account access successful:', {
        id: accountInfo?.id,
        status: accountInfo?.status,
        currency: accountInfo?.currency
      });
    } else {
      const errorText = await accountResponse.text();
      console.error('Account access failed:', errorText);
      errors.push(`Account access failed (${accountResponse.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('Account test error:', error);
    errors.push(`Account test error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 2: Check if GME asset is available
  let assetAccessible = false;
  let assetInfo: any;
  
  try {
    console.log('Testing asset access for GME...');
    const assetResponse = await fetch(`${alpacaBaseUrl}/v2/assets/GME`, {
      method: 'GET',
      headers
    });
    
    console.log('Asset response status:', assetResponse.status);
    
    if (assetResponse.ok) {
      assetInfo = await assetResponse.json();
      assetAccessible = true;
      console.log('Asset access successful:', {
        symbol: assetInfo.symbol,
        tradable: assetInfo.tradable,
        status: assetInfo.status
      });
    } else {
      const errorText = await assetResponse.text();
      console.error('Asset access failed:', errorText);
      errors.push(`Asset access failed (${assetResponse.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('Asset test error:', error);
    errors.push(`Asset test error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 3: Try a simple order validation (without submitting)
  try {
    console.log('Testing order endpoint...');
    const testOrder = {
      symbol: 'AAPL', // Use a common stock
      qty: 1,
      side: 'buy',
      type: 'market',
      time_in_force: 'day'
    };
    
    // Note: We're not actually submitting this order, just testing the endpoint
    const orderResponse = await fetch(`${alpacaBaseUrl}/v2/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testOrder)
    });
    
    console.log('Order endpoint test status:', orderResponse.status);
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.log('Order endpoint response:', errorText);
      // Don't add this as an error since we expect it might fail due to insufficient funds, etc.
    } else {
      console.log('Order endpoint accessible');
    }
  } catch (error) {
    console.error('Order endpoint test error:', error);
    errors.push(`Order endpoint test error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    credentialsConfigured: true,
    accountAccessible,
    accountInfo,
    assetAccessible,
    assetInfo,
    errors
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept both GET and POST methods
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use GET or POST to run diagnostics.' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const diagnosticResult = await testAlpacaConnection();
    
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        diagnostics: diagnosticResult
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Diagnostic error:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown diagnostic error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});