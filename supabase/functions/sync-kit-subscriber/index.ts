import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriberData {
  email: string;
  userData: {
    experience?: string;
    riskProfile?: string;
    fullName?: string;
    tradingStyle?: string;
  };
}

async function syncSubscriberToKit(email: string, userData: any) {
  const kitApiKey = Deno.env.get('KIT_API_KEY');
  
  if (!kitApiKey) {
    throw new Error('Missing Kit API key configuration');
  }

  console.log('Syncing subscriber to Kit.com:', { email, userData });

  const response = await fetch(
    `https://api.convertkit.com/v3/subscribers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: kitApiKey,
        email: email,
        first_name: userData?.fullName?.split(' ')[0] || '',
        fields: {
          experience: userData?.experience || '',
          risk_profile: userData?.riskProfile || '',
          trading_style: userData?.tradingStyle || ''
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kit API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userData, test_function_only } = await req.json();

    // Handle diagnostic test
    if (test_function_only) {
      const kitApiKey = Deno.env.get('KIT_API_KEY');
      if (!kitApiKey) {
        return new Response(
          JSON.stringify({ error: 'KIT_API_KEY not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'sync-kit-subscriber function is accessible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Processing subscriber sync request for:', email);

    const result = await syncSubscriberToKit(email, userData || {});
    
    console.log('Successfully synced subscriber to Kit.com:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscriber synced to Kit.com successfully',
        kit_response: result 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error syncing subscriber to Kit.com:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync subscriber', 
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});