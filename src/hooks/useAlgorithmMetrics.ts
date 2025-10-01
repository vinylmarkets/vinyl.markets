import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlgorithmInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  performance: {
    totalTrades: number;
    winRate: number;
    avgTradeDuration: number;
    totalPnL: number;
    riskRewardRatio: number;
    sharpeRatio: number;
  };
  resourceUsage: {
    cpu: number;
    memory: number;
    apiCalls: number;
  };
  recentTrades: any[];
  activePositions: any[];
}

export interface AlgorithmFlowNode {
  id: string;
  label: string;
  type: 'entry' | 'decision' | 'action' | 'risk-check';
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
  lastTriggered: number;
}

export interface AlgorithmConnection {
  source: string;
  target: string;
  weight: number;
}

export const useAlgorithmMetrics = (algorithmId?: string) => {
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmInfo | null>(null);
  const [flowNodes, setFlowNodes] = useState<AlgorithmFlowNode[]>([]);
  const [flowConnections, setFlowConnections] = useState<AlgorithmConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlgorithms = useCallback(async () => {
    try {
      const { data: algorithmStatus } = await supabase
        .from('algorithm_status')
        .select('*');

      const { data: metrics } = await supabase
        .from('algorithm_metrics')
        .select('*')
        .order('timestamp', { ascending: false });

      const { data: trades } = await supabase
        .from('paper_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: positions } = await supabase
        .from('paper_positions')
        .select('*');

      // Build algorithm list
      const algos: AlgorithmInfo[] = (algorithmStatus || []).map((algo: any) => {
        const algoMetrics = metrics?.filter((m: any) => m.algorithm_id === algo.algorithm_id)[0];
        
        return {
          id: algo.algorithm_id,
          name: algo.algorithm_name,
          status: algo.status,
          uptime: algo.uptime_seconds || 0,
          performance: {
            totalTrades: algoMetrics?.trade_count || 0,
            winRate: algoMetrics?.win_rate || 0,
            avgTradeDuration: 240, // 4 hours average
            totalPnL: algoMetrics?.total_pnl || 0,
            riskRewardRatio: 1.8,
            sharpeRatio: algoMetrics?.sharpe_ratio || 0,
          },
          resourceUsage: {
            cpu: 15 + Math.random() * 10,
            memory: 45 + Math.random() * 15,
            apiCalls: 120 + Math.random() * 50,
          },
          recentTrades: trades || [],
          activePositions: positions || [],
        };
      });

      setAlgorithms(algos);

      // Set selected algorithm if ID provided
      if (algorithmId) {
        const selected = algos.find(a => a.id === algorithmId);
        if (selected) {
          setSelectedAlgorithm(selected);
          fetchAlgorithmFlow(algorithmId);
        }
      } else if (algos.length > 0) {
        setSelectedAlgorithm(algos[0]);
        fetchAlgorithmFlow(algos[0].id);
      }
    } catch (error) {
      console.error('Error fetching algorithms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch algorithm data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [algorithmId, toast]);

  const fetchAlgorithmFlow = useCallback((algoId: string) => {
    // Mock flow data - in production this would come from algorithm configuration
    const nodes: AlgorithmFlowNode[] = [
      {
        id: 'entry-1',
        label: 'Market Open Check',
        type: 'entry',
        executionCount: 1520,
        successRate: 98,
        avgExecutionTime: 5,
        lastTriggered: Date.now() - 60000,
      },
      {
        id: 'decision-1',
        label: 'Technical Analysis',
        type: 'decision',
        executionCount: 1490,
        successRate: 85,
        avgExecutionTime: 120,
        lastTriggered: Date.now() - 120000,
      },
      {
        id: 'decision-2',
        label: 'Sentiment Check',
        type: 'decision',
        executionCount: 1267,
        successRate: 78,
        avgExecutionTime: 200,
        lastTriggered: Date.now() - 180000,
      },
      {
        id: 'risk-1',
        label: 'Position Size Calculator',
        type: 'risk-check',
        executionCount: 980,
        successRate: 100,
        avgExecutionTime: 15,
        lastTriggered: Date.now() - 240000,
      },
      {
        id: 'action-1',
        label: 'Execute Buy Order',
        type: 'action',
        executionCount: 856,
        successRate: 92,
        avgExecutionTime: 350,
        lastTriggered: Date.now() - 300000,
      },
      {
        id: 'action-2',
        label: 'Execute Sell Order',
        type: 'action',
        executionCount: 798,
        successRate: 94,
        avgExecutionTime: 320,
        lastTriggered: Date.now() - 360000,
      },
      {
        id: 'action-3',
        label: 'Hold Position',
        type: 'action',
        executionCount: 412,
        successRate: 88,
        avgExecutionTime: 5,
        lastTriggered: Date.now() - 420000,
      },
    ];

    const connections: AlgorithmConnection[] = [
      { source: 'entry-1', target: 'decision-1', weight: 0.98 },
      { source: 'decision-1', target: 'decision-2', weight: 0.85 },
      { source: 'decision-2', target: 'risk-1', weight: 0.77 },
      { source: 'risk-1', target: 'action-1', weight: 0.52 },
      { source: 'risk-1', target: 'action-2', weight: 0.48 },
      { source: 'decision-2', target: 'action-3', weight: 0.23 },
    ];

    setFlowNodes(nodes);
    setFlowConnections(connections);
  }, []);

  useEffect(() => {
    fetchAlgorithms();
  }, [fetchAlgorithms]);

  const selectAlgorithm = useCallback((algoId: string) => {
    const algo = algorithms.find(a => a.id === algoId);
    if (algo) {
      setSelectedAlgorithm(algo);
      fetchAlgorithmFlow(algoId);
    }
  }, [algorithms, fetchAlgorithmFlow]);

  return {
    algorithms,
    selectedAlgorithm,
    flowNodes,
    flowConnections,
    loading,
    refetch: fetchAlgorithms,
    selectAlgorithm,
  };
};
