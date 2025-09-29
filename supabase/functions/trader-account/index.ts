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
    console.log('Attempting to fetch account data from trading API...');
    
    // Placeholder for future API integration
    // const response = await fetch(`${TRADING_API_URL}/account`, {
    //   headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    // });
    
    // For now, return demo data
    console.log('Using demo account data');
    return DEMO_ACCOUNT;
    
  } catch (error) {
    console.warn('Failed to fetch account data, using demo data:', error instanceof Error ? error.message : String(error));
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