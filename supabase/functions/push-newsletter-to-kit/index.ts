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
    const body = await req.json();
    const { newsletter_id, test_credentials_only, test_function_only } = body;

    // Handle diagnostic tests
    if (test_credentials_only) {
      const KIT_API_KEY = Deno.env.get('KIT_API_KEY');
      
      if (!KIT_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'KIT_API_KEY not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Kit.com API key is configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (test_function_only) {
      return new Response(
        JSON.stringify({ success: true, message: 'Function is accessible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newsletter_id) {
      throw new Error('Newsletter ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get newsletter data
    const { data: newsletter, error: fetchError } = await supabase
      .from('vinyl_newsletters')
      .select('*')
      .eq('id', newsletter_id)
      .single();

    if (fetchError || !newsletter) {
      throw new Error('Newsletter not found');
    }

    console.log('Pushing newsletter to Kit.com:', newsletter.title);

    // Get Kit API key
    const KIT_API_KEY = Deno.env.get('KIT_API_KEY');

    if (!KIT_API_KEY) {
      throw new Error('Kit API key not configured');
    }

    // Convert content to HTML format
    const htmlContent = newsletter.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br/>');

    // Create broadcast in Kit.com
    const kitResponse = await fetch(
      `https://api.convertkit.com/v3/broadcasts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          subject: newsletter.title,
          content: htmlContent,
          description: newsletter.executive_summary || newsletter.title,
          public: true,
          published: false, // Save as draft first until email is verified
          email_address: "jonathan@brandline.co", // This email needs to be verified in Kit.com
        }),
      }
    );

    if (!kitResponse.ok) {
      const errorText = await kitResponse.text();
      console.error('Kit.com API error:', kitResponse.status, errorText);
      throw new Error(`Kit.com API error: ${kitResponse.status} - ${errorText}`);
    }

    const kitData = await kitResponse.json();
    console.log('Kit.com broadcast created:', kitData);

    // Update newsletter with Kit broadcast ID
    const { error: updateError } = await supabase
      .from('vinyl_newsletters')
      .update({
        kit_broadcast_id: kitData.broadcast.id,
        kit_pushed_at: new Date().toISOString(),
      })
      .eq('id', newsletter_id);

    if (updateError) {
      console.error('Error updating newsletter with Kit ID:', updateError);
    }

    // Create analytics entry
    await supabase
      .from('vinyl_newsletter_analytics')
      .insert({
        newsletter_id,
        kit_sent_count: 1,
        last_synced_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        kit_broadcast_id: kitData.broadcast.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error pushing to Kit.com:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});