import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  BookOpen,
  Target,
  DollarSign,
  BarChart3,
  MessageSquare,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Brain
} from 'lucide-react'
import { KnowledgeBaseManager } from '@/components/playbook/KnowledgeBaseManager'
import { AIAssistant } from '@/components/playbook/AIAssistant'

interface PlaybookStats {
  currentPhase: string
  totalProjects: number
  completedProjects: number
  monthlyBurn: number
  runway: number
  mrr: number
  users: number
}

export default function AtomicPlaybook() {
  const { toast } = useToast()
  const [stats, setStats] = useState<PlaybookStats>({
    currentPhase: 'Phase 1: Atomic Educational',
    totalProjects: 0,
    completedProjects: 0,
    monthlyBurn: 15000,
    runway: 18,
    mrr: 0,
    users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load projects
      const { data: projects } = await supabase
        .from('playbook_projects')
        .select('*')
      
      // Load recent metrics
      const { data: metrics } = await supabase
        .from('playbook_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate stats
      const totalProjects = projects?.length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0
      const latestMRR = metrics?.find(m => m.metric_name === 'MRR')?.value || 0
      const latestUsers = metrics?.find(m => m.metric_name === 'MAU')?.value || 0

      setStats({
        currentPhase: 'Phase 1: Atomic Educational',
        totalProjects,
        completedProjects,
        monthlyBurn: 15000,
        runway: 18,
        mrr: latestMRR,
        users: latestUsers
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const phaseProgress = () => {
    if (stats.totalProjects === 0) return 25 // Default progress
    return Math.round((stats.completedProjects / stats.totalProjects) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-pulse">Loading Atomic Playbook...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="outline" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Link>
            </Button>
            <div className="h-6 border-l border-border" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Atomic Playbook</h1>
              <p className="text-sm text-muted-foreground">Company Operations Intelligence System</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {stats.currentPhase}
          </Badge>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="command-center" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="command-center" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Command Center
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="financials" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Command Center Tab */}
          <TabsContent value="command-center" className="space-y-6">
            {/* Phase Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Phase Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stats.currentPhase}</span>
                    <span className="text-sm text-muted-foreground">{phaseProgress()}% Complete</span>
                  </div>
                  <Progress value={phaseProgress()} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects:</span>
                      <span className="ml-2 font-medium">{stats.completedProjects}/{stats.totalProjects}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="ml-2 font-medium">Q2 2026 Beta Launch</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyBurn.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.runway} months runway
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.mrr.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    Target: $10K for Seed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    Target: 500 for Pre-Seed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProjects - stats.completedProjects}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.completedProjects} completed
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="h-6 w-6 mb-2" />
                    Add Project
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Log Expense
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Update Metric
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Ask AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projects & Milestones
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track execution against Bible milestones
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Project management interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Tracker
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor burn rate, subscriptions, and runway
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Financial tracking interface coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Metrics Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track all KPIs from the Bible
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Metrics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
