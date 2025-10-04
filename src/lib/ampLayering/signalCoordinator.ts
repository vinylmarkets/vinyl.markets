import { AggregatedSignal } from '@/lib/signalAggregator';
import { LayerConfig, CoordinatedSignal } from '@/types/ampLayers';

export class SignalCoordinator {
  /**
   * Coordinate signals from multiple amps
   */
  async coordinateSignals(
    ampSignals: Map<string, AggregatedSignal[]>,
    config: LayerConfig,
    availableCapital: number
  ): Promise<CoordinatedSignal[]> {
    // Group signals by symbol
    const symbolSignals = this.groupSignalsBySymbol(ampSignals);

    // Process each symbol
    const coordinated: CoordinatedSignal[] = [];
    
    for (const [symbol, signals] of symbolSignals.entries()) {
      const result = await this.coordinateSymbol(
        symbol,
        signals,
        config,
        availableCapital
      );

      if (result.action !== 'hold') {
        coordinated.push(result);
      }
    }

    return coordinated.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Coordinate signals for a single symbol
   */
  private async coordinateSymbol(
    symbol: string,
    signals: Array<{ ampId: string; signal: AggregatedSignal }>,
    config: LayerConfig,
    availableCapital: number
  ): Promise<CoordinatedSignal> {
    // Apply conflict resolution strategy
    switch (config.conflictResolution) {
      case 'priority':
        return this.resolveByPriority(symbol, signals, config);
      case 'confidence':
        return this.resolveByConfidence(symbol, signals, config);
      case 'weighted':
        return this.resolveByWeighting(symbol, signals, config);
      case 'veto':
        return this.resolveByVeto(symbol, signals, config);
      default:
        return this.resolveByPriority(symbol, signals, config);
    }
  }

  /**
   * Priority-based resolution: Highest priority amp wins
   */
  private resolveByPriority(
    symbol: string,
    signals: Array<{ ampId: string; signal: AggregatedSignal }>,
    config: LayerConfig
  ): CoordinatedSignal {
    // Sort by priority (already sorted in config)
    const sortedSignals = signals.sort((a, b) => {
      const priorityA = config.amps.find(amp => amp.amp_id === a.ampId)?.priority || 0;
      const priorityB = config.amps.find(amp => amp.amp_id === b.ampId)?.priority || 0;
      return priorityB - priorityA;
    });

    const winner = sortedSignals[0];
    const ampConfig = config.amps.find(amp => amp.amp_id === winner.ampId);

    // Check for conflicts
    const hasConflict = signals.some(s =>
      s.signal.action !== winner.signal.action && s.signal.action !== 'hold'
    );

    return {
      action: winner.signal.action,
      symbol,
      quantity: winner.signal.quantity,
      confidence: winner.signal.confidence,
      contributingAmps: [{
        ampId: winner.ampId,
        ampName: ampConfig?.amp_id || 'Unknown',
        signal: winner.signal,
        weight: 1.0
      }],
      resolution: {
        method: 'priority',
        conflicts: hasConflict,
        reasoning: hasConflict
          ? `Priority-based: ${ampConfig?.amp_id} (priority ${ampConfig?.priority}) overrides conflicting signals`
          : `Priority-based: ${ampConfig?.amp_id} (priority ${ampConfig?.priority})`
      }
    };
  }

  /**
   * Confidence-based resolution: Highest confidence signal wins
   */
  private resolveByConfidence(
    symbol: string,
    signals: Array<{ ampId: string; signal: AggregatedSignal }>,
    config: LayerConfig
  ): CoordinatedSignal {
    const sortedByConfidence = signals.sort((a, b) =>
      b.signal.confidence - a.signal.confidence
    );

    const winner = sortedByConfidence[0];
    const ampConfig = config.amps.find(amp => amp.amp_id === winner.ampId);

    const hasConflict = signals.some(s =>
      s.signal.action !== winner.signal.action && s.signal.action !== 'hold'
    );

    return {
      action: winner.signal.action,
      symbol,
      quantity: winner.signal.quantity,
      confidence: winner.signal.confidence,
      contributingAmps: [{
        ampId: winner.ampId,
        ampName: ampConfig?.amp_id || 'Unknown',
        signal: winner.signal,
        weight: 1.0
      }],
      resolution: {
        method: 'confidence',
        conflicts: hasConflict,
        reasoning: hasConflict
          ? `Confidence-based: ${ampConfig?.amp_id} (${(winner.signal.confidence * 100).toFixed(1)}% confidence) overrides conflicting signals`
          : `Confidence-based: ${ampConfig?.amp_id} (${(winner.signal.confidence * 100).toFixed(1)}% confidence)`
      }
    };
  }

  /**
   * Weighted resolution: Combine signals by priority weights
   */
  private resolveByWeighting(
    symbol: string,
    signals: Array<{ ampId: string; signal: AggregatedSignal }>,
    config: LayerConfig
  ): CoordinatedSignal {
    // Calculate weighted scores
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;

    const contributingAmps = signals.map(s => {
      const ampConfig = config.amps.find(amp => amp.amp_id === s.ampId);
      const weight = (ampConfig?.priority || 50) / 100; // Normalize to 0-1
      totalWeight += weight;

      if (s.signal.action === 'buy') {
        buyScore += weight * s.signal.confidence;
      } else if (s.signal.action === 'sell') {
        sellScore += weight * s.signal.confidence;
      }

      return {
        ampId: s.ampId,
        ampName: ampConfig?.amp_id || 'Unknown',
        signal: s.signal,
        weight
      };
    });

    // Determine final action
    const finalAction: 'buy' | 'sell' | 'hold' =
      buyScore > sellScore ? 'buy' :
      sellScore > buyScore ? 'sell' : 'hold';

    const finalConfidence = Math.max(buyScore, sellScore) / totalWeight;
    const avgQuantity = Math.round(
      signals.reduce((sum, s) => sum + s.signal.quantity, 0) / signals.length
    );

    const hasConflict = buyScore > 0 && sellScore > 0;

    return {
      action: finalAction,
      symbol,
      quantity: avgQuantity,
      confidence: finalConfidence,
      contributingAmps,
      resolution: {
        method: 'weighted',
        conflicts: hasConflict,
        reasoning: hasConflict
          ? `Weighted average: ${finalAction.toUpperCase()} score ${finalConfidence.toFixed(2)} from ${signals.length} amps (buy: ${buyScore.toFixed(2)}, sell: ${sellScore.toFixed(2)})`
          : `Weighted average: ${finalAction.toUpperCase()} score ${finalConfidence.toFixed(2)} from ${signals.length} amps`
      }
    };
  }

  /**
   * Veto resolution: Any SELL signal cancels all BUYs
   */
  private resolveByVeto(
    symbol: string,
    signals: Array<{ ampId: string; signal: AggregatedSignal }>,
    config: LayerConfig
  ): CoordinatedSignal {
    const sellSignals = signals.filter(s => s.signal.action === 'sell');
    const buySignals = signals.filter(s => s.signal.action === 'buy');

    // If any SELL signal exists, veto all BUYs
    if (sellSignals.length > 0) {
      const strongestSell = sellSignals.sort((a, b) =>
        b.signal.confidence - a.signal.confidence
      )[0];

      const ampConfig = config.amps.find(amp => amp.amp_id === strongestSell.ampId);

      return {
        action: 'sell',
        symbol,
        quantity: strongestSell.signal.quantity,
        confidence: strongestSell.signal.confidence,
        contributingAmps: [{
          ampId: strongestSell.ampId,
          ampName: ampConfig?.amp_id || 'Unknown',
          signal: strongestSell.signal,
          weight: 1.0
        }],
        resolution: {
          method: 'veto',
          conflicts: buySignals.length > 0,
          reasoning: `Veto: ${ampConfig?.amp_id} SELL signal vetoes ${buySignals.length} BUY signal(s)`
        }
      };
    }

    // No SELL signals - proceed with strongest BUY
    if (buySignals.length === 0) {
      return {
        action: 'hold',
        symbol,
        quantity: 0,
        confidence: 0,
        contributingAmps: [],
        resolution: {
          method: 'veto',
          conflicts: false,
          reasoning: 'No actionable signals'
        }
      };
    }

    const strongestBuy = buySignals.sort((a, b) =>
      b.signal.confidence - a.signal.confidence
    )[0];

    const ampConfig = config.amps.find(amp => amp.amp_id === strongestBuy.ampId);

    return {
      action: 'buy',
      symbol,
      quantity: strongestBuy.signal.quantity,
      confidence: strongestBuy.signal.confidence,
      contributingAmps: [{
        ampId: strongestBuy.ampId,
        ampName: ampConfig?.amp_id || 'Unknown',
        signal: strongestBuy.signal,
        weight: 1.0
      }],
      resolution: {
        method: 'veto',
        conflicts: false,
        reasoning: `Veto: No SELL signals, proceeding with ${ampConfig?.amp_id}`
      }
    };
  }

  /**
   * Helper: Group signals by symbol
   */
  private groupSignalsBySymbol(
    ampSignals: Map<string, AggregatedSignal[]>
  ): Map<string, Array<{ ampId: string; signal: AggregatedSignal }>> {
    const grouped = new Map<string, Array<{ ampId: string; signal: AggregatedSignal }>>();

    for (const [ampId, signals] of ampSignals.entries()) {
      for (const signal of signals) {
        if (!grouped.has(signal.symbol)) {
          grouped.set(signal.symbol, []);
        }
        grouped.get(signal.symbol)!.push({ ampId, signal });
      }
    }

    return grouped;
  }
}
