import { supabase } from '@/integrations/supabase/client';
import {
  AmpLayer,
  LayerAmp,
  LayerConfig,
  ConflictResolutionStrategy,
  CapitalAllocationStrategy,
} from '@/types/ampLayers';

export class LayerConfigService {
  /**
   * Create a new amp layer
   */
  async createLayer(
    userId: string,
    name: string,
    description?: string
  ): Promise<AmpLayer> {
    const { data, error } = await supabase
      .from('amp_layers')
      .insert({
        user_id: userId,
        name,
        description,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Create default settings for the layer
    await supabase.from('layer_settings').insert({
      layer_id: data.id,
      conflict_resolution: 'priority',
      capital_strategy: 'weighted',
    });

    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }

  /**
   * Add amp to layer
   */
  async addAmpToLayer(
    layerId: string,
    ampId: string,
    priority: number = 50,
    capitalAllocation: number = 0
  ): Promise<LayerAmp> {
    const { data, error } = await supabase
      .from('layer_amps')
      .insert({
        layer_id: layerId,
        amp_id: ampId,
        priority,
        capital_allocation: capitalAllocation,
        is_enabled: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as LayerAmp;
  }

  /**
   * Get complete layer configuration
   */
  async getLayerConfig(layerId: string): Promise<LayerConfig> {
    // Fetch layer
    const { data: layer, error: layerError } = await supabase
      .from('amp_layers')
      .select('*')
      .eq('id', layerId)
      .single();

    if (layerError) throw layerError;

    // Fetch amps in layer
    const { data: amps, error: ampsError } = await supabase
      .from('layer_amps')
      .select('*')
      .eq('layer_id', layerId)
      .eq('is_enabled', true)
      .order('priority', { ascending: false });

    if (ampsError) throw ampsError;

    // Fetch strategies from layer settings
    const { data: settings } = await supabase
      .from('layer_settings')
      .select('*')
      .eq('layer_id', layerId)
      .single();

    return {
      layer: {
        ...layer,
        created_at: new Date(layer.created_at),
        updated_at: new Date(layer.updated_at),
      },
      amps: (amps || []).map(amp => ({ ...amp, settings: amp.settings as Record<string, any> })),
      conflictResolution: (settings?.conflict_resolution || 'priority') as ConflictResolutionStrategy,
      capitalStrategy: (settings?.capital_strategy || 'weighted') as CapitalAllocationStrategy,
    };
  }

  /**
   * Update amp priority in layer
   */
  async updateAmpPriority(
    layerAmpId: string,
    newPriority: number
  ): Promise<void> {
    const { error } = await supabase
      .from('layer_amps')
      .update({ priority: newPriority })
      .eq('id', layerAmpId);

    if (error) throw error;
  }

  /**
   * Update capital allocation
   */
  async updateCapitalAllocation(
    layerAmpId: string,
    allocation: number
  ): Promise<void> {
    if (allocation < 0 || allocation > 1) {
      throw new Error('Allocation must be between 0 and 1');
    }

    const { error } = await supabase
      .from('layer_amps')
      .update({ capital_allocation: allocation })
      .eq('id', layerAmpId);

    if (error) throw error;
  }

  /**
   * Remove amp from layer
   */
  async removeAmpFromLayer(layerAmpId: string): Promise<void> {
    const { error } = await supabase
      .from('layer_amps')
      .update({ is_enabled: false })
      .eq('id', layerAmpId);

    if (error) throw error;
  }

  /**
   * Activate/deactivate layer
   */
  async toggleLayer(layerId: string, active: boolean): Promise<void> {
    const { error } = await supabase
      .from('amp_layers')
      .update({
        is_active: active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', layerId);

    if (error) throw error;
  }

  /**
   * Get all layers for user
   */
  async getUserLayers(userId: string): Promise<AmpLayer[]> {
    const { data, error } = await supabase
      .from('amp_layers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(layer => ({
      ...layer,
      created_at: new Date(layer.created_at),
      updated_at: new Date(layer.updated_at),
    }));
  }

  /**
   * Update layer settings
   */
  async updateLayerSettings(
    layerId: string,
    conflictResolution?: ConflictResolutionStrategy,
    capitalStrategy?: CapitalAllocationStrategy
  ): Promise<void> {
    const updates: any = { updated_at: new Date().toISOString() };
    
    if (conflictResolution) updates.conflict_resolution = conflictResolution;
    if (capitalStrategy) updates.capital_strategy = capitalStrategy;

    const { error } = await supabase
      .from('layer_settings')
      .update(updates)
      .eq('layer_id', layerId);

    if (error) throw error;
  }

  /**
   * Delete layer
   */
  async deleteLayer(layerId: string): Promise<void> {
    const { error } = await supabase
      .from('amp_layers')
      .delete()
      .eq('id', layerId);

    if (error) throw error;
  }
}
