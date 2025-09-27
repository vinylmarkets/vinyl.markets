import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Plot from 'react-plotly.js'

interface CorrelationData {
  source: string
  target: string
  strength: number
  direction: string
}

export function KGCorrelationHeatmap() {
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCorrelationData()
  }, [])

  const loadCorrelationData = async () => {
    try {
      // Get stock correlations
      const { data: edges } = await supabase
        .from('kg_edges')
        .select(`
          source_node_id,
          target_node_id,
          strength,
          properties,
          source:kg_nodes!kg_edges_source_node_id_fkey(entity_id),
          target:kg_nodes!kg_edges_target_node_id_fkey(entity_id)
        `)
        .eq('relationship_type', 'correlates_with')
        .order('strength', { ascending: false })

      if (!edges) {
        setLoading(false)
        return
      }

        const correlations: CorrelationData[] = edges
        .filter(edge => edge.source && edge.target)
        .map(edge => ({
          source: (edge.source as any).entity_id,
          target: (edge.target as any).entity_id,
          strength: edge.strength,
          direction: (edge.properties as any)?.direction || 'positive'
        }))

      setCorrelationData(correlations)
    } catch (error) {
      console.error('Error loading correlation data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Correlation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (correlationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Correlation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No correlation data available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run the Knowledge Graph update to generate correlations.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get unique symbols
  const symbols = Array.from(new Set([
    ...correlationData.map(d => d.source),
    ...correlationData.map(d => d.target)
  ])).sort()

  // Create correlation matrix
  const matrix = symbols.map(sourceSymbol =>
    symbols.map(targetSymbol => {
      if (sourceSymbol === targetSymbol) return 1
      
      const correlation = correlationData.find(d => 
        (d.source === sourceSymbol && d.target === targetSymbol) ||
        (d.source === targetSymbol && d.target === sourceSymbol)
      )
      
      if (!correlation) return 0
      
      return correlation.direction === 'positive' ? correlation.strength : -correlation.strength
    })
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Correlation Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                z: matrix,
                x: symbols,
                y: symbols,
                type: 'heatmap',
                colorscale: [
                  [0, '#dc2626'],      // Strong negative (red)
                  [0.25, '#f87171'],   // Weak negative (light red)
                  [0.5, '#f3f4f6'],    // Neutral (gray)
                  [0.75, '#60a5fa'],   // Weak positive (light blue)
                  [1, '#2563eb']       // Strong positive (blue)
                ],
                zmin: -1,
                zmax: 1,
                showscale: true,
                colorbar: {
                  title: 'Correlation',
                  titleside: 'right',
                  tickmode: 'array',
                  tickvals: [-1, -0.5, 0, 0.5, 1],
                  ticktext: ['-1.0', '-0.5', '0.0', '0.5', '1.0']
                },
                hovertemplate: 
                  '<b>%{y}</b> vs <b>%{x}</b><br>' +
                  'Correlation: %{z:.2f}<br>' +
                  '<extra></extra>'
              }
            ]}
            layout={{
              title: {
                text: 'Stock Correlation Matrix',
                font: { size: 16 }
              },
              xaxis: {
                title: 'Symbols',
                tickangle: -45
              },
              yaxis: {
                title: 'Symbols'
              },
              margin: { l: 80, r: 80, b: 80, t: 60 },
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)'
            }}
            style={{ width: '100%', height: '600px' }}
            config={{ displayModeBar: false }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlationData
              .sort((a, b) => b.strength - a.strength)
              .slice(0, 10)
              .map((correlation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold">{correlation.source}</span>
                      <span className="text-muted-foreground">↔</span>
                      <span className="font-semibold">{correlation.target}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        correlation.direction === 'positive' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {correlation.direction === 'positive' ? '+' : '-'}{(correlation.strength * 100).toFixed(0)}%
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          correlation.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${correlation.strength * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}