import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CorrelationAnalyzer, CorrelationAnalysis } from '@/lib/ampLayering/correlationAnalyzer';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CorrelationDashboardProps {
  layerId: string;
}

export const CorrelationDashboard: React.FC<CorrelationDashboardProps> = ({ layerId }) => {
  const [analysis, setAnalysis] = useState<CorrelationAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCorrelation();
  }, [layerId]);

  const loadCorrelation = async () => {
    try {
      setLoading(true);
      const analyzer = new CorrelationAnalyzer();
      const result = await analyzer.analyzeLayerCorrelation(layerId, 30);
      setAnalysis(result);
    } catch (error: any) {
      toast({
        title: 'Error loading correlation',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const getDiversificationColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDiversificationIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-5 h-5" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Correlation Analysis</CardTitle>
          <CardDescription>
            Understand how your amps relate to each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Avg Correlation</div>
              <div className="text-2xl font-bold">
                {(analysis.avgCorrelation * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Max Correlation</div>
              <div className="text-2xl font-bold">
                {(analysis.maxCorrelation * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Diversification Score</div>
              <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${getDiversificationColor(analysis.diversificationScore)}`}>
                {getDiversificationIcon(analysis.diversificationScore)}
                {analysis.diversificationScore}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Amp Correlations</h4>
            {analysis.correlations.map((corr, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{corr.amp1}</span>
                  <span className="text-muted-foreground">↔</span>
                  <span className="font-medium">{corr.amp2}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    corr.strength === 'high' ? 'destructive' :
                    corr.strength === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {corr.strength}
                  </Badge>
                  <span className="font-mono">{(corr.correlation * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          {analysis.diversificationScore < 50 && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                    Low Diversification Detected
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Your amps show high correlation, which may reduce the benefits of layering. 
                    Consider adding amps with different strategies or removing highly correlated ones.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
