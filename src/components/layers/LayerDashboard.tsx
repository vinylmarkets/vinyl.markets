import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Settings, Trash2, Play, Pause, TrendingUp, TrendingDown,
  AlertCircle, Layers as LayersIcon
} from 'lucide-react';
import { LayerConfigService } from '@/lib/ampLayering/layerConfigService';
import type { AmpLayer } from '@/types/ampLayers';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function LayerDashboard() {
  const [layers, setLayers] = useState<AmpLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const configService = new LayerConfigService();

  useEffect(() => {
    loadLayers();
  }, []);

  async function loadLayers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userLayers = await configService.getUserLayers(user.id);
        setLayers(userLayers);
      }
    } catch (error) {
      console.error('Failed to load layers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load layers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleLayer(layerId: string, active: boolean) {
    try {
      await configService.toggleLayer(layerId, active);
      await loadLayers();
      toast({
        title: 'Success',
        description: `Layer ${active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Failed to toggle layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle layer',
        variant: 'destructive',
      });
    }
  }

  async function deleteLayer(layerId: string) {
    if (!confirm('Are you sure you want to delete this layer?')) return;

    try {
      await configService.deleteLayer(layerId);
      await loadLayers();
      toast({
        title: 'Success',
        description: 'Layer deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete layer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete layer',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayersIcon className="h-8 w-8" />
            Amp Layers
          </h1>
          <p className="text-muted-foreground mt-1">
            Combine multiple amps into sophisticated trading strategies
          </p>
        </div>
        <Button onClick={() => navigate('/trader/layers/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Layer
        </Button>
      </div>

      {layers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayersIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Layers Yet</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Create your first layer to combine multiple trading amps and coordinate their signals
            </p>
            <Button onClick={() => navigate('/trader/layers/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Layer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layers.map(layer => (
            <Card key={layer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {layer.name}
                      {layer.is_active && (
                        <Badge variant="default" className="gap-1">
                          <Play className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    {layer.description && (
                      <CardDescription className="mt-1">
                        {layer.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{layer.is_active ? 'Active' : 'Inactive'}</span>
                    <Switch
                      checked={layer.is_active}
                      onCheckedChange={(checked) => toggleLayer(layer.id, checked)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => navigate(`/trader/layers/${layer.id}/edit`)}
                  >
                    <Settings className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => navigate(`/trader/layers/${layer.id}/analytics`)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteLayer(layer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
