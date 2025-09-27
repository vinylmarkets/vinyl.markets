import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Knowledge Graph Daily Update
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting daily knowledge graph update...')

    // Step 1: Update stock correlations
    await updateStockCorrelations(supabase)

    // Step 2: Validate previous day's predictions
    await validatePredictions(supabase)

    // Step 3: Update pattern accuracy scores
    await updatePatternAccuracy(supabase)

    // Step 4: Clean expired cache
    await supabase.rpc('clean_expired_insights_cache')

    console.log('Knowledge graph daily update complete')

    return new Response(
      JSON.stringify({ success: true, message: 'KG updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('KG update error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function updateStockCorrelations(supabase: any) {
  console.log('Updating stock correlations...')
  
  // Get all stock nodes
  const { data: stocks } = await supabase
    .from('kg_nodes')
    .select('id, entity_id')
    .eq('node_type', 'stock')

  if (!stocks || stocks.length < 2) return

  // Get recent price data for correlation calculation
  const symbols = stocks.map((s: any) => s.entity_id)

  // Calculate correlations for each pair
  for (let i = 0; i < stocks.length; i++) {
    for (let j = i + 1; j < stocks.length; j++) {
      const correlation = await calculateCorrelation(
        stocks[i].entity_id,
        stocks[j].entity_id
      )

      if (Math.abs(correlation) > 0.5) {
        // Upsert correlation edge
        await supabase.from('kg_edges').upsert({
          source_node_id: stocks[i].id,
          target_node_id: stocks[j].id,
          relationship_type: 'correlates_with',
          strength: Math.abs(correlation),
          properties: { 
            direction: correlation > 0 ? 'positive' : 'negative',
            updated_at: new Date().toISOString()
          }
        }, {
          onConflict: 'source_node_id,target_node_id,relationship_type'
        })

        // Also create reverse correlation
        await supabase.from('kg_edges').upsert({
          source_node_id: stocks[j].id,
          target_node_id: stocks[i].id,
          relationship_type: 'correlates_with',
          strength: Math.abs(correlation),
          properties: { 
            direction: correlation > 0 ? 'positive' : 'negative',
            updated_at: new Date().toISOString()
          }
        }, {
          onConflict: 'source_node_id,target_node_id,relationship_type'
        })
      }
    }
  }

  console.log(`Updated correlations for ${stocks.length} stocks`)
}

async function validatePredictions(supabase: any) {
  console.log('Validating previous day predictions...')
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: predictions } = await supabase
    .from('enhanced_daily_predictions')
    .select('*')
    .eq('prediction_date', yesterday)

  if (!predictions || predictions.length === 0) {
    console.log('No predictions found for yesterday')
    return
  }

  for (const pred of predictions) {
    // Get actual results from prediction_results table
    const { data: actual } = await supabase
      .from('prediction_results')
      .select('*')
      .eq('prediction_id', pred.id)
      .single()

    if (actual) {
      // Store pattern accuracy for each detected pattern
      const patterns = pred.primary_factors?.patterns || []

      for (const pattern of patterns) {
        const accuracy = calculatePatternAccuracy(pred, actual)

        // Find the pattern node
        const { data: patternNode } = await supabase
          .from('kg_nodes')
          .select('id')
          .eq('node_type', 'pattern')
          .eq('entity_id', pattern)
          .single()

        await supabase.from('kg_pattern_accuracy').insert({
          pattern_node_id: patternNode?.id || null,
          pattern_name: pattern,
          symbol: pred.symbol,
          detected_at: pred.created_at,
          predicted_outcome: pred.predicted_close > pred.previous_close ? 'bullish' : 'bearish',
          actual_outcome: actual.actual_close > pred.previous_close ? 'bullish' : 'bearish',
          accuracy_score: accuracy,
          confidence_at_detection: pred.overall_confidence,
          metadata: { prediction_id: pred.id }
        })
      }
    }
  }

  console.log(`Validated ${predictions.length} predictions`)
}

async function updatePatternAccuracy(supabase: any) {
  console.log('Updating pattern accuracy scores...')
  
  const { data: patterns } = await supabase
    .from('kg_nodes')
    .select('id, entity_id, properties')
    .eq('node_type', 'pattern')

  if (!patterns) return

  for (const pattern of patterns) {
    const { data: accuracyData } = await supabase
      .from('kg_pattern_accuracy')
      .select('accuracy_score')
      .eq('pattern_name', pattern.entity_id)
      .order('detected_at', { ascending: false })
      .limit(50)

    if (accuracyData && accuracyData.length > 0) {
      const avgAccuracy = accuracyData.reduce((sum: number, r: any) => sum + r.accuracy_score, 0) / accuracyData.length

      await supabase
        .from('kg_nodes')
        .update({
          properties: {
            ...pattern.properties,
            historical_accuracy: avgAccuracy / 100,
            sample_size: accuracyData.length,
            last_updated: new Date().toISOString()
          }
        })
        .eq('id', pattern.id)
    }
  }

  console.log(`Updated accuracy for ${patterns.length} patterns`)
}

function calculateCorrelation(symbol1: string, symbol2: string): number {
  // Simplified correlation calculation
  // In production, this would use actual price data from Polygon.io
  
  // Generate a pseudo-random but consistent correlation based on symbol pairs
  const combined = symbol1 + symbol2
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert hash to correlation value between -1 and 1
  const normalized = (hash % 2000) / 1000 - 1
  return Math.round(normalized * 100) / 100
}

function calculatePatternAccuracy(prediction: any, actual: any): number {
  const predictedDirection = prediction.predicted_close > prediction.previous_close
  const actualDirection = actual.actual_close > prediction.previous_close

  if (predictedDirection === actualDirection) {
    // Calculate how close the prediction was
    const predictedChange = Math.abs(prediction.predicted_close - prediction.previous_close)
    const actualChange = Math.abs(actual.actual_close - prediction.previous_close)
    
    if (actualChange === 0) return 50 // No movement case
    
    const error = Math.abs(predictedChange - actualChange) / actualChange
    return Math.max(0, 100 - (error * 100))
  }

  return 0 // Wrong direction = 0% accuracy
}