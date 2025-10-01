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

    const { user_amp_id, is_active } = await req.json();

    if (!user_amp_id || is_active === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_amp_id, is_active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    const { data: amp, error: ampError } = await supabase
      .from('user_amps')
      .select('*, settings:user_amp_settings(*)')
      .eq('id', user_amp_id)
      .eq('user_id', user.id)
      .single();

    if (ampError || !amp) {
      return new Response(
        JSON.stringify({ error: 'Amp not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preflight checks when enabling
    if (is_active) {
      if (amp.allocated_capital <= 0) {
        return new Response(
          JSON.stringify({ error: 'No capital allocated. Please allocate capital before enabling.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!amp.settings) {
        return new Response(
          JSON.stringify({ error: 'Settings not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (amp.allocated_capital < 100) {
        return new Response(
          JSON.stringify({ error: 'Minimum $100 capital required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for open positions when disabling
    let warning = null;
    if (!is_active) {
      const { data: positions } = await supabase
        .from('paper_positions')
        .select('symbol')
        .eq('user_amp_id', user_amp_id);

      if (positions && positions.length > 0) {
        warning = `Amp has ${positions.length} open position(s). They will remain open but no new trades will be opened.`;
      }
    }

    // Update amp status
    const { data: updatedAmp, error: updateError } = await supabase
      .from('user_amps')
      .update({ is_active })
      .eq('id', user_amp_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log event
    await supabase.from('amp_events').insert({
      user_id: user.id,
      user_amp_id,
      event_type: is_active ? 'amp_enabled' : 'amp_disabled',
      description: `${amp.name} ${is_active ? 'enabled' : 'disabled'}`,
      metadata: { is_active }
    });

    console.log(`Amp ${user_amp_id} ${is_active ? 'enabled' : 'disabled'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        amp: updatedAmp,
        warning 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in toggle-amp-active:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
