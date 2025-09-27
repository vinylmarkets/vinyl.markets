import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface ValidationData {
  date: string
  validations: number
  avgConfidenceAdjustment: number
  enhancedPredictions: number
}

interface EnhancementTest {
  symbol: string
  originalConfidence: number
  enhancedConfidence: number
  adjustment: number
  patterns: string[]
  correlations: number
}

export function KGPredictionEnhancement() {
  const [validationData, setValidationData] = useState<ValidationData[]>([])
  const [testSymbol, setTestSymbol] = useState('')
  const [testResult, setTestResult] = useState<EnhancementTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadValidationData()
  }, [])

  const loadValidationData = async () => {
    try {
      // Get validation data by date
      const { data: validations } = await supabase
        .from('kg_signal_validation')
        .select('created_at, confidence_adjustment, validation_result')
        .order('created_at', { ascending: true })

      if (!validations) {
        setLoading(false)
        return
      }

      // Group by date
      const dataByDate = validations.reduce((acc, validation) => {
        const date = new Date(validation.created_at).toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = {
            validations: 0,
            totalAdjustment: 0,
            enhancedPredictions: 0
          }
        }
        
        acc[date].validations++
        acc[date].totalAdjustment += validation.confidence_adjustment || 0
        if (validation.confidence_adjustment && Math.abs(validation.confidence_adjustment) > 1) {
          acc[date].enhancedPredictions++
        }
        
        return acc
      }, {} as Record<string, any>)

      const chartData: ValidationData[] = Object.entries(dataByDate).map(([date, data]) => ({
        date,
        validations: data.validations,
        avgConfidenceAdjustment: data.totalAdjustment / data.validations,
        enhancedPredictions: data.enhancedPredictions
      }))

      setValidationData(chartData)
    } catch (error) {
      console.error('Error loading validation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testEnhancement = async () => {
    if (!testSymbol.trim()) return

    setTesting(true)
    try {
      // Mock technical signals for testing
      const mockSignals = {
        rsi_divergence_strength: Math.random() * 0.8 + 0.2,
        macd_crossover_strength: Math.random() * 0.7 + 0.3,
        volume_signal: Math.random() * 0.9 + 0.1,
        options_signal_strength: Math.random() * 0.8 + 0.2
      }

      const baseConfidence = Math.random() * 40 + 50 // 50-90%

      const { data, error } = await supabase.functions.invoke('kg-prediction-enhancer', {
        body: {
          symbol: testSymbol.toUpperCase(),
          technicalSignals: mockSignals,
          predictionDate: new Date().toISOString().split('T')[0],
          baseConfidence
        }
      })

      if (error) throw error

      setTestResult({
        symbol: testSymbol.toUpperCase(),
        originalConfidence: baseConfidence,
        enhancedConfidence: data.enhancedConfidence,
        adjustment: data.confidenceAdjustment,
        patterns: data.supportingPatterns?.map((p: any) => p.pattern) || [],
        correlations: data.correlationInsights?.length || 0
      })

      toast({
        title: "Enhancement Test Complete",
        description: `Knowledge Graph enhanced confidence by ${data.confidenceAdjustment > 0 ? '+' : ''}${data.confidenceAdjustment.toFixed(1)} points`
      })

    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction Enhancement Analysis</CardTitle>
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
      {/* Test Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle>Test Knowledge Graph Enhancement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Input
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={testSymbol}
              onChange={(e) => setTestSymbol(e.target.value)}
              className="max-w-xs"
            />
            <Button 
              onClick={testEnhancement} 
              disabled={testing || !testSymbol.trim()}
            >
              {testing ? 'Testing...' : 'Test Enhancement'}
            </Button>
          </div>

          {testResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{testResult.symbol}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Original:</span>
                      <span className="font-semibold">{testResult.originalConfidence.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Enhanced:</span>
                      <span className="font-semibold">{testResult.enhancedConfidence.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Adjustment:</span>
                      <span className={`font-semibold ${testResult.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult.adjustment >= 0 ? '+' : ''}{testResult.adjustment.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {testResult.patterns.length > 0 ? (
                      testResult.patterns.map((pattern, index) => (
                        <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                          {pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No patterns detected</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{testResult.correlations}</div>
                    <div className="text-sm text-muted-foreground">Related stocks</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation History */}
      {validationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enhancement Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={validationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="validations" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Daily Validations"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgConfidenceAdjustment" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Avg Confidence Adjustment"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Enhancement Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationData.reduce((sum, d) => sum + d.validations, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Predictions enhanced</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationData.length > 0 
                ? (validationData.reduce((sum, d) => sum + d.avgConfidenceAdjustment, 0) / validationData.length).toFixed(1)
                : '0'
              }%
            </div>
            <div className="text-sm text-muted-foreground">Confidence change</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Significant Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationData.reduce((sum, d) => sum + d.enhancedPredictions, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Major adjustments (+/- 1%)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}