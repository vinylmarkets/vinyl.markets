import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriberData {
  email: string;
  userData: {
    experience?: string;
    riskProfile?: string;
    fullName?: string;
    tradingStyle?: string;
  };
}

async function syncSubscriberToBeehiiv(email: string, userData: any) {
  const beehiivApiKey = Deno.env.get('BEEHIIV_API_KEY')
  const publicationId = Deno.env.get('BEEHIIV_PUBLICATION_ID')
  
  if (!beehiivApiKey || !publicationId) {
    throw new Error('Missing Beehiiv configuration')
  }

  console.log('Syncing subscriber to Beehiiv:', { email, userData })

  const response = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${beehiivApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'tubeamp_trader',
        utm_medium: 'platform_signup',
        custom_fields: [
          { name: 'trader_level', value: userData.experience || 'unknown' },
          { name: 'risk_profile', value: userData.riskProfile || 'moderate' },
          { name: 'signup_date', value: new Date().toISOString() },
          { name: 'full_name', value: userData.fullName || '' },
          { name: 'trading_style', value: userData.tradingStyle || '' }
        ]
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Beehiiv API error:', response.status, errorText)
    throw new Error(`Beehiiv API error: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    const body = await req.json()
    const { email, test_function_only, userData }: SubscriberData & { test_function_only?: boolean } = body

    // Handle diagnostic test
    if (test_function_only) {
      const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY');
      const BEEHIIV_PUBLICATION_ID = Deno.env.get('BEEHIIV_PUBLICATION_ID');
      
      if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
        return new Response(
          JSON.stringify({ error: 'Beehiiv credentials not configured' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Sync function is accessible' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    console.log('Processing subscriber sync request for:', email)

    const result = await syncSubscriberToBeehiiv(email, userData || {})
    
    console.log('Successfully synced subscriber to Beehiiv:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscriber synced to Beehiiv successfully',
        beehiiv_response: result 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )

  } catch (error) {
    console.error('Error syncing subscriber to Beehiiv:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync subscriber', 
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})