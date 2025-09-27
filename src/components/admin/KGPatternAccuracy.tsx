import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PatternAccuracyData {
  pattern: string
  accuracy: number
  sampleSize: number
  recentAccuracy: number
  description: string
}

export function KGPatternAccuracy() {
  const [accuracyData, setAccuracyData] = useState<PatternAccuracyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatternAccuracy()
  }, [])

  const loadPatternAccuracy = async () => {
    // Pattern descriptions for educational purposes
    const patternDescriptions: Record<string, string> = {
      'rsi_divergence': 'A momentum oscillator that identifies when price and RSI move in opposite directions, often signaling trend reversals.',
      'ascending_triangle': 'A bullish continuation pattern with horizontal resistance and rising support, indicating accumulation before breakout.',
      'head_shoulders': 'A reliable reversal pattern featuring three peaks with the middle one highest, signaling trend change.',
      'double_bottom': 'A bullish reversal pattern showing two distinct lows at similar levels, indicating strong support and potential upward movement.',
      'macd_crossover': 'A trend-following momentum indicator that signals when the MACD line crosses above or below the signal line.',
      'volume_spike': 'Unusual increase in trading volume often preceding significant price movements, indicating institutional interest.',
      'options_flow': 'Analysis of large options trades that may indicate informed trading activity and future price direction.'
    };

    try {
      // Get all pattern nodes
      const { data: patterns } = await supabase
        .from('kg_nodes')
        .select('entity_id, properties')
        .eq('node_type', 'pattern')

      if (!patterns) {
        setLoading(false)
        return
      }

      const accuracyResults: PatternAccuracyData[] = []

      for (const pattern of patterns) {
        // Get all accuracy data for this pattern
        const { data: allAccuracy } = await supabase
          .from('kg_pattern_accuracy')
          .select('accuracy_score, detected_at')
          .eq('pattern_name', pattern.entity_id)
          .order('detected_at', { ascending: false })

        // Get recent accuracy (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data: recentAccuracy } = await supabase
          .from('kg_pattern_accuracy')
          .select('accuracy_score')
          .eq('pattern_name', pattern.entity_id)
          .gte('detected_at', thirtyDaysAgo)

        const overallAccuracy = allAccuracy?.length > 0
          ? allAccuracy.reduce((sum, r) => sum + r.accuracy_score, 0) / allAccuracy.length
          : ((pattern.properties as any)?.historical_accuracy * 100) || 0

        const recentAvg = recentAccuracy?.length > 0
          ? recentAccuracy.reduce((sum, r) => sum + r.accuracy_score, 0) / recentAccuracy.length
          : overallAccuracy

        accuracyResults.push({
          pattern: pattern.entity_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          accuracy: Math.round(overallAccuracy * 100) / 100,
          sampleSize: allAccuracy?.length || 0,
          recentAccuracy: Math.round(recentAvg * 100) / 100,
          description: patternDescriptions[pattern.entity_id] || 'Technical trading pattern used for market analysis.'
        })
      }

      setAccuracyData(accuracyResults.sort((a, b) => b.accuracy - a.accuracy))
    } catch (error) {
      console.error('Error loading pattern accuracy:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Accuracy Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Accuracy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accuracyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="pattern" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`, 
                  name === 'accuracy' ? 'Overall Accuracy' : 'Recent Accuracy (30d)'
                ]}
                labelFormatter={(label) => `Pattern: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="accuracy" 
                fill="hsl(var(--primary))" 
                name="Overall Accuracy"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="recentAccuracy" 
                fill="hsl(var(--secondary))" 
                name="Recent Accuracy (30d)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accuracyData.map((pattern, index) => (
          <Card key={pattern.pattern}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Overall Accuracy:</span>
                  <span className="font-semibold">{pattern.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recent (30d):</span>
                  <span className="font-semibold">{pattern.recentAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sample Size:</span>
                  <span className="font-semibold">{pattern.sampleSize}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${pattern.accuracy}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}