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
    const { newsletter_id } = await req.json();

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

    console.log('Pushing newsletter to BEEHIIV:', newsletter.title);

    // Get BEEHIIV API key
    const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
    const BEEHIIV_PUBLICATION_ID = Deno.env.get('BEEHIIV_PUBLICATION_ID');

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      throw new Error('BEEHIIV credentials not configured');
    }

    // Create post in BEEHIIV
    const beehiivResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/posts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newsletter.title,
          content_html: newsletter.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n/g, '<br/>'),
          status: 'confirmed', // Can be 'draft' or 'confirmed'
          platform: 'web',
        }),
      }
    );

    if (!beehiivResponse.ok) {
      const errorText = await beehiivResponse.text();
      console.error('BEEHIIV API error:', beehiivResponse.status, errorText);
      throw new Error(`BEEHIIV API error: ${beehiivResponse.status}`);
    }

    const beehiivData = await beehiivResponse.json();
    console.log('BEEHIIV post created:', beehiivData);

    // Update newsletter with BEEHIIV post ID
    const { error: updateError } = await supabase
      .from('vinyl_newsletters')
      .update({
        beehiiv_post_id: beehiivData.data.id,
        beehiiv_pushed_at: new Date().toISOString(),
      })
      .eq('id', newsletter_id);

    if (updateError) {
      console.error('Error updating newsletter with BEEHIIV ID:', updateError);
    }

    // Create analytics entry
    await supabase
      .from('vinyl_newsletter_analytics')
      .insert({
        newsletter_id,
        beehiiv_sent_count: 1,
        last_synced_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        beehiiv_post_id: beehiivData.data.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error pushing to BEEHIIV:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
