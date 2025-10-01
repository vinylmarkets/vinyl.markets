import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, AlertTriangle, TrendingUp, RefreshCw, CheckCircle2, Clock } from 'lucide-react'
import { useCogneeData, CogneeInsight } from '@/hooks/useCogneeData'
import { useToast } from '@/hooks/use-toast'

export default function InsightsDashboard() {
  const { loading, fetchInsights, discoverInsights } = useCogneeData()
  const [insights, setInsights] = useState<CogneeInsight[]>([])
  const [discovering, setDiscovering] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const data = await fetchInsights()
      setInsights(data)
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }

  const handleDiscoverInsights = async () => {
    setDiscovering(true)
    try {
      await discoverInsights()
      await loadInsights()
      toast({
        title: 'Insights Discovery Complete',
        description: 'New insights have been generated from the knowledge graph'
      })
    } catch (error) {
      toast({
        title: 'Discovery Failed',
        description: 'Failed to generate new insights',
        variant: 'destructive'
      })
    } finally {
      setDiscovering(false)
    }
  }

  const priorityInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high')
  const patternInsights = insights.filter(i => i.type === 'pattern')
  const anomalyInsights = insights.filter(i => i.type === 'anomaly')
  const predictionInsights = insights.filter(i => i.type === 'prediction')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            Insights Dashboard
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights automatically discovered from your system
          </p>
        </div>
        <Button 
          onClick={handleDiscoverInsights} 
          disabled={discovering || loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
          Discover New Insights
        </Button>
      </motion.div>

      {/* Priority Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Priority Insights ({priorityInsights.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityInsights.length > 0 ? (
              priorityInsights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">{insight.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(insight.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommendations:</p>
                        {insight.recommendations.map((rec: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>{rec.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">Investigate</Button>
                      <Button size="sm" variant="outline">Dismiss</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No priority insights at this time
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Categorized Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patterns" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="patterns">
                  Patterns ({patternInsights.length})
                </TabsTrigger>
                <TabsTrigger value="anomalies">
                  Anomalies ({anomalyInsights.length})
                </TabsTrigger>
                <TabsTrigger value="predictions">
                  Predictions ({predictionInsights.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({insights.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patterns" className="space-y-4 mt-4">
                {patternInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </TabsContent>

              <TabsContent value="anomalies" className="space-y-4 mt-4">
                {anomalyInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4 mt-4">
                {predictionInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </TabsContent>

              <TabsContent value="all" className="space-y-4 mt-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function InsightCard({ insight }: { insight: CogneeInsight }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(insight.priority)}>
              {insight.priority}
            </Badge>
            <Badge variant="outline">{insight.type}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(insight.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="font-semibold mb-2">{insight.title}</h3>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {insight.metadata?.confidence && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              Confidence: {(insight.metadata.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
