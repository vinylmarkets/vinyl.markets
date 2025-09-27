import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionInput {
  symbol: string
  technicalSignals: Record<string, number>
  predictionDate: string
  baseConfidence: number
}

interface KGEnhancedPrediction {
  originalConfidence: number
  enhancedConfidence: number
  confidenceAdjustment: number
  supportingPatterns: Array<{
    pattern: string
    historicalAccuracy: number
    matchConfidence: number
  }>
  correlationInsights: Array<{
    relatedSymbol: string
    correlationStrength: number
    recentBehavior: string
  }>
  riskFactors: string[]
  graphEvidence: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { symbol, technicalSignals, predictionDate, baseConfidence }: PredictionInput = await req.json()

    console.log(`Processing KG enhancement for ${symbol} on ${predictionDate}`)

    // Step 1: Get or create stock node from knowledge graph
    const { data: stockNode } = await supabase
      .from('kg_nodes')
      .select('*')
      .eq('node_type', 'stock')
      .eq('entity_id', symbol)
      .single()

    if (!stockNode) {
      // Create stock node if doesn't exist
      const { data: newNode } = await supabase
        .from('kg_nodes')
        .insert({
          node_type: 'stock',
          entity_id: symbol,
          properties: { symbol, last_updated: predictionDate }
        })
        .select()
        .single()
      
      console.log(`Created new stock node for ${symbol}`)
    }

    // Step 2: Identify matching patterns from technical signals
    const detectedPatterns = await identifyPatterns(supabase, symbol, technicalSignals)
    console.log(`Detected ${detectedPatterns.length} patterns for ${symbol}`)

    // Step 3: Query historical accuracy of detected patterns
    const patternAccuracy = await getPatternAccuracy(supabase, detectedPatterns)

    // Step 4: Check correlations with related stocks
    const correlations = await getStockCorrelations(supabase, symbol)

    // Step 5: Calculate confidence adjustment based on graph evidence
    const confidenceAdjustment = calculateConfidenceAdjustment(
      patternAccuracy,
      correlations,
      technicalSignals
    )

    // Step 6: Identify risk factors
    const riskFactors = await identifyRiskFactors(supabase, symbol, detectedPatterns)

    // Step 7: Build enhanced prediction response
    const enhancedPrediction: KGEnhancedPrediction = {
      originalConfidence: baseConfidence,
      enhancedConfidence: Math.min(100, Math.max(0, baseConfidence + confidenceAdjustment)),
      confidenceAdjustment,
      supportingPatterns: patternAccuracy,
      correlationInsights: correlations,
      riskFactors,
      graphEvidence: {
        detectedPatterns,
        nodeCount: detectedPatterns.length,
        relationshipCount: correlations.length
      }
    }

    // Step 8: Store validation results
    await supabase.from('kg_signal_validation').insert({
      symbol,
      validation_type: 'pattern_match',
      validation_result: enhancedPrediction,
      confidence_adjustment: confidenceAdjustment,
      graph_evidence: enhancedPrediction.graphEvidence
    })

    console.log(`KG enhancement complete for ${symbol}. Confidence: ${baseConfidence} -> ${enhancedPrediction.enhancedConfidence}`)

