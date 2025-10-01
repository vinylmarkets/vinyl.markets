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

    const { user_amp_id, settings } = await req.json();

    if (!user_amp_id || !settings) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_amp_id, settings' }),
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

    // Check for open positions
    const { data: positions } = await supabase
      .from('paper_positions')
      .select('symbol')
      .eq('user_amp_id', user_amp_id);

    let warning = null;
    if (positions && positions.length > 0) {
      warning = `Settings updated. Note: ${positions.length} open position(s) will continue using their original settings. New positions will use the updated settings.`;
    }

    // Update settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_amp_settings')
      .update(settings)
      .eq('user_amp_id', user_amp_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log event
    await supabase.from('amp_events').insert({
      user_id: user.id,
      user_amp_id,
      event_type: 'settings_updated',
      description: `Settings updated for ${amp.name}`,
      metadata: { 
        open_positions: positions?.length || 0,
        settings_changed: Object.keys(settings)
      }
    });

    console.log(`Settings updated for amp ${user_amp_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        settings: updatedSettings,
        warning 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-amp-settings:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
