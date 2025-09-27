import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import Plot from 'react-plotly.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GraphNode {
  id: string
  label: string
  type: string
  x: number
  y: number
}

interface GraphEdge {
  source: string
  target: string
  strength: number
}

export function KGNetworkGraph() {
  const [graphData, setGraphData] = useState<{nodes: GraphNode[], edges: GraphEdge[]}>({
    nodes: [],
    edges: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGraphData()
  }, [])

  const loadGraphData = async () => {
    try {
      // Get nodes
      const { data: nodes } = await supabase
        .from('kg_nodes')
        .select('id, entity_id, node_type, properties')
        .limit(50)

      // Get edges
      const { data: edges } = await supabase
        .from('kg_edges')
        .select('source_node_id, target_node_id, strength, relationship_type')
        .limit(100)

      if (!nodes || !edges) return

      // Create node mapping
      const nodeMap = new Map(nodes.map(n => [n.id, n]))

      // Calculate layout using force-directed algorithm (simplified)
      const graphNodes: GraphNode[] = nodes.map((node, i) => ({
        id: node.id,
        label: node.entity_id,
        type: node.node_type,
        x: Math.cos(i * 2 * Math.PI / nodes.length) * 100,
        y: Math.sin(i * 2 * Math.PI / nodes.length) * 100
      }))

      const graphEdges: GraphEdge[] = edges
        .filter(e => nodeMap.has(e.source_node_id) && nodeMap.has(e.target_node_id))
        .map(e => ({
          source: e.source_node_id,
          target: e.target_node_id,
          strength: e.strength
        }))

      setGraphData({ nodes: graphNodes, edges: graphEdges })
    } catch (error) {
      console.error('Error loading graph:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Graph Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const edgeTraces = graphData.edges.map(edge => {
    const sourceNode = graphData.nodes.find(n => n.id === edge.source)
    const targetNode = graphData.nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) return null

    return {
      type: 'scatter' as const,
      mode: 'lines' as const,
      x: [sourceNode.x, targetNode.x],
      y: [sourceNode.y, targetNode.y],
      line: {
        width: edge.strength * 5,
        color: 'rgba(125, 125, 125, 0.5)'
      },
      hoverinfo: 'none' as const,
      showlegend: false
    }
  }).filter(Boolean)

  const nodesByType = graphData.nodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = []
    acc[node.type].push(node)
    return acc
  }, {} as Record<string, GraphNode[]>)

  const nodeTraces = Object.entries(nodesByType).map(([type, nodes]) => ({
    type: 'scatter' as const,
    mode: 'markers+text' as const,
    x: nodes.map(n => n.x),
    y: nodes.map(n => n.y),
    text: nodes.map(n => n.label),
    textposition: 'top center' as const,
    name: type,
    marker: {
      size: 20,
      color: type === 'stock' ? '#3b82f6' : type === 'pattern' ? '#ef4444' : '#10b981',
      line: { width: 2, color: '#fff' }
    },
    hovertemplate: `<b>%{text}</b><br>Type: ${type}<extra></extra>`
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Graph Network Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Plot
          data={[...edgeTraces, ...nodeTraces]}
          layout={{
            title: {
              text: `Network Graph (${graphData.nodes.length} nodes, ${graphData.edges.length} edges)`,
              font: { size: 16 }
            },
            showlegend: true,
            hovermode: 'closest',
            xaxis: { showgrid: false, zeroline: false, showticklabels: false },
            yaxis: { showgrid: false, zeroline: false, showticklabels: false },
            margin: { l: 40, r: 40, b: 40, t: 60 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
          }}
          style={{ width: '100%', height: '600px' }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  )
}