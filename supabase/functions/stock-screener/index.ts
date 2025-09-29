import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body once
    const requestBody = await req.json();
    const { action, symbol } = requestBody;

    console.log('Stock screener action:', action, 'for symbol:', symbol);

    switch (action) {
      case 'get_watchlists':
        return await getWatchlists(supabaseClient, req);
      
      case 'get_watchlist_symbols':
        return await getWatchlistSymbols(supabaseClient, requestBody);
      
      case 'add_to_watchlist':
        return await addToWatchlist(supabaseClient, requestBody);
      
      case 'search_symbol':
        return await searchSymbol(supabaseClient, symbol);
      
      case 'get_universe_selection':
        return await getUniverseSelection(supabaseClient);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Stock screener error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getWatchlists(supabaseClient: any, req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get user from auth token
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient.rpc('get_user_watchlists', {
    target_user_id: user.id
  });

  if (error) {
    console.error('Error fetching watchlists:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getWatchlistSymbols(supabaseClient: any, requestBody: any) {
  const { watchlist_id, priority_tier } = requestBody;

  let query = supabaseClient
    .from('watchlist_items')
    .select('symbol, priority_tier, added_at')
    .eq('watchlist_id', watchlist_id);

  if (priority_tier) {
    query = query.eq('priority_tier', priority_tier);
  }

  const { data, error } = await query.order('priority_tier').order('added_at');

  if (error) {
    console.error('Error fetching watchlist symbols:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function addToWatchlist(supabaseClient: any, requestBody: any) {
  const { watchlist_id, symbol, priority_tier = 3 } = requestBody;

  console.log('Adding to watchlist:', { watchlist_id, symbol, priority_tier });

  const { data, error } = await supabaseClient
    .from('watchlist_items')
    .insert({ watchlist_id, symbol, priority_tier })
    .select();

  if (error) {
    console.error('Error adding to watchlist:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function searchSymbol(supabaseClient: any, symbol: string) {
  // Check cache first
  const { data: cachedData } = await supabaseClient
    .from('stock_analysis_cache')
    .select('analysis_data')
    .eq('symbol', symbol.toUpperCase())
    .eq('analysis_type', 'quick_search')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cachedData) {
    return new Response(
      JSON.stringify({ data: cachedData.analysis_data, cached: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch real data (for now, return mock data)
  const mockData = {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Inc.`,
    price: 150.25 + Math.random() * 50,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    sector: 'Technology',
    lastUpdated: new Date().toISOString()
  };

  // Cache the result for 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await supabaseClient
    .from('stock_analysis_cache')
    .upsert({
      symbol: symbol.toUpperCase(),
      analysis_type: 'quick_search',
      analysis_data: mockData,
      expires_at: expiresAt
    });

  return new Response(
    JSON.stringify({ data: mockData, cached: false }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUniverseSelection(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('universe_selection')
    .select('*')
    .eq('selection_date', new Date().toISOString().split('T')[0])
    .order('rank');

  if (error) {
    console.error('Error fetching universe selection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}