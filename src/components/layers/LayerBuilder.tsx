import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Plus, GripVertical, X, Save, ArrowLeft } from 'lucide-react';
import { LayerConfigService } from '@/lib/ampLayering/layerConfigService';
import type { LayerAmp, ConflictResolutionStrategy, CapitalAllocationStrategy } from '@/types/ampLayers';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailableAmp {
  id: string;
  name: string;
  category: string;
}

export function LayerBuilder() {
  const { layerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [layerName, setLayerName] = useState('');
  const [description, setDescription] = useState('');
  const [layerAmps, setLayerAmps] = useState<LayerAmp[]>([]);
  const [availableAmps, setAvailableAmps] = useState<AvailableAmp[]>([]);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolutionStrategy>('priority');
  const [capitalStrategy, setCapitalStrategy] = useState<CapitalAllocationStrategy>('weighted');
  const [loading, setLoading] = useState(false);
  const configService = new LayerConfigService();

  useEffect(() => {
    if (layerId) {
      loadLayer(layerId);
    }
    loadAvailableAmps();
  }, [layerId]);

  async function loadLayer(id: string) {
    try {
      const config = await configService.getLayerConfig(id);
      setLayerName(config.layer.name);
      setDescription(config.layer.description || '');
      setLayerAmps(config.amps);
      setConflictResolution(config.conflictResolution);
      setCapitalStrategy(config.capitalStrategy);
    } catch (error) {
      console.error('Failed to load layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to load layer',
        variant: 'destructive',
      });
    }
  }

  async function loadAvailableAmps() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_amps')
        .select('amp_id, name, catalog:amp_catalog!inner(category)')
        .eq('user_id', user.id);

      if (error) throw error;

      const amps = data.map((amp: any) => ({
        id: amp.amp_id,
        name: amp.name,
        category: amp.catalog?.category || 'General',
      }));

      setAvailableAmps(amps);
    } catch (error) {
      console.error('Failed to load available amps:', error);
    }
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = Array.from(layerAmps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priorities based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: 100 - (index * 10), // Higher index = lower priority
    }));

    setLayerAmps(updatedItems);
  }

  function addAmpToLayer(ampId: string) {
    const amp = availableAmps.find(a => a.id === ampId);
    if (!amp) return;

    const newLayerAmp: LayerAmp = {
      id: crypto.randomUUID(),
      layer_id: layerId || '',
      amp_id: ampId,
      priority: 50,
      capital_allocation: 0,
      is_enabled: true,
    };

    setLayerAmps([...layerAmps, newLayerAmp]);
  }

  function removeAmp(ampId: string) {
    setLayerAmps(layerAmps.filter(amp => amp.id !== ampId));
  }

  function updateAmpPriority(ampId: string, priority: number) {
    setLayerAmps(layerAmps.map(amp =>
      amp.id === ampId ? { ...amp, priority } : amp
    ));
  }

  function updateAmpAllocation(ampId: string, allocation: number) {
    setLayerAmps(layerAmps.map(amp =>
      amp.id === ampId ? { ...amp, capital_allocation: allocation / 100 } : amp
    ));
  }

  async function saveLayer() {
    if (!layerName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a layer name',
        variant: 'destructive',
      });
      return;
    }

    if (layerAmps.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one amp to the layer',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let currentLayerId = layerId;

      if (!currentLayerId) {
        // Create new layer
        const layer = await configService.createLayer(user.id, layerName, description);
        currentLayerId = layer.id;
      } else {
        // Update existing layer
        const { error } = await supabase
          .from('amp_layers')
          .update({
            name: layerName,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentLayerId);

        if (error) throw error;
      }

      // Remove existing amps
      await supabase
        .from('layer_amps')
        .delete()
        .eq('layer_id', currentLayerId);

      // Add new amps
      for (const amp of layerAmps) {
        await configService.addAmpToLayer(
          currentLayerId,
          amp.amp_id,
          amp.priority,
          amp.capital_allocation
        );
      }

      // Update settings
      await configService.updateLayerSettings(
        currentLayerId,
        conflictResolution,
        capitalStrategy
      );

      toast({
        title: 'Success',
        description: 'Layer saved successfully',
      });

      navigate('/trader/layers');
    } catch (error) {
      console.error('Failed to save layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save layer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const unusedAmps = availableAmps.filter(
    amp => !layerAmps.some(la => la.amp_id === amp.id)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trader/layers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {layerId ? 'Edit Layer' : 'Create New Layer'}
          </h1>
          <p className="text-muted-foreground">
            Combine multiple amps with custom priorities and capital allocation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Layer Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Layer Name</Label>
              <Input
                id="name"
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
                placeholder="My Trading Strategy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your strategy..."
                rows={3}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conflict Resolution</Label>
                <Select value={conflictResolution} onValueChange={(v) => setConflictResolution(v as ConflictResolutionStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority Based</SelectItem>
                    <SelectItem value="confidence">Confidence Based</SelectItem>
                    <SelectItem value="weighted">Weighted Average</SelectItem>
                    <SelectItem value="veto">Veto (SELL overrides BUY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capital Strategy</Label>
                <Select value={capitalStrategy} onValueChange={(v) => setCapitalStrategy(v as CapitalAllocationStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal Split</SelectItem>
                    <SelectItem value="weighted">Weighted</SelectItem>
                    <SelectItem value="dynamic">Performance Based</SelectItem>
                    <SelectItem value="kelly">Kelly Criterion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Amps in Layer</Label>
              
              {layerAmps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No amps added yet. Add amps from the sidebar →
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="layer-amps">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {layerAmps.map((amp, index) => {
                          const ampInfo = availableAmps.find(a => a.id === amp.amp_id);
                          return (
                            <Draggable key={amp.id} draggableId={amp.id} index={index}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="p-4"
                                >
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">{ampInfo?.name || amp.amp_id}</div>
                                        <div className="text-sm text-muted-foreground">{ampInfo?.category}</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAmp(amp.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <Label>Priority</Label>
                                        <span className="text-muted-foreground">{amp.priority}</span>
                                      </div>
                                      <Slider
                                        value={[amp.priority]}
                                        onValueChange={([value]) => updateAmpPriority(amp.id, value)}
                                        min={1}
                                        max={100}
                                        step={1}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <Label>Capital Allocation</Label>
                                        <span className="text-muted-foreground">{(amp.capital_allocation * 100).toFixed(0)}%</span>
                                      </div>
                                      <Slider
                                        value={[amp.capital_allocation * 100]}
                                        onValueChange={([value]) => updateAmpAllocation(amp.id, value)}
                                        min={0}
                                        max={100}
                                        step={5}
                                      />
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Amps */}
        <Card>
          <CardHeader>
            <CardTitle>Available Amps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unusedAmps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All amps have been added
                </p>
              ) : (
                unusedAmps.map(amp => (
                  <Card key={amp.id} className="p-3 hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{amp.name}</div>
                        <div className="text-xs text-muted-foreground">{amp.category}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addAmpToLayer(amp.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/trader/layers')}>
          Cancel
        </Button>
        <Button onClick={saveLayer} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Layer'}
        </Button>
      </div>
    </div>
  );
}
