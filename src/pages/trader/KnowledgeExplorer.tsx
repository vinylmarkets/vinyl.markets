import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Search, RefreshCw, Maximize2, Download, Network, ArrowLeft } from 'lucide-react'
import { useCogneeData } from '@/hooks/useCogneeData'
import Plot from 'react-plotly.js'
import { darkPlotlyTheme } from '@/lib/plotly-themes'
import { Link } from 'react-router-dom'
import { TraderProtection } from '@/components/trader/TraderProtection'

export default function KnowledgeExplorer() {
  const { loading, fetchKnowledgeGraph } = useCogneeData()
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [layoutType, setLayoutType] = useState('force')

  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    const data = await fetchKnowledgeGraph({ limit: 100 })
    setGraphData(data)
  }

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
  }

  const filteredNodes = graphData.nodes.filter((node: any) => {
    const matchesSearch = node.name.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesFilter = entityFilter === 'all' || node.type === entityFilter
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalNodes: graphData.nodes.length,
    totalEdges: graphData.links.length,
    patterns: graphData.nodes.filter((n: any) => n.type === 'pattern').length,
    density: graphData.links.length / (graphData.nodes.length || 1)
  }

  return (
    <TraderProtection>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/trader" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Trader</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent flex items-center gap-2">
                    <Brain className="w-6 h-6 text-[#00ffff]" />
                    Knowledge Graph Explorer
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Visualize and explore Vinyl's intelligent knowledge graph
                  </p>
                </div>
              </div>
              <Button onClick={loadGraph} disabled={loading} className="bg-white/5 hover:bg-white/10">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Graph
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">
          {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entities..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="stock">Stocks</SelectItem>
              <SelectItem value="algorithm">Algorithms</SelectItem>
              <SelectItem value="pattern">Patterns</SelectItem>
              <SelectItem value="trade">Trades</SelectItem>
            </SelectContent>
          </Select>

          <Select value={layoutType} onValueChange={setLayoutType}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force Directed</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="bg-white/5 border-white/10">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white/5 border-white/10">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="bg-background/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                3D Knowledge Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="3d" className="w-full">
                <TabsList>
                  <TabsTrigger value="3d">3D Graph</TabsTrigger>
                  <TabsTrigger value="2d">2D Network</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="3d">
                  <div className="h-[600px] rounded-lg bg-black/20 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>3D visualization requires additional setup</p>
                      <p className="text-sm mt-2">Loading {filteredNodes.length} nodes...</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="2d">
                  <div className="h-[600px]">
                    {filteredNodes.length > 0 ? (
                      <Plot
                        data={[
                          // Edges
                          ...graphData.links.map((link: any) => {
                            const source = filteredNodes.find((n: any) => n.id === link.source)
                            const target = filteredNodes.find((n: any) => n.id === link.target)
                            if (!source || !target) return null

                            return {
                              type: 'scatter',
                              mode: 'lines',
                              x: [source.val, target.val],
                              y: [Math.random() * 100, Math.random() * 100],
                              line: { width: link.value / 5, color: link.color },
                              hoverinfo: 'none',
                              showlegend: false
                            }
                          }).filter(Boolean),
                          // Nodes
                          {
                            type: 'scatter',
                            mode: 'markers+text',
                            x: filteredNodes.map(() => Math.random() * 100),
                            y: filteredNodes.map(() => Math.random() * 100),
                            text: filteredNodes.map((n: any) => n.name),
                            textposition: 'top center',
                            marker: {
                              size: filteredNodes.map((n: any) => n.val * 2),
                              color: filteredNodes.map((n: any) => n.color),
                              line: { width: 2, color: '#fff' }
                            },
                            hovertemplate: '%{text}<extra></extra>'
                          }
                        ]}
                        layout={{
                          ...darkPlotlyTheme.layout,
                          showlegend: false,
                          hovermode: 'closest',
                          xaxis: { showgrid: false, zeroline: false, showticklabels: false },
                          yaxis: { showgrid: false, zeroline: false, showticklabels: false }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data to display
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalNodes}</div>
                        <p className="text-sm text-muted-foreground">Total Entities</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalEdges}</div>
                        <p className="text-sm text-muted-foreground">Relationships</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.patterns}</div>
                        <p className="text-sm text-muted-foreground">Patterns Discovered</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.density.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Graph Density</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Node Details Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="bg-background/50 backdrop-blur sticky top-6">
            <CardHeader>
              <CardTitle>Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <Badge>{selectedNode.type}</Badge>
                    <h3 className="text-lg font-semibold mt-2">{selectedNode.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Importance:</span>
                      <span className="ml-2 font-medium">{selectedNode.val.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Connections:</span>
                      <span className="ml-2 font-medium">
                        {graphData.links.filter((l: any) => 
                          l.source === selectedNode.id || l.target === selectedNode.id
                        ).length}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Full Analysis
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a node to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

        </div>

        {/* Particle Background Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>
      </div>
    </TraderProtection>
  )
}
