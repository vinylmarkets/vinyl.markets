import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, AlertTriangle, TrendingUp, RefreshCw, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import { useCogneeData, CogneeInsight } from '@/hooks/useCogneeData'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { TraderProtection } from '@/components/trader/TraderProtection'

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
                    <Lightbulb className="w-6 h-6 text-[#00ffff]" />
                    AI-Powered Insights
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover patterns and opportunities from Vinyl's knowledge graph
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleDiscoverInsights} 
                disabled={discovering || loading}
                className="bg-white/5 hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
                Discover New Insights
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">

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

        {/* Particle Background Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>
      </div>
    </TraderProtection>
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
