import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALPACA_KEY = Deno.env.get('ALPACA_API_KEY')
const ALPACA_SECRET = Deno.env.get('ALPACA_SECRET_KEY')
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('📋 Fetching orders for user:', user.id)

    const url = new URL(req.url)
    const status = url.searchParams.get('status') || 'all'
    
    console.log('Status filter:', status)

    const response = await fetch(
      `${ALPACA_BASE_URL}/v2/orders?status=${status}&limit=100`,
      {
        headers: {
          'APCA-API-KEY-ID': ALPACA_KEY!,
          'APCA-API-SECRET-KEY': ALPACA_SECRET!
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Alpaca orders error:', data)
      throw new Error(data.message || 'Failed to fetch orders')
    }

    console.log(`✅ Fetched ${data.length || 0} orders`)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})