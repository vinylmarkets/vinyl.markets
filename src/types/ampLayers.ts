import { AggregatedSignal } from '@/lib/signalAggregator';

export interface AmpLayer {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LayerAmp {
  id: string;
  layer_id: string;
  amp_id: string;
  priority: number; // 1-100, higher = more important
  capital_allocation: number; // 0-1 (percentage of total)
  is_enabled: boolean;
  settings?: Record<string, any>;
}

export interface LayerSettings {
  id: string;
  layer_id: string;
  conflict_resolution: ConflictResolutionStrategy;
  capital_strategy: CapitalAllocationStrategy;
  max_positions: number;
  max_exposure: number;
  updated_at: Date;
}

export interface LayerConfig {
  layer: AmpLayer;
  amps: LayerAmp[];
  conflictResolution: ConflictResolutionStrategy;
  capitalStrategy: CapitalAllocationStrategy;
}

export type ConflictResolutionStrategy =
  | 'priority'    // Higher priority amp wins
  | 'confidence'  // Higher confidence signal wins
  | 'weighted'    // Weighted average of signals
  | 'veto';       // Any SELL signal cancels all BUYs

export type CapitalAllocationStrategy =
  | 'equal'     // Split capital equally
  | 'weighted'  // Use capitalAllocation percentages
  | 'dynamic'   // Allocate based on recent performance
  | 'kelly';    // Kelly Criterion based allocation

export interface CoordinatedSignal {
  action: 'buy' | 'sell' | 'hold';
  symbol: string;
  quantity: number;
  confidence: number;
  contributingAmps: {
    ampId: string;
    ampName: string;
    signal: AggregatedSignal;
    weight: number;
  }[];
  resolution: {
    method: string;
    conflicts: boolean;
    reasoning: string;
  };
}

export interface AllocationResult {
  ampId: string;
  allocated: number;
  percentage: number;
  reasoning: string;
}

export interface PortfolioAllocation {
  totalCapital: number;
  allocations: AllocationResult[];
  reserved: number;
  available: number;
}

export interface AmpPerformanceMetrics {
  sharpe: number;
  returns: number;
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
}
