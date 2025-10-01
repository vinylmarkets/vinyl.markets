import { useState, useEffect } from 'react';
import { useCogneeData } from './useCogneeData';
import { supabase } from '@/integrations/supabase/client';

export interface ForensicEvidence {
  category: string;
  status: 'confirmed' | 'strong' | 'investigating' | 'weak';
  confidence: number;
  items: string[];
  source: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  significance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  confidence: number;
  source?: string;
}

export interface DocumentAnalysisResult {
  id: string;
  documentUrl: string;
  findings: string[];
  confidence: number;
  timestamp: string;
  structuredFindings?: any;
}

export interface SearchResult {
  title: string;
  type: string;
  date: string;
  relevance: number;
  excerpt: string;
  source: string;
}

export const useForensicData = () => {
  const [evidence, setEvidence] = useState<ForensicEvidence[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [documentAnalyses, setDocumentAnalyses] = useState<DocumentAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchKnowledgeGraph, fetchInsights } = useCogneeData();

  // Fetch evidence from knowledge graph nodes
  const loadEvidence = async () => {
    try {
      const { nodes } = await fetchKnowledgeGraph();
      
      const evidenceMap = new Map<string, ForensicEvidence>();
      
      nodes.forEach(node => {
        const nodeData = node as any;
        const category = nodeData.node_type || 'General';
        
        if (!evidenceMap.has(category)) {
          evidenceMap.set(category, {
            category,
            status: 'investigating',
            confidence: 60,
            items: [],
            source: 'knowledge_graph'
          });
        }
        
        const evidence = evidenceMap.get(category)!;
        if (nodeData.properties?.description) {
          evidence.items.push(nodeData.properties.description);
        }
        
        // Update confidence based on node properties
        if (nodeData.properties?.confidence) {
          evidence.confidence = Math.max(evidence.confidence, nodeData.properties.confidence);
        }
        
        // Determine status based on confidence
        if (evidence.confidence >= 85) evidence.status = 'confirmed';
        else if (evidence.confidence >= 70) evidence.status = 'strong';
        else if (evidence.confidence >= 50) evidence.status = 'investigating';
        else evidence.status = 'weak';
      });
      
      setEvidence(Array.from(evidenceMap.values()));
    } catch (error) {
      console.error('Error loading evidence:', error);
    }
  };

  // Fetch timeline from knowledge graph relationships
  const loadTimeline = async () => {
    try {
      const { nodes } = await fetchKnowledgeGraph();
      
      const timelineEvents: TimelineEvent[] = nodes
        .filter(node => {
          const nodeData = node as any;
          return nodeData.properties?.date || nodeData.properties?.timestamp;
        })
        .map(node => {
          const nodeData = node as any;
          return {
            date: nodeData.properties?.date || new Date(nodeData.properties?.timestamp).toLocaleDateString(),
            event: nodeData.entity_id || 'Unknown Event',
            significance: (nodeData.properties?.significance as any) || 'medium',
            description: nodeData.properties?.description || '',
            confidence: nodeData.properties?.confidence || 60,
            source: 'knowledge_graph'
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTimeline(timelineEvents);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  // Load document analyses from insights cache
  const loadDocumentAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('kg_insights_cache')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        const analyses: DocumentAnalysisResult[] = data.map(item => {
          const insightResult = item.insight_result as any;
          return {
            id: item.id,
            documentUrl: item.query_text,
            findings: insightResult?.findings || [],
            confidence: insightResult?.confidence || 0,
            timestamp: item.created_at,
            structuredFindings: insightResult?.structuredFindings
          };
        });
        
        setDocumentAnalyses(analyses);
      }
    } catch (error) {
      console.error('Error loading document analyses:', error);
    }
  };

  // Semantic search function
  const searchDocuments = async (query: string): Promise<SearchResult[]> => {
    try {
      const { nodes } = await fetchKnowledgeGraph();
      
      const results: SearchResult[] = nodes
        .filter(node => {
          const nodeData = node as any;
          const searchText = `${nodeData.entity_id} ${nodeData.properties?.description || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        })
        .map(node => {
          const nodeData = node as any;
          return {
            title: nodeData.entity_id,
            type: nodeData.node_type || 'Document',
            date: nodeData.properties?.date || new Date(nodeData.created_at).toLocaleDateString(),
            relevance: calculateRelevance(node, query),
            excerpt: nodeData.properties?.description || '',
            source: 'knowledge_graph'
          };
        })
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10);
      
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  };

  // Calculate relevance score
  const calculateRelevance = (node: any, query: string): number => {
    const nodeData = node as any;
    const searchText = `${nodeData.entity_id} ${nodeData.properties?.description || ''}`.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
      if (searchText.includes(word)) {
        score += 20;
      }
    });
    
    if (nodeData.properties?.confidence) {
      score += nodeData.properties.confidence * 0.5;
    }
    
    return Math.min(score, 100);
  };

  // Get synthesis summary
  const getSynthesisSummary = () => {
    const totalFindings = evidence.reduce((sum, e) => sum + e.items.length, 0);
    const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / (evidence.length || 1);
    
    return {
      totalFindings,
      avgConfidence: Math.round(avgConfidence),
      modules: [
        {
          name: 'Document Analysis',
          status: documentAnalyses.length > 0 ? 'complete' : 'pending',
          confidence: documentAnalyses.length > 0 
            ? Math.round(documentAnalyses.reduce((sum, d) => sum + d.confidence, 0) / documentAnalyses.length)
            : 0,
          findings: documentAnalyses.reduce((sum, d) => sum + d.findings.length, 0)
        },
        {
          name: 'Timeline Patterns',
          status: timeline.length > 0 ? 'complete' : 'pending',
          confidence: timeline.length > 0
            ? Math.round(timeline.reduce((sum, t) => sum + t.confidence, 0) / timeline.length)
            : 0,
          findings: timeline.length
        },
        {
          name: 'Entity Relationships',
          status: evidence.length > 0 ? 'complete' : 'pending',
          confidence: Math.round(avgConfidence),
          findings: totalFindings
        },
        {
          name: 'Knowledge Graph',
          status: evidence.length > 0 ? 'complete' : 'pending',
          confidence: Math.round(avgConfidence),
          findings: evidence.length
        }
      ]
    };
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        loadEvidence(),
        loadTimeline(),
        loadDocumentAnalyses()
      ]);
      setLoading(false);
    };
    
    loadAllData();
  }, []);

  return {
    evidence,
    timeline,
    documentAnalyses,
    loading,
    searchDocuments,
    getSynthesisSummary,
    refreshData: async () => {
      setLoading(true);
      await Promise.all([
        loadEvidence(),
        loadTimeline(),
        loadDocumentAnalyses()
      ]);
      setLoading(false);
    }
  };
};
