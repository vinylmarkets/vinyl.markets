import { corsHeaders } from '../_shared/cors.ts'

interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  side: 'long' | 'short';
  assetType: 'stock' | 'option' | 'crypto';
}

interface RecentTrade {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  timeAgo: string;
}

// Demo data matching the TradingDashboard
const DEMO_POSITIONS: Position[] = [
  {
    symbol: 'AAPL',
    quantity: 100,
    averageCost: 180.50,
    currentPrice: 182.45,
    marketValue: 18245,
    unrealizedPnL: 195,
    unrealizedPnLPercent: 1.08,
    side: 'long',
    assetType: 'stock'
  },
  {
    symbol: 'GOOGL',
    quantity: 50,
    averageCost: 141.25,
    currentPrice: 142.80,
    marketValue: 7140,
    unrealizedPnL: 77.50,
    unrealizedPnLPercent: 1.10,
    side: 'long',
    assetType: 'stock'
  }
];

const DEMO_RECENT_TRADES: RecentTrade[] = [
  {
    symbol: 'AAPL',
    action: 'BUY',
    quantity: 100,
    price: 180.50,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: '2m'
  },
  {
    symbol: 'NVDA',
    action: 'SELL',
    quantity: 10,
    price: 535.20,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeAgo: '15m'
  },
  {
    symbol: 'GOOGL',
    action: 'BUY',
    quantity: 50,
    price: 141.25,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    timeAgo: '1h'
  }
];

async function fetchPositionsFromAPI(): Promise<{ positions: Position[], recentTrades: RecentTrade[] }> {
  try {
    console.log('Attempting to fetch positions...');
    
    // Import Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No auth header, using demo data');
      return { positions: DEMO_POSITIONS, recentTrades: DEMO_RECENT_TRADES };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Auth failed, using demo data:', authError);
      return { positions: DEMO_POSITIONS, recentTrades: DEMO_RECENT_TRADES };
    }

    console.log('Fetching positions for user:', user.id);

    // Try to fetch from Alpaca API first
    const alpacaKey = Deno.env.get('ALPACA_API_KEY');
    const alpacaSecret = Deno.env.get('ALPACA_SECRET_KEY');
    const alpacaBaseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';

    if (alpacaKey && alpacaSecret) {
      try {
        console.log('Fetching positions from Alpaca API...');
        
        // Fetch positions from Alpaca
        const positionsResponse = await fetch(`${alpacaBaseUrl}/v2/positions`, {
          method: 'GET',
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret,
          },
        });

        if (positionsResponse.ok) {
          const alpacaPositions = await positionsResponse.json();
          console.log('Fetched positions from Alpaca:', alpacaPositions.length);

          const positions: Position[] = alpacaPositions.map((pos: any) => ({
            symbol: pos.symbol,
            quantity: Number(pos.qty),
            averageCost: Number(pos.avg_entry_price),
            currentPrice: Number(pos.current_price),
            marketValue: Number(pos.market_value),
            unrealizedPnL: Number(pos.unrealized_pl),
            unrealizedPnLPercent: Number(pos.unrealized_plpc) * 100,
            side: pos.side,
            assetType: 'stock'
          }));

          // Fetch recent orders from Alpaca
          const ordersResponse = await fetch(`${alpacaBaseUrl}/v2/orders?status=all&limit=10`, {
            method: 'GET',
            headers: {
              'APCA-API-KEY-ID': alpacaKey,
              'APCA-API-SECRET-KEY': alpacaSecret,
            },
          });

          let recentTrades: RecentTrade[] = [];
          if (ordersResponse.ok) {
            const alpacaOrders = await ordersResponse.json();
            recentTrades = alpacaOrders
              .filter((order: any) => order.filled_qty && Number(order.filled_qty) > 0)
              .map((order: any) => ({
                symbol: order.symbol,
                action: order.side.toUpperCase() as 'BUY' | 'SELL',
                quantity: Number(order.filled_qty),
                price: Number(order.filled_avg_price || 0),
                timestamp: order.filled_at || order.created_at,
                timeAgo: getTimeAgo(order.filled_at || order.created_at)
              }));
          }

          console.log(`Found ${positions.length} positions and ${recentTrades.length} recent trades from Alpaca`);
          return { positions, recentTrades };
        } else {
          console.log('Failed to fetch from Alpaca, falling back to database');
        }
      } catch (alpacaError) {
        console.warn('Error fetching from Alpaca:', alpacaError);
      }
    }

    // Fallback to database positions
    console.log('Fetching from database...');
    const { data: paperAccounts, error: accountError } = await supabase
      .from('paper_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    if (accountError || !paperAccounts || paperAccounts.length === 0) {
      console.log('No active paper account found, using demo data');
      return { positions: DEMO_POSITIONS, recentTrades: DEMO_RECENT_TRADES };
    }

    const accountId = paperAccounts[0].id;
    console.log('Using paper account:', accountId);

    const { data: paperPositions, error: positionsError } = await supabase
      .from('paper_positions')
      .select('*')
      .eq('account_id', accountId);

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return { positions: DEMO_POSITIONS, recentTrades: DEMO_RECENT_TRADES };
    }

    const positions: Position[] = (paperPositions || []).map(pos => ({
      symbol: pos.symbol,
      quantity: Number(pos.quantity),
      averageCost: Number(pos.average_cost || 0),
      currentPrice: Number(pos.current_price || 0),
      marketValue: Number(pos.market_value || 0),
      unrealizedPnL: Number(pos.unrealized_pnl || 0),
      unrealizedPnLPercent: Number(pos.unrealized_pnl_percentage || 0),
      side: pos.side || 'long',
      assetType: pos.asset_type || 'stock'
    }));

    const { data: paperTrades } = await supabase
      .from('paper_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentTrades: RecentTrade[] = (paperTrades || []).map(trade => ({
      symbol: trade.symbol || 'UNKNOWN',
      action: trade.transaction_type === 'buy' ? 'BUY' : 'SELL',
      quantity: Number(trade.quantity || 0),
      price: Number(trade.price || 0),
      timestamp: trade.created_at || new Date().toISOString(),
      timeAgo: getTimeAgo(trade.created_at)
    }));

    console.log(`Found ${positions.length} positions and ${recentTrades.length} recent trades from database`);
    return { positions, recentTrades };
    
  } catch (error) {
    console.warn('Failed to fetch positions, using demo data:', error instanceof Error ? error.message : String(error));
    return {
      positions: DEMO_POSITIONS,
      recentTrades: DEMO_RECENT_TRADES
    };
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

// Need access to req in fetchPositionsFromAPI
let req: Request;

Deno.serve(async (request) => {
  req = request;
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

    console.log('Fetching positions and recent trades...');

    const { positions, recentTrades } = await fetchPositionsFromAPI();

    const response = {
      success: true,
      data: {
        positions,
        recentTrades,
        totalValue: positions.reduce((sum, pos) => sum + pos.marketValue, 0),
        totalPnL: positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
      },
      timestamp: new Date().toISOString()
    };

    console.log(`Successfully fetched ${positions.length} positions and ${recentTrades.length} recent trades`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in trader-positions function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch positions data',
        data: {
          positions: DEMO_POSITIONS,
          recentTrades: DEMO_RECENT_TRADES
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});