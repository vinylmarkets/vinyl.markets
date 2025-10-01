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

    const url = new URL(req.url);
    const user_amp_id = url.searchParams.get('user_amp_id');
    const days = parseInt(url.searchParams.get('days') || '30');

    if (!user_amp_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: user_amp_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    const { data: amp, error: ampError } = await supabase
      .from('user_amps')
      .select('*')
      .eq('id', user_amp_id)
      .eq('user_id', user.id)
      .single();

    if (ampError || !amp) {
      return new Response(
        JSON.stringify({ error: 'Amp not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get performance data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: performance, error: perfError } = await supabase
      .from('user_amp_performance')
      .select('*')
      .eq('user_amp_id', user_amp_id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (perfError) throw perfError;

    // Get latest cumulative stats
    const { data: latest } = await supabase
      .from('user_amp_performance')
      .select('*')
      .eq('user_amp_id', user_amp_id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({ 
        success: true,
        performance: performance || [],
        latest_stats: latest,
        amp_info: {
          name: amp.name,
          allocated_capital: amp.allocated_capital,
          is_active: amp.is_active
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-amp-performance:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
