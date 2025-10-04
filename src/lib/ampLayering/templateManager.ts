import { supabase } from '@/integrations/supabase/client';

export interface LayerTemplate {
  id: string;
  name: string;
  description: string;
  strategyType: string;
  riskProfile: string;
  configuration: {
    amps: Array<{
      ampId: string;
      priority: number;
      capitalAllocation: number;
    }>;
    conflictResolution: string;
    capitalStrategy: string;
  };
  usageCount: number;
  avgRating: number;
  isOfficial: boolean;
}

export class TemplateManager {
  async getTemplates(filter?: { strategyType?: string; riskProfile?: string }): Promise<LayerTemplate[]> {
    let query = supabase
      .from('layer_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (filter?.strategyType) {
      query = query.eq('strategy_type', filter.strategyType);
    }
    if (filter?.riskProfile) {
      query = query.eq('risk_profile', filter.riskProfile);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      strategyType: t.strategy_type,
      riskProfile: t.risk_profile,
      configuration: t.configuration as any,
      usageCount: t.usage_count || 0,
      avgRating: typeof t.avg_rating === 'number' ? t.avg_rating : parseFloat(t.avg_rating || '0'),
      isOfficial: t.is_official || false
    }));
  }

  async applyTemplate(templateId: string, userId: string, layerName?: string): Promise<string> {
    const { data: template } = await supabase
      .from('layer_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) throw new Error('Template not found');

    const { data: layer } = await supabase
      .from('amp_layers')
      .insert({
        user_id: userId,
        name: layerName || `${template.name} (Copy)`,
        description: template.description,
        is_active: false
      })
      .select()
      .single();

    if (!layer) throw new Error('Failed to create layer');

    const config = template.configuration as any;
    const layerAmps = config.amps.map((amp: any) => ({
      layer_id: layer.id,
      amp_id: amp.ampId,
      priority: amp.priority,
      allocated_capital: amp.capitalAllocation,
      is_enabled: true
    }));

    await supabase.from('layer_amps').insert(layerAmps);

    // Layer config is stored in layer_amps settings, no separate table

    await supabase
      .from('layer_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId);

    return layer.id;
  }

  async createTemplate(
    userId: string,
    name: string,
    description: string,
    strategyType: string,
    riskProfile: string,
    layerId: string,
    isPublic: boolean = false
  ): Promise<string> {
    const { data: layerAmps } = await supabase
      .from('layer_amps')
      .select('*')
      .eq('layer_id', layerId)
      .eq('is_enabled', true);

    const configuration = {
      amps: (layerAmps || []).map(amp => ({
        ampId: amp.amp_id,
        priority: amp.priority,
        capitalAllocation: amp.capital_allocation
      })),
      conflictResolution: 'confidence',
      capitalStrategy: 'performance'
    };

    const { data: template } = await supabase
      .from('layer_templates')
      .insert({
        created_by: userId,
        name,
        description,
        strategy_type: strategyType,
        risk_profile: riskProfile,
        configuration,
        is_public: isPublic
      })
      .select()
      .single();

    if (!template) throw new Error('Failed to create template');
    return template.id;
  }

  async getOfficialTemplates(): Promise<LayerTemplate[]> {
    const { data, error } = await supabase
      .from('layer_templates')
      .select('*')
      .eq('is_official', true)
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      strategyType: t.strategy_type,
      riskProfile: t.risk_profile,
      configuration: t.configuration as any,
      usageCount: t.usage_count || 0,
      avgRating: typeof t.avg_rating === 'number' ? t.avg_rating : parseFloat(t.avg_rating || '0'),
      isOfficial: true
    }));
  }
}
