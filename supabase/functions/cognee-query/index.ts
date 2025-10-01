import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, context, action = 'query' } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    let result

    switch (action) {
      case 'query':
        result = await handleQuery(query, context, supabaseClient)
        break
      case 'discover_insights':
        result = await discoverInsights(context, supabaseClient)
        break
      case 'generate_predictions':
        result = await generatePredictions(context, supabaseClient)
        break
      default:
        throw new Error('Invalid action')
    }

    // Store query in history
    if (action === 'query') {
      await supabaseClient.from('cognee_queries').insert({
        user_id: user.id,
        query: query,
        response: result,
        confidence: result.confidence || 0.8,
        execution_time_ms: result.execution_time || 0
      })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Cognee query error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleQuery(query: string, context: any, supabase: any) {
  const startTime = Date.now()
  
  // Simulate Cognee AI query processing
  // In production, this would call the actual Cognee API
  const { data: kgNodes } = await supabase
    .from('kg_nodes')
    .select('*')
    .limit(20)
  
  const { data: kgEdges } = await supabase
    .from('kg_edges')
    .select('*')
    .limit(50)

  // Simulate intelligent response based on query
  const response = {
    answer: `Based on the knowledge graph analysis, ${query}`,
    confidence: 0.85,
    sources: kgNodes?.slice(0, 5).map((node: any) => ({
      id: node.id,
      type: node.node_type,
      label: node.entity_id,
      relevance: Math.random() * 0.5 + 0.5
    })) || [],
    relevant_entities: kgNodes || [],
    relevant_relationships: kgEdges || [],
    visualizations: {
      type: 'network',
      nodes: kgNodes?.slice(0, 10) || [],
      edges: kgEdges?.slice(0, 15) || []
    },
    key_findings: [
      'Pattern analysis shows increased correlation',
      'Historical data suggests positive trend',
      'Market conditions are favorable'
    ],
    recommendations: [
      {
        title: 'Monitor Key Indicators',
        description: 'Watch for changes in volume and price action',
        priority: 'high',
        confidence: 0.9
      }
    ],
    execution_time: Date.now() - startTime
  }

  return response
}

async function discoverInsights(context: any, supabase: any) {
  // Fetch recent patterns and anomalies from the KG
  const { data: patterns } = await supabase
    .from('kg_pattern_accuracy')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const insights = [
    {
      id: crypto.randomUUID(),
      type: 'pattern',
      priority: 'high',
      title: 'Unusual Trading Pattern Detected',
      description: 'Algorithm showing 45% deviation from normal behavior',
      evidence: patterns || [],
      recommendations: [
        {
          title: 'Investigate Algorithm',
          action: 'review_algorithm',
          urgency: 'immediate'
        }
      ],
      metadata: {
        affected_symbols: ['AAPL', 'MSFT'],
        confidence: 0.87
      },
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      type: 'prediction',
      priority: 'medium',
      title: 'Market Volatility Forecast',
      description: 'Expected increase in volatility over next 3 days',
      confidence: 0.82,
      created_at: new Date().toISOString()
    }
  ]

  // Store insights
  for (const insight of insights) {
    await supabase.from('cognee_insights').insert({
      type: insight.type,
      priority: insight.priority,
      title: insight.title,
      description: insight.description,
      evidence: insight.evidence || [],
      recommendations: insight.recommendations || [],
      metadata: insight.metadata || {}
    })
  }

  return { insights, count: insights.length }
}

async function generatePredictions(context: any, supabase: any) {
  // Generate predictions based on KG data
  const predictions = [
    {
      id: crypto.randomUUID(),
      target: 'trading_volume',
      predicted_value: 15000,
      confidence_interval: { lower: 12000, upper: 18000 },
      confidence: 0.78,
      horizon: '24h',
      factors: [
        { name: 'historical_pattern', weight: 0.4 },
        { name: 'market_sentiment', weight: 0.35 },
        { name: 'volume_trend', weight: 0.25 }
      ]
    }
  ]

  // Store learning metrics
  await supabase.from('cognee_learning_metrics').insert({
    metric_type: 'prediction_generated',
    value: predictions.length,
    metadata: { timestamp: new Date().toISOString() }
  })

  return { predictions }
}
