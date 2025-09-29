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

async function fetchAccountFromAPI(userId: string): Promise<AccountData> {
  try {
    console.log('Attempting to fetch account data for user:', userId);
    
    // Try to fetch from Alpaca FIRST
    const alpacaApiKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
    
    if (alpacaApiKey && alpacaSecret) {
      try {
        console.log('Fetching account data from Alpaca API...');
        
        const response = await fetch(`${alpacaBaseUrl}/v2/account`, {
          headers: {
            'APCA-API-KEY-ID': alpacaApiKey,
            'APCA-API-SECRET-KEY': alpacaSecret,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const alpacaData = await response.json();
          console.log('Successfully fetched account data from Alpaca');
          
          // Transform Alpaca data to our format
          const transformedData: AccountData = {
            portfolioValue: parseFloat(alpacaData.portfolio_value || '0'),
            dailyPnL: parseFloat(alpacaData.equity || '0') - parseFloat(alpacaData.last_equity || '0'),
            dailyPnLPercent: parseFloat(alpacaData.last_equity || '0') > 0
              ? ((parseFloat(alpacaData.equity || '0') - parseFloat(alpacaData.last_equity || '0')) / parseFloat(alpacaData.last_equity || '0')) * 100
              : 0,
            buyingPower: parseFloat(alpacaData.buying_power || '0'),
            totalEquity: parseFloat(alpacaData.equity || '0'),
            marginUsed: parseFloat(alpacaData.initial_margin || '0'),
            dayTradesUsed: parseInt(alpacaData.daytrade_count || '0'),
            accountStatus: alpacaData.status?.toUpperCase() || 'ACTIVE',
            lastUpdated: new Date().toISOString()
          };
          
          console.log('Alpaca account data:', transformedData);
          return transformedData;
        } else {
          console.log('Failed to fetch from Alpaca, falling back to database');
        }
      } catch (alpacaError) {
        console.warn('Error fetching from Alpaca:', alpacaError);
      }
    }
    
    // Fallback to database
    console.log('Fetching account data from database...');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: paperAccount, error: paperError } = await supabase
      .from('paper_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!paperError && paperAccount) {
      console.log('Using paper trading account data from database');
      
      const dailyPnLPercent = paperAccount.starting_capital > 0 
        ? (parseFloat(paperAccount.total_unrealized_pnl || '0') / parseFloat(paperAccount.starting_capital || '100000')) * 100
        : 0;

      const paperAccountData: AccountData = {
        portfolioValue: parseFloat(paperAccount.total_equity || '0'),
        dailyPnL: parseFloat(paperAccount.total_unrealized_pnl || '0'),
        dailyPnLPercent: dailyPnLPercent,
        buyingPower: parseFloat(paperAccount.buying_power || '0'),
        totalEquity: parseFloat(paperAccount.total_equity || '0'),
        marginUsed: parseFloat(paperAccount.margin_used || '0'),
        dayTradesUsed: parseInt(paperAccount.day_trades_count || '0'),
        accountStatus: 'ACTIVE',
        lastUpdated: paperAccount.updated_at || new Date().toISOString()
      };
      
      console.log('Database account data:', paperAccountData);
      return paperAccountData;
    }
    
    console.warn('No account data found, using demo data');
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

    // Get user ID from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract user ID from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const accountData = await fetchAccountFromAPI(user.id);

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