import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');
    
    if (!POLYGON_API_KEY) {
      throw new Error('Polygon API key not configured');
    }

    // Get user from request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get symbols from user's portfolio and watchlist
    const symbols = new Set<string>();

    // Fetch portfolio positions
    const { data: positions } = await supabaseClient
      .from('paper_positions')
      .select('symbol');
    
    if (positions) {
      positions.forEach((pos: any) => {
        if (pos.symbol) symbols.add(pos.symbol);
      });
    }

    // Fetch watchlist symbols
    const { data: watchlist } = await supabaseClient
      .from('watchlist_items')
      .select('symbol');
    
    if (watchlist) {
      watchlist.forEach((item: any) => {
        if (item.symbol) symbols.add(item.symbol);
      });
    }

    if (symbols.size === 0) {
      return new Response(
        JSON.stringify({ articles: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch news from Polygon.io
    const tickerParam = Array.from(symbols).join(',');
    const polygonUrl = `https://api.polygon.io/v2/reference/news?ticker=${tickerParam}&limit=50&order=desc&apiKey=${POLYGON_API_KEY}`;
    
    const response = await fetch(polygonUrl);
    
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit reached. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.results || [];

    // Deduplicate and sort by date
    const uniqueArticles = Array.from(
      new Map(articles.map((article: any) => [article.id, article])).values()
    ).sort((a: any, b: any) => 
      new Date(b.published_utc).getTime() - new Date(a.published_utc).getTime()
    ).slice(0, 15);

    return new Response(
      JSON.stringify({ articles: uniqueArticles }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in market-news function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch news' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
