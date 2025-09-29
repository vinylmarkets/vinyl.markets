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
    console.log('Attempting to fetch positions from trading API...');
    
    // Placeholder for future API integration
    // const [positionsResponse, tradesResponse] = await Promise.all([
    //   fetch(`${TRADING_API_URL}/positions`),
    //   fetch(`${TRADING_API_URL}/trades/recent`)
    // ]);
    
    // For now, return demo data
    console.log('Using demo positions data');
    return {
      positions: DEMO_POSITIONS,
      recentTrades: DEMO_RECENT_TRADES
    };
    
  } catch (error) {
    console.warn('Failed to fetch positions, using demo data:', error instanceof Error ? error.message : String(error));
    return {
      positions: DEMO_POSITIONS,
      recentTrades: DEMO_RECENT_TRADES
    };
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