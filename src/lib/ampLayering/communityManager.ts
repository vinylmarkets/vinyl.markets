import { supabase } from '@/integrations/supabase/client';

export interface SharedLayer {
  id: string;
  layerId: string;
  sharedBy: string;
  title: string;
  description: string;
  strategyTags: string[];
  performanceSummary: {
    totalReturn: number;
    sharpeRatio: number;
    winRate: number;
    avgDailyReturn: number;
  };
  viewCount: number;
  cloneCount: number;
  avgRating: number;
  totalRatings: number;
  createdAt: Date;
}

export class CommunityManager {
  async shareLayer(
    layerId: string,
    userId: string,
    title: string,
    description: string,
    tags: string[]
  ): Promise<string> {
    const performance = await this.calculatePerformanceSummary(layerId);

    const { data: shared } = await supabase
      .from('shared_layers')
      .insert({
        layer_id: layerId,
        shared_by: userId,
        title,
        description,
        strategy_tags: tags,
        performance_summary: performance
      })
      .select()
      .single();

    if (!shared) throw new Error('Failed to share layer');
    return shared.id;
  }

  async getSharedLayers(filter?: { tags?: string[]; minRating?: number }): Promise<SharedLayer[]> {
    let query = supabase
      .from('shared_layers')
      .select(`
        *,
        layer_ratings(rating)
      `)
      .eq('is_public', true)
      .order('clone_count', { ascending: false });

    if (filter?.tags && filter.tags.length > 0) {
      query = query.overlaps('strategy_tags', filter.tags);
    }

    const { data, error } = await query;
    if (error) throw error;

    const layers = (data || []).map(layer => {
      const ratings = (layer.layer_ratings as any[]) || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        id: layer.id,
        layerId: layer.layer_id,
        sharedBy: layer.shared_by,
        title: layer.title,
        description: layer.description || '',
        strategyTags: layer.strategy_tags || [],
        performanceSummary: layer.performance_summary as any,
        viewCount: layer.view_count || 0,
        cloneCount: layer.clone_count || 0,
        avgRating,
        totalRatings: ratings.length,
        createdAt: new Date(layer.created_at)
      };
    });

    if (filter?.minRating) {
      return layers.filter(l => l.avgRating >= filter.minRating!);
    }

    return layers;
  }

  async cloneSharedLayer(sharedLayerId: string, userId: string, newName?: string): Promise<string> {
    const { data: shared } = await supabase
      .from('shared_layers')
      .select('*')
      .eq('id', sharedLayerId)
      .single();

    if (!shared) throw new Error('Shared layer not found');

    const { data: originalLayer } = await supabase
      .from('amp_layers')
      .select('*')
      .eq('id', shared.layer_id)
      .single();

    if (!originalLayer) throw new Error('Original layer not found');

    const { data: newLayer } = await supabase
      .from('amp_layers')
      .insert({
        user_id: userId,
        name: newName || `${shared.title} (Cloned)`,
        description: shared.description,
        is_active: false
      })
      .select()
      .single();

    if (!newLayer) throw new Error('Failed to create layer');

    const { data: originalAmps } = await supabase
      .from('layer_amps')
      .select('*')
      .eq('layer_id', shared.layer_id);

    if (originalAmps && originalAmps.length > 0) {
      const newAmps = originalAmps.map(amp => ({
        layer_id: newLayer.id,
        amp_id: amp.amp_id,
        priority: amp.priority,
        capital_allocation: amp.capital_allocation,
        is_enabled: amp.is_enabled,
        settings: amp.settings
      }));

      await supabase.from('layer_amps').insert(newAmps);
    }

    await supabase
      .from('shared_layers')
      .update({ 
        clone_count: (shared.clone_count || 0) + 1,
        view_count: (shared.view_count || 0) + 1
      })
      .eq('id', sharedLayerId);

    return newLayer.id;
  }

  async rateSharedLayer(sharedLayerId: string, userId: string, rating: number, review?: string): Promise<void> {
    await supabase
      .from('layer_ratings')
      .insert({
        shared_layer_id: sharedLayerId,
        user_id: userId,
        rating,
        review
      });
  }

  async updateLayerView(sharedLayerId: string): Promise<void> {
    const { data: shared } = await supabase
      .from('shared_layers')
      .select('view_count')
      .eq('id', sharedLayerId)
      .single();

    if (shared) {
      await supabase
        .from('shared_layers')
        .update({ view_count: (shared.view_count || 0) + 1 })
        .eq('id', sharedLayerId);
    }
  }

  private async calculatePerformanceSummary(layerId: string) {
    const { data: performance } = await supabase
      .from('layer_performance')
      .select('*')
      .eq('layer_id', layerId)
      .order('date', { ascending: false })
      .limit(30);

    if (!performance || performance.length === 0) {
      return {
        totalReturn: 0,
        sharpeRatio: 0,
        winRate: 0.5,
        avgDailyReturn: 0
      };
    }

    const totalReturn = performance.reduce((sum, p) => sum + (p.pnl || 0), 0);
    const avgReturn = totalReturn / performance.length;
    const returns = performance.map(p => p.pnl || 0);
    const stdDev = this.calculateStdDev(returns, avgReturn);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    const winningDays = performance.filter(p => (p.pnl || 0) > 0).length;
    const winRate = performance.length > 0 ? winningDays / performance.length : 0.5;

    return {
      totalReturn,
      sharpeRatio,
      winRate,
      avgDailyReturn: avgReturn
    };
  }

  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }
}
