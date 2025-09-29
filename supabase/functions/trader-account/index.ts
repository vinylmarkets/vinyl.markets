import { corsHeaders } from '../_shared/cors.ts'

interface AccountData {
  portfolioValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  buyingPower: number;
  totalEquity: number;
  marginUsed: number;
  dayTradesUsed: number;
  accountStatus: string;
  lastUpdated: string;
}

// Demo data matching the TradingDashboard
const DEMO_ACCOUNT: AccountData = {
  portfolioValue: 125450,
  dailyPnL: 2340,
  dailyPnLPercent: 1.87,
  buyingPower: 45230,
  totalEquity: 125450,
  marginUsed: 0,
  dayTradesUsed: 0,
  accountStatus: 'active',
  lastUpdated: new Date().toISOString()
};

async function fetchAccountFromAPI(): Promise<AccountData> {
  try {
    console.log('Attempting to fetch account data from Alpaca API...');
    
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
    
    if (!alpacaApiKey || !alpacaSecret) {
      console.warn('Alpaca API credentials not found, using demo data');
      return DEMO_ACCOUNT;
    }
    
    const response = await fetch(`${alpacaBaseUrl}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': alpacaApiKey,
        'APCA-API-SECRET-KEY': alpacaSecret,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`Alpaca API error: ${response.status} ${response.statusText}, using demo data`);
      return DEMO_ACCOUNT;
    }
    
    const alpacaData = await response.json();
    console.log('Successfully fetched real account data from Alpaca');
    
    // Transform Alpaca data to our format
    const transformedData: AccountData = {
      portfolioValue: parseFloat(alpacaData.portfolio_value || '0'),
      dailyPnL: parseFloat(alpacaData.todays_pnl || '0'),
      dailyPnLPercent: parseFloat(alpacaData.todays_pnl_pct || '0') * 100,
      buyingPower: parseFloat(alpacaData.buying_power || '0'),
      totalEquity: parseFloat(alpacaData.equity || '0'),
      marginUsed: parseFloat(alpacaData.initial_margin || '0'),
      dayTradesUsed: parseInt(alpacaData.daytrade_count || '0'),
      accountStatus: alpacaData.status || 'unknown',
      lastUpdated: new Date().toISOString()
    };
    
    return transformedData;
    
  } catch (error) {
    console.warn('Failed to fetch account data from Alpaca, using demo data:', error instanceof Error ? error.message : String(error));
    return DEMO_ACCOUNT;
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

    console.log('Fetching account data...');

    const accountData = await fetchAccountFromAPI();

    const response = {
      success: true,
      data: accountData,
      timestamp: new Date().toISOString()
    };

    console.log('Successfully fetched account data');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in trader-account function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch account data',
        data: DEMO_ACCOUNT // Fallback to demo data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});