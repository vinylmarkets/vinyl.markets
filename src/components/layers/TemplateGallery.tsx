import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateManager, LayerTemplate } from '@/lib/ampLayering/templateManager';
import { Star, Users, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const TemplateGallery: React.FC = () => {
  const [templates, setTemplates] = useState<LayerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const manager = new TemplateManager();
      const results = await manager.getTemplates();
      setTemplates(results);
    } catch (error: any) {
      toast({
        title: 'Error loading templates',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const manager = new TemplateManager();
      const layerId = await manager.applyTemplate(templateId, user.id);
      
      toast({
        title: 'Template applied',
        description: 'Your new layer has been created'
      });
      
      navigate(`/trader/layers/${layerId}/edit`);
    } catch (error: any) {
      toast({
        title: 'Error applying template',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
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
        <h2 className="text-2xl font-bold mb-2">Layer Templates</h2>
        <p className="text-muted-foreground">
          Start with a proven layer configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {template.isOfficial && (
                  <Badge variant="default" className="ml-2">
                    <Award className="w-3 h-3 mr-1" />
                    Official
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{template.strategyType}</Badge>
                <Badge variant="outline">{template.riskProfile}</Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span>{template.avgRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{template.usageCount} uses</span>
                </div>
              </div>

              <Button 
                onClick={() => applyTemplate(template.id)} 
                className="w-full"
                variant="outline"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No templates available yet. Check back soon!
          </CardContent>
        </Card>
      )}
    </div>
  );
};
