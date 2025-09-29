import { corsHeaders } from '../_shared/cors.ts'

interface AlpacaPosition {
  symbol: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
}

async function fetchAlpacaPositions(): Promise<AlpacaPosition[]> {
  const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
  const ALPACA_SECRET_KEY = Deno.env.get('ALPACA_SECRET_KEY');
  const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    throw new Error('Alpaca API credentials not configured');
  }

  try {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/positions`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.status}`);
    }

    const positions = await response.json();
    console.log(`Fetched ${positions.length} positions from Alpaca`);
    return positions;

  } catch (error) {
    console.error('Failed to fetch Alpaca positions:', error);
    throw error;
  }
}

async function fetchAlpacaAccount(): Promise<AlpacaAccount> {
  const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
  const ALPACA_SECRET_KEY = Deno.env.get('ALPACA_SECRET_KEY');
  const ALPACA_BASE_URL = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

  if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    throw new Error('Alpaca API credentials not configured');
  }

  try {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.status}`);
    }

    const account = await response.json();
    console.log('Fetched account data from Alpaca');
    return account;

  } catch (error) {
    console.error('Failed to fetch Alpaca account:', error);
    throw error;
  }
}

function transformPositionData(alpacaPosition: AlpacaPosition) {
  return {
    symbol: alpacaPosition.symbol,
    quantity: parseFloat(alpacaPosition.qty),
    side: alpacaPosition.side,
    marketValue: parseFloat(alpacaPosition.market_value),
    costBasis: parseFloat(alpacaPosition.cost_basis),
    unrealizedPnL: parseFloat(alpacaPosition.unrealized_pl),
    unrealizedPnLPercent: parseFloat(alpacaPosition.unrealized_plpc) * 100,
    currentPrice: parseFloat(alpacaPosition.current_price),
    previousClose: parseFloat(alpacaPosition.lastday_price),
    changeToday: parseFloat(alpacaPosition.change_today),
    averageCost: parseFloat(alpacaPosition.cost_basis) / parseFloat(alpacaPosition.qty),
    lastUpdated: new Date().toISOString()
  };
}

function transformAccountData(alpacaAccount: AlpacaAccount) {
  return {
    accountId: alpacaAccount.id,
    accountNumber: alpacaAccount.account_number,
    status: alpacaAccount.status,
    portfolioValue: parseFloat(alpacaAccount.portfolio_value),
    buyingPower: parseFloat(alpacaAccount.buying_power),
    cash: parseFloat(alpacaAccount.cash),
    equity: parseFloat(alpacaAccount.equity),
    lastEquity: parseFloat(alpacaAccount.last_equity),
    longMarketValue: parseFloat(alpacaAccount.long_market_value || '0'),
    shortMarketValue: parseFloat(alpacaAccount.short_market_value || '0'),
    dayTradingBuyingPower: parseFloat(alpacaAccount.daytrading_buying_power),
    patternDayTrader: alpacaAccount.pattern_day_trader,
    initialMargin: parseFloat(alpacaAccount.initial_margin || '0'),
    maintenanceMargin: parseFloat(alpacaAccount.maintenance_margin || '0'),
    dailyPnL: parseFloat(alpacaAccount.equity) - parseFloat(alpacaAccount.last_equity),
    dailyPnLPercent: ((parseFloat(alpacaAccount.equity) - parseFloat(alpacaAccount.last_equity)) / parseFloat(alpacaAccount.last_equity)) * 100,
    lastUpdated: new Date().toISOString()
  };
}

async function storePositionsData(positions: any[], account: any) {
  // Store the updated positions data
  console.log('Storing positions data:', {
    positionCount: positions.length,
    totalMarketValue: positions.reduce((sum, p) => sum + p.marketValue, 0),
    accountValue: account.portfolioValue
  });

  // Here you could store to your database
  // const { error: positionsError } = await supabase.from('positions').upsert(positions);
  // const { error: accountError } = await supabase.from('account').upsert(account);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting position sync with Alpaca...');

    // Fetch positions and account data from Alpaca
    const [alpacaPositions, alpacaAccount] = await Promise.all([
      fetchAlpacaPositions(),
      fetchAlpacaAccount()
    ]);

    // Transform the data to our format
    const positions = alpacaPositions.map(transformPositionData);
    const account = transformAccountData(alpacaAccount);

    // Store the updated data
    await storePositionsData(positions, account);

    // Calculate summary statistics
    const totalMarketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalUnrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
    const longPositions = positions.filter(p => p.side === 'long').length;
    const shortPositions = positions.filter(p => p.side === 'short').length;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      account: account,
      positions: positions,
      summary: {
        totalPositions: positions.length,
        longPositions,
        shortPositions,
        totalMarketValue: Math.round(totalMarketValue * 100) / 100,
        totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 100) / 100,
        unrealizedPnLPercent: totalMarketValue > 0 ? Math.round((totalUnrealizedPnL / (totalMarketValue - totalUnrealizedPnL)) * 10000) / 100 : 0
      }
    };

    console.log(`Position sync completed. ${positions.length} positions, Portfolio: $${account.portfolioValue.toLocaleString()}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error syncing positions:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error syncing positions',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});