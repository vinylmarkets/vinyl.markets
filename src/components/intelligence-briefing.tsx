// components/intelligence-briefing.tsx
import { useState, useEffect } from 'react';
import { PredictionAPI, Briefing } from '@/lib/prediction-api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function IntelligenceBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'academic' | 'plain'>('plain');

  useEffect(() => {
    loadBriefing();
  }, []);

  const loadBriefing = async () => {
    try {
      const data = await PredictionAPI.getDailyBriefing();
      setBriefing(data);
    } catch (error) {
      console.error('Failed to load briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (probability: number) => {
    if (probability > 0.6) return <TrendingUp className="w-5 h-5 text-secondary" />;
    if (probability < 0.4) return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-primary" />;
  };

  const getBadgeColor = (probability: number) => {
    if (probability > 0.6) return 'secondary';
    if (probability < 0.4) return 'destructive';
    return 'outline';
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Loading predictions...</div>;
  }

  if (!briefing || briefing.predictions.length === 0) {
    return <div className="text-muted-foreground">No predictions available at this time.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Today's Intelligence Briefing</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('plain')}
            className={`px-3 py-1 rounded transition-colors ${
              mode === 'plain' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Plain Speak
          </button>
          <button
            onClick={() => setMode('academic')}
            className={`px-3 py-1 rounded transition-colors ${
              mode === 'academic' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Academic
          </button>
        </div>
      </div>

      {briefing.predictions.map((prediction) => (
        <Card key={prediction.symbol} className="hover:shadow-glow-amber transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(prediction.probability)}
              <CardTitle className="text-foreground">{prediction.symbol}</CardTitle>
            </div>
            <Badge variant={getBadgeColor(prediction.probability)}>
              {(prediction.probability * 100).toFixed(1)}% UP
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="font-semibold text-foreground">${prediction.current_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="font-semibold text-foreground">{(prediction.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/20">
              <p className="text-sm font-semibold mb-1 text-primary">Analysis:</p>
              {mode === 'plain' ? (
                <p className="text-sm text-muted-foreground">{prediction.interpretation}</p>
              ) : (
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Base Probability: {(prediction.factors.base_rate * 100).toFixed(1)}%</p>
                  <p>Reddit Sentiment Δ: {prediction.factors.reddit_adjustment > 0 ? '+' : ''}{(prediction.factors.reddit_adjustment * 100).toFixed(1)}%</p>
                  <p>News Impact Δ: {prediction.factors.news_adjustment > 0 ? '+' : ''}{(prediction.factors.news_adjustment * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}