import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const AllocateCapitalSchema = z.object({
  user_amp_id: z.string().uuid('Invalid amp ID'),
  allocated_capital: z.number().min(0, 'Capital must be non-negative').max(1000000, 'Capital cannot exceed $1M')
});

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

    const body = await req.json();
    
    // Validate input with Zod
    const validation = AllocateCapitalSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { user_amp_id, allocated_capital } = validation.data;

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

    // Get current open position value
    const { data: openPositionValue } = await supabase
      .rpc('get_amp_open_position_value', { p_user_amp_id: user_amp_id });

    const currentOpenValue = openPositionValue || 0;

    // Cannot allocate less than current open positions
    if (allocated_capital < currentOpenValue) {
      return new Response(
        JSON.stringify({ 
          error: `Cannot allocate less than current open positions ($${currentOpenValue.toFixed(2)})`,
          min_allocation: currentOpenValue
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check total available capital
    const { data: accountData } = await supabase
      .from('paper_accounts')
      .select('current_cash')
      .eq('user_id', user.id)
      .single();

    const { data: totalAllocatedData } = await supabase
      .rpc('get_total_allocated_capital', { p_user_id: user.id });

    const otherAmpsAllocated = (totalAllocatedData || 0) - Number(amp.allocated_capital);
    const availableCapital = (accountData?.current_cash || 0) - otherAmpsAllocated;

    if (allocated_capital > availableCapital) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient capital. Available: $${availableCapital.toFixed(2)}`,
          available_capital: availableCapital
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update allocation
    const { data: updatedAmp, error: updateError } = await supabase
      .from('user_amps')
      .update({ allocated_capital })
      .eq('id', user_amp_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log event
    const eventType = allocated_capital > amp.allocated_capital ? 'capital_allocated' : 'capital_reduced';
    await supabase.from('amp_events').insert({
      user_id: user.id,
      user_amp_id,
      event_type: eventType,
      description: `Capital ${allocated_capital > amp.allocated_capital ? 'increased' : 'decreased'} to $${allocated_capital}`,
      metadata: { 
        old_capital: amp.allocated_capital, 
        new_capital: allocated_capital 
      }
    });

    console.log(`Capital allocated for amp ${user_amp_id}: $${allocated_capital}`);

    return new Response(
      JSON.stringify({ success: true, amp: updatedAmp }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in allocate-capital:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
