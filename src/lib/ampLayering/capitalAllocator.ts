import {
  LayerConfig,
  AllocationResult,
  PortfolioAllocation,
  AmpPerformanceMetrics,
  CoordinatedSignal,
} from '@/types/ampLayers';

export class CapitalAllocator {
  /**
   * Allocate capital across amps in layer
   */
  async allocateCapital(
    config: LayerConfig,
    totalCapital: number,
    ampPerformance: Map<string, AmpPerformanceMetrics>
  ): Promise<PortfolioAllocation> {
    switch (config.capitalStrategy) {
      case 'equal':
        return this.allocateEqual(config, totalCapital);
      case 'weighted':
        return this.allocateWeighted(config, totalCapital);
      case 'dynamic':
        return this.allocateDynamic(config, totalCapital, ampPerformance);
      case 'kelly':
        return this.allocateKelly(config, totalCapital, ampPerformance);
      default:
        return this.allocateEqual(config, totalCapital);
    }
  }

  /**
   * Equal allocation: Split capital equally
   */
  private allocateEqual(
    config: LayerConfig,
    totalCapital: number
  ): PortfolioAllocation {
    const activeAmps = config.amps.filter(amp => amp.is_enabled);
    const perAmpCapital = totalCapital / activeAmps.length;

    return {
      totalCapital,
      allocations: activeAmps.map(amp => ({
        ampId: amp.amp_id,
        allocated: perAmpCapital,
        percentage: 1 / activeAmps.length,
        reasoning: 'Equal split across all amps'
      })),
      reserved: 0,
      available: 0
    };
  }

  /**
   * Weighted allocation: Use capitalAllocation percentages
   */
  private allocateWeighted(
    config: LayerConfig,
    totalCapital: number
  ): PortfolioAllocation {
    const activeAmps = config.amps.filter(amp => amp.is_enabled);
    const totalWeight = activeAmps.reduce((sum, amp) =>
      sum + amp.capital_allocation, 0
    );

    // Normalize if weights don't sum to 1
    const normalizedAllocations = activeAmps.map(amp => {
      const normalizedWeight = totalWeight > 0
        ? amp.capital_allocation / totalWeight
        : 1 / activeAmps.length;

      return {
        ampId: amp.amp_id,
        allocated: totalCapital * normalizedWeight,
        percentage: normalizedWeight,
        reasoning: `Weighted: ${(normalizedWeight * 100).toFixed(1)}% based on configuration`
      };
    });

    return {
      totalCapital,
      allocations: normalizedAllocations,
      reserved: 0,
      available: 0
    };
  }

  /**
   * Dynamic allocation: Based on recent performance
   */
  private allocateDynamic(
    config: LayerConfig,
    totalCapital: number,
    ampPerformance: Map<string, AmpPerformanceMetrics>
  ): PortfolioAllocation {
    const activeAmps = config.amps.filter(amp => amp.is_enabled);

    // Calculate performance scores
    const scores = activeAmps.map(amp => {
      const perf = ampPerformance.get(amp.amp_id);
      
      if (!perf) {
        return { ampId: amp.amp_id, score: 0.1 }; // Default low score
      }

      // Score = Sharpe ratio * (1 + returns)
      // This rewards both risk-adjusted returns and absolute returns
      const score = Math.max(0.1, perf.sharpe * (1 + perf.returns));

      return { ampId: amp.amp_id, score };
    });

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

    const allocations = scores.map(s => ({
      ampId: s.ampId,
      allocated: totalCapital * (s.score / totalScore),
      percentage: s.score / totalScore,
      reasoning: `Dynamic: ${(s.score / totalScore * 100).toFixed(1)}% based on recent performance`
    }));

    return {
      totalCapital,
      allocations,
      reserved: 0,
      available: 0
    };
  }

  /**
   * Kelly Criterion allocation: Optimal bet sizing
   */
  private allocateKelly(
    config: LayerConfig,
    totalCapital: number,
    ampPerformance: Map<string, AmpPerformanceMetrics>
  ): PortfolioAllocation {
    const activeAmps = config.amps.filter(amp => amp.is_enabled);

    // Calculate Kelly fractions
    const kellyFractions = activeAmps.map(amp => {
      const perf = ampPerformance.get(amp.amp_id);
      
      if (!perf || !perf.winRate || !perf.avgWin || !perf.avgLoss) {
        return { ampId: amp.amp_id, kelly: 0.05 }; // Default 5%
      }

      // Kelly Formula: f = (bp - q) / b
      // f = fraction to bet
      // b = odds (avgWin / avgLoss)
      // p = win probability
      // q = loss probability (1 - p)
      const b = perf.avgWin / perf.avgLoss;
      const p = perf.winRate;
      const q = 1 - p;

      let kelly = (b * p - q) / b;

      // Apply fractional Kelly (half-Kelly for safety)
      kelly = Math.max(0.01, Math.min(0.25, kelly * 0.5));

      return { ampId: amp.amp_id, kelly };
    });

    const totalKelly = kellyFractions.reduce((sum, k) => sum + k.kelly, 0);

    // Normalize to ensure total doesn't exceed 1
    const allocations = kellyFractions.map(k => {
      const normalized = k.kelly / totalKelly;
      return {
        ampId: k.ampId,
        allocated: totalCapital * normalized,
        percentage: normalized,
        reasoning: `Kelly: ${(normalized * 100).toFixed(1)}% (half-Kelly for risk management)`
      };
    });

    return {
      totalCapital,
      allocations,
      reserved: 0,
      available: 0
    };
  }

  /**
   * Calculate position size for a signal
   */
  calculatePositionSize(
    signal: CoordinatedSignal,
    allocation: AllocationResult,
    currentPrice: number
  ): number {
    // Simple calculation: allocated capital / current price
    // Round down to ensure we don't exceed allocation
    return Math.floor(allocation.allocated / currentPrice);
  }
}
