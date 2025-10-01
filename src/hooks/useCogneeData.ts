import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface CogneeNode {
  id: string
  name: string
  type: string
  val: number
  color: string
  metadata?: any
}

export interface CogneeLink {
  source: string
  target: string
  value: number
  type: string
  color: string
  particles?: number
}

export interface CogneeInsight {
  id: string
  type: string
  priority: string
  title: string
  description: string
  evidence: any[]
  recommendations: any[]
  metadata: any
  created_at: string
  acknowledged: boolean
}

export function useCogneeData() {
  const [loading, setLoading] = useState(false)

  const fetchKnowledgeGraph = async (filters: any = {}) => {
    setLoading(true)
    try {
      const { data: nodes } = await supabase
        .from('kg_nodes')
        .select('*')
        .limit(filters.limit || 100)

      const { data: edges } = await supabase
        .from('kg_edges')
        .select('*')
        .limit(filters.limit || 200)

      const graphNodes: CogneeNode[] = (nodes || []).map(node => ({
        id: node.id,
        name: node.entity_id,
        type: node.node_type,
        val: Math.random() * 10 + 5,
        color: getColorByType(node.node_type),
        metadata: node.properties
      }))

      const graphLinks: CogneeLink[] = (edges || []).map(edge => ({
        source: edge.source_node_id,
        target: edge.target_node_id,
        value: edge.strength * 10,
        type: edge.relationship_type,
        color: getColorByRelationType(edge.relationship_type),
        particles: edge.strength > 0.7 ? 2 : 0
      }))

      return { nodes: graphNodes, links: graphLinks }
    } catch (error) {
      console.error('Error fetching knowledge graph:', error)
      return { nodes: [], links: [] }
    } finally {
      setLoading(false)
    }
  }

  const queryKnowledgeGraph = async (query: string, context: any = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('cognee-query', {
        body: { query, context, action: 'query' }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error querying Cognee:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const discoverInsights = async (context: any = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('cognee-query', {
        body: { context, action: 'discover_insights' }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error discovering insights:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    const { data, error } = await supabase
      .from('cognee_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data as CogneeInsight[]
  }

  const fetchQueryHistory = async () => {
    const { data, error } = await supabase
      .from('cognee_queries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data
  }

  const fetchLearningMetrics = async () => {
    const { data, error } = await supabase
      .from('cognee_learning_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data
  }

  return {
    loading,
    fetchKnowledgeGraph,
    queryKnowledgeGraph,
    discoverInsights,
    fetchInsights,
    fetchQueryHistory,
    fetchLearningMetrics
  }
}

function getColorByType(type: string): string {
  const colors: Record<string, string> = {
    stock: '#3b82f6',
    algorithm: '#10b981',
    trade: '#f59e0b',
    event: '#8b5cf6',
    pattern: '#ef4444',
    system: '#06b6d4'
  }
  return colors[type] || '#6b7280'
}

function getColorByRelationType(type: string): string {
  const colors: Record<string, string> = {
    causes: '#ef4444',
    correlates: '#3b82f6',
    triggers: '#f59e0b',
    depends_on: '#8b5cf6'
  }
  return colors[type] || 'rgba(125, 125, 125, 0.5)'
}
