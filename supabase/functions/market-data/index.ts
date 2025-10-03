import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, symbol, symbols, timeframe } = await req.json()

    // Get WebSocket key
    if (action === 'get-websocket-key') {
      return new Response(
        JSON.stringify({ key: POLYGON_API_KEY }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get quote
    if (action === 'get-quote') {
      const response = await fetch(
        `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
      )
      const data = await response.json()
      
      return new Response(
        JSON.stringify(data.ticker),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company details
    if (action === 'get-details') {
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
      )
      const data = await response.json()
      
      return new Response(
        JSON.stringify(data.results),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get chart data
    if (action === 'get-chart') {
      const now = new Date()
      const timeframes: Record<string, { multiplier: number; timespan: string; from: Date }> = {
        '1m': { multiplier: 1, timespan: 'minute', from: new Date(now.getTime() - 60 * 60 * 1000) },
        '5m': { multiplier: 5, timespan: 'minute', from: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
        '15m': { multiplier: 15, timespan: 'minute', from: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        '1H': { multiplier: 1, timespan: 'hour', from: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        '4H': { multiplier: 4, timespan: 'hour', from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        '1D': { multiplier: 1, timespan: 'day', from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
        '1W': { multiplier: 1, timespan: 'week', from: new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000) },
        '1M': { multiplier: 1, timespan: 'month', from: new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000) },
      }

      const config = timeframes[timeframe] || timeframes['1D']
      const fromDate = config.from.toISOString().split('T')[0]
      const toDate = now.toISOString().split('T')[0]

      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${config.multiplier}/${config.timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`
      )
      const data = await response.json()
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get news
    if (action === 'get-news') {
      const response = await fetch(
        `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=10&apiKey=${POLYGON_API_KEY}`
      )
      const data = await response.json()
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get watchlist quotes
    if (action === 'get-watchlist') {
      const quotes = await Promise.all(
        symbols.map(async (sym: string) => {
          try {
            const response = await fetch(
              `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${sym}?apiKey=${POLYGON_API_KEY}`
            )
            const data = await response.json()
            const ticker = data.ticker
            
            return {
              symbol: sym,
              name: ticker.name || sym,
              price: ticker.day?.c || ticker.prevDay?.c || 0,
              change: (ticker.day?.c || 0) - (ticker.prevDay?.c || 0),
              changePercent: ticker.todaysChangePerc || 0,
            }
          } catch (error) {
            console.error(`Failed to fetch ${sym}:`, error)
            return null
          }
        })
      )

      return new Response(
        JSON.stringify({ quotes: quotes.filter(Boolean) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get market status
    if (action === 'get-market-status') {
      const response = await fetch(
        `https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`
      )
      const data = await response.json()
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
