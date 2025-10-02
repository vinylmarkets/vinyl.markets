import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY')
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  prevClose: number
}

interface TradingSignal {
  symbol: string
  signal_type: 'BUY' | 'SELL' | 'HOLD'
  confidence_score: number
  target_price: number
  stop_loss_price: number
  take_profit_price: number
  reasoning: string
  signal_data: any
}

async function getMarketData(symbol: string): Promise<MarketData | null> {
  try {
    // Get previous close
    const prevCloseRes = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
    )
    const prevCloseData = await prevCloseRes.json()
    
    // Get current snapshot
    const snapshotRes = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`
    )
    const snapshotData = await snapshotRes.json()
    
    if (!snapshotData.ticker) {
      console.error('No ticker data for', symbol)
      return null
    }
    
    const ticker = snapshotData.ticker
    const prevClose = prevCloseData.results?.[0]?.c || ticker.prevDay?.c || ticker.day?.c
    
    return {
      symbol,
      price: ticker.day?.c || ticker.lastTrade?.p || 0,
      change: ticker.todaysChange || 0,
      changePercent: ticker.todaysChangePerc || 0,
      volume: ticker.day?.v || 0,
      high: ticker.day?.h || 0,
      low: ticker.day?.l || 0,
      prevClose
    }
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error)
    return null
  }
}

async function analyzeWithAI(marketData: MarketData): Promise<TradingSignal | null> {
  try {
    const prompt = `Analyze the following market data and provide a professional trading signal.

Market Data for ${marketData.symbol}:
- Current Price: $${marketData.price}
- Change: ${marketData.change > 0 ? '+' : ''}$${marketData.change.toFixed(2)} (${marketData.changePercent.toFixed(2)}%)
- Volume: ${marketData.volume.toLocaleString()}
- Day High: $${marketData.high}
- Day Low: $${marketData.low}
- Previous Close: $${marketData.prevClose}

Analyze this data considering:
1. Price momentum and trend direction
2. Volume analysis
3. Support/resistance levels
4. Risk/reward ratio

Provide your analysis in the following JSON format only:
{
  "signal_type": "BUY" | "SELL" | "HOLD",
  "confidence_score": <number 0-100>,
  "target_price": <number>,
  "stop_loss_price": <number>,
  "take_profit_price": <number>,
  "reasoning": "<detailed explanation>"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: 'You are a professional trading analyst with deep expertise in technical analysis and market dynamics. Always respond with valid JSON only, no markdown or code blocks.'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.content?.[0]?.text
    
    if (!content) {
      console.error('No content in Claude response')
      return null
    }

    // Parse the JSON response, stripping any markdown code blocks if present
    let jsonText = content.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim()
    }
    
    const analysis = JSON.parse(jsonText)
    
    return {
      symbol: marketData.symbol,
      signal_type: analysis.signal_type,
      confidence_score: Math.round(analysis.confidence_score),
      target_price: analysis.target_price,
      stop_loss_price: analysis.stop_loss_price,
      take_profit_price: analysis.take_profit_price,
      reasoning: analysis.reasoning,
      signal_data: {
        strategy: 'claude_analysis',
        model: 'claude-sonnet-4',
        current_price: marketData.price,
        market_data: marketData
      }
    }
  } catch (error) {
    console.error('Error analyzing with Claude:', error)
    return null
  }
}

async function saveSignal(signal: TradingSignal) {
  try {
    // Set expiration to 24 hours from now
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error } = await supabase
      .from('trading_signals')
      .insert({
        symbol: signal.symbol,
        signal_type: signal.signal_type.toLowerCase(),
        confidence_score: signal.confidence_score,
        target_price: signal.target_price,
        stop_loss_price: signal.stop_loss_price,
        take_profit_price: signal.take_profit_price,
        reasoning: signal.reasoning,
        signal_data: signal.signal_data,
        status: 'active',
        expires_at: expiresAt.toISOString()
      })

    if (error) {
      console.error('Error saving signal:', error)
    }
  } catch (error) {
    console.error('Error in saveSignal:', error)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting signal generation...')

    // List of symbols to analyze (top tech stocks)
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD']
    
    const signals: TradingSignal[] = []
    
    // Analyze each symbol
    for (const symbol of symbols) {
      console.log(`Analyzing ${symbol}...`)
      
      // Get market data from Polygon
      const marketData = await getMarketData(symbol)
      if (!marketData) {
        console.log(`Skipping ${symbol} - no market data`)
        continue
      }
      
      // Analyze with AI
      const signal = await analyzeWithAI(marketData)
      if (signal && signal.signal_type !== 'HOLD') {
        signals.push(signal)
        await saveSignal(signal)
        console.log(`Generated ${signal.signal_type} signal for ${symbol} with ${signal.confidence_score}% confidence`)
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`Signal generation complete. Generated ${signals.length} signals.`)

    return new Response(
      JSON.stringify({
        success: true,
        signals_generated: signals.length,
        signals: signals.map(s => ({
          symbol: s.symbol,
          type: s.signal_type,
          confidence: s.confidence_score
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error generating signals:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
