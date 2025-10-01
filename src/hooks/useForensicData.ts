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

  // Fetch evidence from forensic documents
  const loadEvidence = async () => {
    try {
      const { data: documents, error } = await supabase
        .from('forensic_documents')
        .select('*')
        .eq('analysis_status', 'complete')
        .order('analyzed_at', { ascending: false });

      if (error) throw error;

      const evidenceMap = new Map<string, ForensicEvidence>();
      
      // Helper function to filter out negative/limitation statements
      const isValidFinding = (finding: string): boolean => {
        const lowerFinding = finding.toLowerCase();
        
        // Filter out any statement that indicates absence or inability to determine
        const negativePatterns = [
          'no specific',
          'cannot be extracted',
          'cannot be identified',
          'not available',
          'no evidence',
          'metadata alone',
          'no direct',
          'no clear',
          'without content',
          'without document content',
          'entirely unavailable',
          'no forensic analysis',
          'can be provided without',
          'cannot be provided',
          'no information',
          'lack of',
          'unable to',
          'impossible to',
          'not possible',
          'requires content',
          'requires document',
          'not present',
          'absence of',
          'no mention',
          'not mentioned',
          'no details',
          'no data'
        ];
        
        // Check if finding contains any negative pattern
        const hasNegativePattern = negativePatterns.some(pattern => 
          lowerFinding.includes(pattern)
        );
        
        // Also filter very short findings
        const isTooShort = lowerFinding.trim().length < 30;
        
        return !hasNegativePattern && !isTooShort;
      };
      
      documents?.forEach(doc => {
        const rawFindings = doc.findings || [];
        const findings = rawFindings.filter(isValidFinding);
        const analysisResult = doc.analysis_result as any;
        const entities = analysisResult?.entities || [];
        
        // Group by key entities mentioned
        const categories = [
          { key: 'ryan cohen', name: 'Ryan Cohen Activity' },
          { key: 'dk-butterfly', name: 'DK-Butterfly Entity' },
          { key: 'bbby', name: 'BBBY/Bed Bath & Beyond' },
          { key: 'overstock', name: 'Overstock/Beyond' },
          { key: 'section 382', name: 'Tax Strategy (Section 382)' },
          { key: 'nol', name: 'NOLs & Financial Structure' }
        ];

        categories.forEach(({ key, name }) => {
          const relevantFindings = findings.filter((f: string) => 
            f.toLowerCase().includes(key)
          );

          if (relevantFindings.length > 0) {
            if (!evidenceMap.has(name)) {
              evidenceMap.set(name, {
                category: name,
                status: 'investigating',
                confidence: doc.confidence_score || 60,
                items: [],
                source: `${doc.filename}`
              });
            }

            const evidence = evidenceMap.get(name)!;
            evidence.items.push(...relevantFindings);
            evidence.confidence = Math.max(evidence.confidence, doc.confidence_score || 60);
            
            // Determine status based on confidence
            if (evidence.confidence >= 85) evidence.status = 'confirmed';
            else if (evidence.confidence >= 70) evidence.status = 'strong';
            else if (evidence.confidence >= 50) evidence.status = 'investigating';
            else evidence.status = 'weak';
          }
        });

        // Add uncategorized findings as "General Evidence"
        const uncategorizedFindings = findings.filter((f: string) => 
          !categories.some(({ key }) => f.toLowerCase().includes(key))
        );

        if (uncategorizedFindings.length > 0) {
          if (!evidenceMap.has('General Evidence')) {
            evidenceMap.set('General Evidence', {
              category: 'General Evidence',
              status: 'investigating',
              confidence: doc.confidence_score || 50,
              items: [],
              source: `${doc.filename}`
            });
          }
          const generalEvidence = evidenceMap.get('General Evidence')!;
          generalEvidence.items.push(...uncategorizedFindings);
        }
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
      const queryLower = query.toLowerCase();
      const results: SearchResult[] = [];
      
      // Search forensic documents
      const { data: documents, error: docError } = await supabase
        .from('forensic_documents')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(50);

      if (!docError && documents) {
        documents.forEach(doc => {
          let relevanceScore = 0;
          let matchedExcerpt = '';
          
          // Search in filename
          if (doc.filename?.toLowerCase().includes(queryLower)) {
            relevanceScore += 30;
            matchedExcerpt = doc.filename;
          }
          
          // Search in findings
          if (doc.findings && Array.isArray(doc.findings)) {
            const matchingFindings = doc.findings.filter((f: string) => 
              f.toLowerCase().includes(queryLower)
            );
            if (matchingFindings.length > 0) {
              relevanceScore += matchingFindings.length * 20;
              matchedExcerpt = matchingFindings[0].substring(0, 200);
            }
          }
          
          // Search in metadata
          if (doc.metadata) {
            const metadataStr = JSON.stringify(doc.metadata).toLowerCase();
            if (metadataStr.includes(queryLower)) {
              relevanceScore += 15;
            }
          }
          
          if (relevanceScore > 0) {
            results.push({
              title: doc.filename,
              type: 'Forensic Document',
              date: new Date(doc.uploaded_at).toLocaleDateString(),
              relevance: Math.min(relevanceScore, 100),
              excerpt: matchedExcerpt || 'Document contains relevant information',
              source: 'forensic_documents'
            });
          }
        });
      }
      
      // Search knowledge graph
      const { nodes } = await fetchKnowledgeGraph();
      
      nodes.forEach(node => {
        const nodeData = node as any;
        const searchText = `${nodeData.entity_id} ${nodeData.properties?.description || ''}`.toLowerCase();
        
        if (searchText.includes(queryLower)) {
          const relevance = calculateRelevance(node, query);
          
          results.push({
            title: nodeData.entity_id,
            type: nodeData.node_type || 'Knowledge Graph Node',
            date: nodeData.properties?.date || new Date().toLocaleDateString(),
            relevance,
            excerpt: nodeData.properties?.description || nodeData.entity_id,
            source: 'knowledge_graph'
          });
        }
      });
      
      // Sort by relevance and return top results
      return results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 20);
      
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
