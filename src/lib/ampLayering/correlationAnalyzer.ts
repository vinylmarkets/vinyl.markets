import { supabase } from '@/integrations/supabase/client';

export interface CorrelationMatrix {
  ampIds: string[];
  matrix: number[][];
  timestamp: Date;
}

export interface CorrelationAnalysis {
  layerId: string;
  correlations: Array<{
    amp1: string;
    amp2: string;
    correlation: number;
    strength: 'high' | 'medium' | 'low';
  }>;
  avgCorrelation: number;
  maxCorrelation: number;
  diversificationScore: number;
}

export class CorrelationAnalyzer {
  async analyzeLayerCorrelation(layerId: string, lookbackDays: number = 30): Promise<CorrelationAnalysis> {
    const { data: layerAmps } = await supabase
      .from('layer_amps')
      .select('amp_id')
      .eq('layer_id', layerId)
      .eq('is_enabled', true);

    if (!layerAmps || layerAmps.length < 2) {
      throw new Error('Need at least 2 amps to calculate correlation');
    }

    const ampIds = layerAmps.map(la => la.amp_id);
    const signalsByAmp = await this.fetchSignalHistory(ampIds, lookbackDays, layerId);
    const matrix = this.calculateCorrelationMatrix(signalsByAmp);

    const correlations = [];
    for (let i = 0; i < ampIds.length; i++) {
      for (let j = i + 1; j < ampIds.length; j++) {
        const corr = matrix[i][j];
        correlations.push({
          amp1: ampIds[i],
          amp2: ampIds[j],
          correlation: corr,
          strength: this.classifyCorrelation(corr)
        });
      }
    }

    const avgCorrelation = correlations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / correlations.length;
    const maxCorrelation = Math.max(...correlations.map(c => Math.abs(c.correlation)));
    const diversificationScore = this.calculateDiversificationScore(avgCorrelation, maxCorrelation);

    return { layerId, correlations, avgCorrelation, maxCorrelation, diversificationScore };
  }

  private async fetchSignalHistory(ampIds: string[], days: number, layerId: string) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const signalsByAmp: Map<string, Array<{ date: string, signal: number }>> = new Map();

    for (const ampId of ampIds) {
      const { data: signals } = await supabase
        .from('coordinated_signals')
        .select('created_at, action, symbol')
        .eq('layer_id', layerId)
        .contains('contributing_amps', [{ amp_id: ampId }])
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at');

      const dailySeries = this.convertToDailySeries(signals || []);
      signalsByAmp.set(ampId, dailySeries);
    }

    return signalsByAmp;
  }

  private convertToDailySeries(signals: any[]): Array<{ date: string, signal: number }> {
    const dailyMap: Map<string, number[]> = new Map();

    signals.forEach(signal => {
      const date = new Date(signal.created_at).toISOString().split('T')[0];
      const signalValue = signal.action === 'BUY' ? 1 : signal.action === 'SELL' ? -1 : 0;

      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(signalValue);
    });

    return Array.from(dailyMap.entries()).map(([date, values]) => ({
      date,
      signal: values.reduce((sum, v) => sum + v, 0) / values.length
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateCorrelationMatrix(signalsByAmp: Map<string, Array<{ date: string, signal: number }>>): number[][] {
    const ampIds = Array.from(signalsByAmp.keys());
    const n = ampIds.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          const series1 = signalsByAmp.get(ampIds[i])!;
          const series2 = signalsByAmp.get(ampIds[j])!;
          matrix[i][j] = this.pearsonCorrelation(series1, series2);
        }
      }
    }

    return matrix;
  }

  private pearsonCorrelation(
    series1: Array<{ date: string, signal: number }>,
    series2: Array<{ date: string, signal: number }>
  ): number {
    const dates1 = new Set(series1.map(s => s.date));
    const dates2 = new Set(series2.map(s => s.date));
    const commonDates = Array.from(dates1).filter(d => dates2.has(d));

    if (commonDates.length < 2) return 0;

    const map1 = new Map(series1.map(s => [s.date, s.signal]));
    const map2 = new Map(series2.map(s => [s.date, s.signal]));

    const values1 = commonDates.map(d => map1.get(d)!);
    const values2 = commonDates.map(d => map2.get(d)!);

    const mean1 = values1.reduce((sum, v) => sum + v, 0) / values1.length;
    const mean2 = values2.reduce((sum, v) => sum + v, 0) / values2.length;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private classifyCorrelation(corr: number): 'high' | 'medium' | 'low' {
    const absCorr = Math.abs(corr);
    if (absCorr >= 0.7) return 'high';
    if (absCorr >= 0.4) return 'medium';
    return 'low';
  }

  private calculateDiversificationScore(avgCorr: number, maxCorr: number): number {
    const avgScore = (1 - avgCorr) * 50;
    const maxScore = (1 - maxCorr) * 50;
    return Math.round(avgScore + maxScore);
  }
}
