import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommunityManager, SharedLayer } from '@/lib/ampLayering/communityManager';
import { Star, Copy, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

export const CommunityLayers: React.FC = () => {
  const [layers, setLayers] = useState<SharedLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTags, setSearchTags] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    try {
      setLoading(true);
      const manager = new CommunityManager();
      const results = await manager.getSharedLayers();
      setLayers(results);
    } catch (error: any) {
      toast({
        title: 'Error loading community layers',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cloneLayer = async (sharedLayerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const manager = new CommunityManager();
      const layerId = await manager.cloneSharedLayer(sharedLayerId, user.id);
      
      toast({
        title: 'Layer cloned',
        description: 'The layer has been added to your collection'
      });
      
      navigate(`/trader/layers/${layerId}/edit`);
    } catch (error: any) {
      toast({
        title: 'Error cloning layer',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const filteredLayers = searchTags
    ? layers.filter(layer =>
        layer.strategyTags.some(tag =>
          tag.toLowerCase().includes(searchTags.toLowerCase())
        )
      )
    : layers;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Community Layers</h2>
        <p className="text-muted-foreground">
          Discover and clone layer configurations shared by the community
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by tags..."
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLayers.map(layer => (
          <Card key={layer.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>{layer.title}</CardTitle>
              <CardDescription>{layer.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {layer.strategyTags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {layer.performanceSummary && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Return</div>
                    <div className="text-sm font-semibold">
                      ${layer.performanceSummary.totalReturn.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                    <div className="text-sm font-semibold">
                      {layer.performanceSummary.sharpeRatio.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-sm font-semibold">
                      {(layer.performanceSummary.winRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avg Daily</div>
                    <div className="text-sm font-semibold">
                      ${layer.performanceSummary.avgDailyReturn.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{layer.avgRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(layer.viewCount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Copy className="w-4 h-4" />
                    <span>{formatNumber(layer.cloneCount)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => cloneLayer(layer.id)} 
                className="w-full"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone Layer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLayers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {searchTags ? 'No layers match your search.' : 'No community layers shared yet.'}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
