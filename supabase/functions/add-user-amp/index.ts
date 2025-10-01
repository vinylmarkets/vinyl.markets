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

    const { amp_id, name, allocated_capital } = await req.json();

    // Validate input
    if (!amp_id || !name || allocated_capital === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amp_id, name, allocated_capital' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amp exists in catalog
    const { data: catalogAmp, error: catalogError } = await supabase
      .from('amp_catalog')
      .select('*')
      .eq('id', amp_id)
      .single();

    if (catalogError || !catalogAmp) {
      return new Response(
        JSON.stringify({ error: 'Amp not found in catalog' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has this amp
    const { data: existing } = await supabase
      .from('user_amps')
      .select('id')
      .eq('user_id', user.id)
      .eq('amp_id', amp_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'You already have this amp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check available capital
    const { data: accountData } = await supabase
      .from('paper_accounts')
      .select('current_cash')
      .eq('user_id', user.id)
      .single();

    const { data: totalAllocatedData } = await supabase
      .rpc('get_total_allocated_capital', { p_user_id: user.id });

    const availableCapital = (accountData?.current_cash || 0) - (totalAllocatedData || 0);

    if (allocated_capital > availableCapital) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient capital. Available: $${availableCapital.toFixed(2)}`,
          available_capital: availableCapital
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get next priority
    const { data: maxPriorityAmp } = await supabase
      .from('user_amps')
      .select('priority')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPriority = maxPriorityAmp ? maxPriorityAmp.priority + 1 : 1;

    // Insert amp
    const { data: newAmp, error: insertError } = await supabase
      .from('user_amps')
      .insert({
        user_id: user.id,
        amp_id,
        name,
        allocated_capital,
        priority: nextPriority,
        is_active: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create default settings
    const defaultSettings = catalogAmp.default_settings || {};
    const { error: settingsError } = await supabase
      .from('user_amp_settings')
      .insert({
        user_amp_id: newAmp.id,
        custom_parameters: defaultSettings
      });

    if (settingsError) throw settingsError;

    // Log event
    await supabase.from('amp_events').insert({
      user_id: user.id,
      user_amp_id: newAmp.id,
      event_type: 'capital_allocated',
      description: `Added ${name} with $${allocated_capital} capital`,
      metadata: { amp_id, allocated_capital }
    });

    console.log(`Successfully added amp ${amp_id} for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, amp: newAmp }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-user-amp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
