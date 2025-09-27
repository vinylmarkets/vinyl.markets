import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { KGNetworkGraph } from '@/components/admin/KGNetworkGraph'
import { KGPatternAccuracy } from '@/components/admin/KGPatternAccuracy'
import { KGCorrelationHeatmap } from '@/components/admin/KGCorrelationHeatmap'
import { KGPredictionEnhancement } from '@/components/admin/KGPredictionEnhancement'
import { useToast } from '@/hooks/use-toast'
import { Brain, RefreshCw, TrendingUp, Network } from 'lucide-react'

export default function KnowledgeGraph() {
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    stockNodes: 0,
    patternNodes: 0,
    avgAccuracy: 0
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadGraphStats()
  }, [])

  const loadGraphStats = async () => {
    try {
      const [nodesResult, edgesResult, accuracyResult] = await Promise.all([
        supabase.from('kg_nodes').select('*', { count: 'exact', head: true }),
        supabase.from('kg_edges').select('*', { count: 'exact', head: true }),
        supabase.from('kg_pattern_accuracy').select('accuracy_score')
      ])

      const { data: nodesByType } = await supabase
        .from('kg_nodes')
        .select('node_type')

      const stockCount = nodesByType?.filter(n => n.node_type === 'stock').length || 0
      const patternCount = nodesByType?.filter(n => n.node_type === 'pattern').length || 0

      const avgAcc = accuracyResult.data?.length > 0
        ? accuracyResult.data.reduce((sum, r) => sum + r.accuracy_score, 0) / accuracyResult.data.length
        : 0

      setGraphStats({
        totalNodes: nodesResult.count || 0,
        totalEdges: edgesResult.count || 0,
        stockNodes: stockCount,
        patternNodes: patternCount,
        avgAccuracy: Math.round(avgAcc * 100) / 100
      })
    } catch (error) {
      toast({
        title: "Error loading stats",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerKGUpdate = async () => {
    setUpdating(true)
    try {
      const { data, error } = await supabase.functions.invoke('kg-daily-update')

      if (error) throw error

      toast({
        title: "Knowledge Graph Updated",
        description: "Daily update completed successfully"
      })

      loadGraphStats()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Graph Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage AtomicMarket's prediction enhancement system
          </p>
        </div>
        <Button 
          onClick={triggerKGUpdate} 
          disabled={updating}
          className="bg-primary hover:bg-primary/90"
        >
          {updating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Graph
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphStats.totalNodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Edges</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphStats.totalEdges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Nodes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphStats.stockNodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern Nodes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphStats.patternNodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphStats.avgAccuracy}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Network Graph</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Accuracy</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="enhancement">Prediction Enhancement</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <KGNetworkGraph />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <KGPatternAccuracy />
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <KGCorrelationHeatmap />
        </TabsContent>

        <TabsContent value="enhancement" className="space-y-4">
          <KGPredictionEnhancement />
        </TabsContent>
      </Tabs>
    </div>
  )
}