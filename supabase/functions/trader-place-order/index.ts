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

    console.log('📤 Placing order for user:', user.id)

    const { symbol, qty, side, type = 'market' } = await req.json()
    
    console.log('Order details:', { symbol, qty, side, type })

    const orderPayload = {
      symbol,
      qty,
      side,
      type,
      time_in_force: 'day'
    }
    
    const response = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': ALPACA_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Alpaca order error:', data)
      throw new Error(data.message || 'Failed to place order')
    }

    console.log('✅ Order placed successfully:', data.id)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Error placing order:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})