    return new Response(
      JSON.stringify(enhancedPrediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('KG prediction enhancer error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function: Identify patterns from technical signals
async function identifyPatterns(supabase: any, symbol: string, signals: Record<string, number>) {
  const patterns = []

  // RSI Divergence detection
  if (signals.rsi_divergence_strength && signals.rsi_divergence_strength > 0.6) {
    patterns.push({
      pattern: 'rsi_divergence',
      confidence: signals.rsi_divergence_strength
    })
  }

  // MACD Crossover detection
  if (signals.macd_crossover_strength && signals.macd_crossover_strength > 0.6) {
    patterns.push({
      pattern: 'macd_crossover',
      confidence: signals.macd_crossover_strength
    })
  }

  // Volume spike pattern
  if (signals.volume_signal && signals.volume_signal > 0.7) {
    patterns.push({
      pattern: 'volume_spike',
      confidence: signals.volume_signal
    })
  }

  // Options flow pattern
  if (signals.options_signal_strength && signals.options_signal_strength > 0.6) {
    patterns.push({
      pattern: 'options_flow',
      confidence: signals.options_signal_strength
    })
  }

  return patterns
}

// Helper function: Get historical accuracy of patterns
async function getPatternAccuracy(supabase: any, patterns: Array<{pattern: string, confidence: number}>) {
  const accuracyResults = []

  for (const { pattern, confidence } of patterns) {
    const { data } = await supabase
      .from('kg_pattern_accuracy')
      .select('accuracy_score')
      .eq('pattern_name', pattern)
      .order('detected_at', { ascending: false })
      .limit(20)

    const avgAccuracy = data?.length > 0
      ? data.reduce((sum: number, r: any) => sum + r.accuracy_score, 0) / data.length
      : 0.5

    accuracyResults.push({
      pattern,
      historicalAccuracy: avgAccuracy,
      matchConfidence: confidence
    })
  }

  return accuracyResults
}

// Helper function: Get stock correlations
async function getStockCorrelations(supabase: any, symbol: string) {
  const { data: stockNode } = await supabase
    .from('kg_nodes')
    .select('id')
    .eq('node_type', 'stock')
    .eq('entity_id', symbol)
    .single()

  if (!stockNode) return []

  const { data: correlations } = await supabase
    .from('kg_edges')
    .select('target_node_id, strength, properties')
    .eq('source_node_id', stockNode.id)
    .eq('relationship_type', 'correlates_with')
    .order('strength', { ascending: false })
    .limit(5)

  const results = []
  for (const corr of correlations || []) {
    const { data: targetNode } = await supabase
      .from('kg_nodes')
      .select('entity_id, properties')
      .eq('id', corr.target_node_id)
      .single()

    if (targetNode) {
      results.push({
        relatedSymbol: targetNode.entity_id,
        correlationStrength: corr.strength,
        recentBehavior: corr.properties?.recent_behavior || 'neutral'
      })
    }
  }

  return results
}

// Helper function: Calculate confidence adjustment
function calculateConfidenceAdjustment(
  patternAccuracy: any[],
  correlations: any[],
  signals: Record<string, number>
): number {
  let adjustment = 0

  // Pattern accuracy contribution (+/- 10 points)
  const avgPatternAccuracy = patternAccuracy.length > 0
    ? patternAccuracy.reduce((sum, p) => sum + p.historicalAccuracy, 0) / patternAccuracy.length
    : 0.5

  adjustment += (avgPatternAccuracy - 0.5) * 20 // -10 to +10

  // Correlation agreement contribution (+/- 5 points)
  const strongCorrelations = correlations.filter(c => c.correlationStrength > 0.7)
  const agreeingCorrelations = strongCorrelations.filter(c => c.recentBehavior === 'bullish')

  if (strongCorrelations.length > 0) {
    const agreementRatio = agreeingCorrelations.length / strongCorrelations.length
    adjustment += (agreementRatio - 0.5) * 10 // -5 to +5
  }

  // Signal strength contribution (+/- 5 points)
  const avgSignalStrength = Object.values(signals).reduce((sum, s) => sum + s, 0) / Object.values(signals).length
  adjustment += (avgSignalStrength - 0.5) * 10 // -5 to +5

  return Math.round(adjustment * 100) / 100
}

// Helper function: Identify risk factors
async function identifyRiskFactors(supabase: any, symbol: string, patterns: any[]) {
  const risks = []

  // Check for conflicting patterns
  const conflictingPatterns = patterns.filter(p => p.confidence < 0.5)
  if (conflictingPatterns.length > 0) {
    risks.push(`Low confidence in ${conflictingPatterns.length} detected patterns`)
  }

  // Check historical accuracy
  const { data: recentAccuracy } = await supabase
    .from('kg_pattern_accuracy')
    .select('accuracy_score')
    .eq('symbol', symbol)
    .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('detected_at', { ascending: false })
    .limit(10)

  if (recentAccuracy && recentAccuracy.length > 0) {
    const avgRecentAccuracy = recentAccuracy.reduce((sum: number, r: any) => sum + r.accuracy_score, 0) / recentAccuracy.length
    if (avgRecentAccuracy < 60) {
      risks.push(`Recent pattern accuracy below 60% for ${symbol}`)
    }
  }

  // Add market volatility risk
  if (patterns.length === 0) {
    risks.push('No clear technical patterns detected')
  }

  return risks
}