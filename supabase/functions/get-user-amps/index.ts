import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching amps for user: ${user.id}`);

    // Fetch user's amps with joined data
    const { data: amps, error: ampsError } = await supabase
      .from('user_amps')
      .select(`
        *,
        settings:user_amp_settings(*),
        catalog:amp_catalog(*)
      `)
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (ampsError) {
      console.error('Error fetching amps:', ampsError);
      throw ampsError;
    }

    // Get account info for available capital calculation
    const { data: accountData } = await supabase
      .from('paper_accounts')
      .select('current_cash, total_equity')
      .eq('user_id', user.id)
      .single();

    // For each amp, get current stats
    const ampsWithStats = await Promise.all(
      (amps || []).map(async (amp) => {
        // Get open positions
        const { data: positions } = await supabase
          .from('paper_positions')
          .select('quantity, average_cost, unrealized_pnl')
          .eq('user_amp_id', amp.id);

        const openPositionsValue = positions?.reduce(
          (sum, p) => sum + Math.abs(p.quantity * p.average_cost),
          0
        ) || 0;

        // Get today's performance
        const today = new Date().toISOString().split('T')[0];
        const { data: todayPerf } = await supabase
          .from('user_amp_performance')
          .select('total_pnl, trades_executed')
          .eq('user_amp_id', amp.id)
          .eq('date', today)
          .single();

        return {
          ...amp,
          open_positions_count: positions?.length || 0,
          open_positions_value: openPositionsValue,
          today_pnl: todayPerf?.total_pnl || 0,
          today_trades: todayPerf?.trades_executed || 0,
          available_capital: amp.allocated_capital - openPositionsValue,
          utilization_pct: amp.allocated_capital > 0
            ? (openPositionsValue / amp.allocated_capital) * 100
            : 0
        };
      })
    );

    // Calculate summary
    const totalAllocated = ampsWithStats.reduce((sum, a) => sum + Number(a.allocated_capital), 0);
    const availableCapital = (accountData?.current_cash || 0) - totalAllocated;

    const summary = {
      total_allocated: totalAllocated,
      available_capital: Math.max(0, availableCapital),
      total_amps: ampsWithStats.length,
      active_amps: ampsWithStats.filter(a => a.is_active).length
    };

    console.log(`Returning ${ampsWithStats.length} amps`);

    return new Response(
      JSON.stringify({ amps: ampsWithStats, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-user-amps:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
