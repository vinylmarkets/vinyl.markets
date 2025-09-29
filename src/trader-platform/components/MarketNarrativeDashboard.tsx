import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  RefreshCw,
  Eye,
  Clock,
  Users,
  BookOpen,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyArticle {
  id: string;
  publish_date: string;
  headline: string;
  summary: string;
  full_article: string;
  key_themes: any[];
  mentioned_symbols: string[];
  email_sent: boolean;
  view_count: number;
  engagement_score: number;
  generated_at: string;
  published_at: string;
}

interface MarketNarrativeData {
  date: string;
  sector_performances: Record<string, any>;
  top_movers: Record<string, any>;
  signal_summary: Record<string, any>;
  market_regime: string;
}

export const MarketNarrativeDashboard: React.FC = () => {
  const [articles, setArticles] = useState<DailyArticle[]>([]);
  const [narrativeData, setNarrativeData] = useState<MarketNarrativeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<DailyArticle | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
    fetchNarrativeData();
  }, []);

  const fetchArticles = async () => {
    try {
      // Mock data for now since the tables are in trading schema
      const mockArticles: DailyArticle[] = [
        {
          id: '1',
          publish_date: new Date().toISOString().split('T')[0],
          headline: 'Tech Leads Market Rally as AI Stocks Surge',
          summary: 'Technology stocks drove major indices higher today, with semiconductor names posting strong gains amid renewed optimism around artificial intelligence applications.',
          full_article: 'Technology stocks drove major indices higher today, with semiconductor names posting strong gains amid renewed optimism around artificial intelligence applications.\n\nThe Nasdaq Composite rose 1.8%, outpacing the S&P 500\'s 1.2% gain. NVIDIA led the charge with a 6.5% jump, while AMD and Intel followed with gains of 4.2% and 3.1% respectively.\n\nOur algorithmic signals detected 23 buy signals concentrated in the technology sector, with an average confidence of 78%. The sympathy play between chip stocks showed particularly strong correlation patterns.\n\nLooking ahead, momentum indicators suggest continued strength in the tech sector, though traders should watch for potential profit-taking near resistance levels.',
          key_themes: ['Tech Rally', 'AI Optimism', 'Semiconductor Strength'],
          mentioned_symbols: ['NVDA', 'AMD', 'INTC', 'QQQ', 'SPY'],
          email_sent: false,
          view_count: 245,
          engagement_score: 8.2,
          generated_at: new Date().toISOString(),
          published_at: new Date().toISOString()
        }
      ];
      
      setArticles(mockArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNarrativeData = async () => {
    try {
      // Mock narrative data
      const mockNarrativeData: MarketNarrativeData = {
        date: new Date().toISOString().split('T')[0],
        sector_performances: {
          'Technology': { dayChange: 2.3, weekChange: 5.1, relativeStrength: 0.85 },
          'Healthcare': { dayChange: 0.8, weekChange: 2.1, relativeStrength: 0.62 },
          'Energy': { dayChange: -1.2, weekChange: -0.5, relativeStrength: 0.45 }
        },
        top_movers: {
          gainers: [{ symbol: 'NVDA', change: 6.5 }, { symbol: 'AMD', change: 4.2 }],
          losers: [{ symbol: 'META', change: -2.1 }]
        },
        signal_summary: {
          total_signals: 23,
          bullish_signals: 17,
          bearish_signals: 6,
          avg_confidence: 0.78,
          by_type: { sympathy: 8, sector_rotation: 5, pair_trade: 4, index_arbitrage: 6 }
        },
        market_regime: 'risk_on'
      };
      
      setNarrativeData(mockNarrativeData);
    } catch (error) {
      console.error('Error fetching narrative data:', error);
    }
  };

  const generateArticle = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-narrator');

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Market narrative generated successfully",
        });
        await fetchArticles();
        await fetchNarrativeData();
      } else {
        throw new Error(data.error || 'Failed to generate article');
      }
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: "Error",
        description: "Failed to generate market narrative",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getMarketRegimeColor = (regime: string) => {
    switch (regime) {
      case 'risk_on': return 'text-green-500 bg-green-50 border-green-200';
      case 'risk_off': return 'text-red-500 bg-red-50 border-red-200';
      case 'bullish': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'bearish': return 'text-orange-500 bg-orange-50 border-orange-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Narrative Engine</h2>
          <p className="text-muted-foreground">
            AI-powered daily market analysis and article generation
          </p>
        </div>
        <Button
          onClick={generateArticle}
          disabled={generating}
          className="flex items-center gap-2"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Generate Today's Article
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Data Overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Today's Market Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {narrativeData ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Market Regime</span>
                    <Badge className={cn("text-xs", getMarketRegimeColor(narrativeData.market_regime))}>
                      {narrativeData.market_regime.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Top Sectors</span>
                    {Object.entries(narrativeData.sector_performances)
                      .sort(([,a], [,b]) => (b as any).dayChange - (a as any).dayChange)
                      .slice(0, 3)
                      .map(([sector, data]) => (
                        <div key={sector} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{sector}</span>
                          <span className={cn(
                            "font-medium",
                            (data as any).dayChange > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {(data as any).dayChange > 0 ? '+' : ''}{(data as any).dayChange?.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Signal Summary</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">
                          {narrativeData.signal_summary.bullish_signals || 0}
                        </div>
                        <div className="text-muted-foreground">Bullish</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-bold text-red-600">
                          {narrativeData.signal_summary.bearish_signals || 0}
                        </div>
                        <div className="text-muted-foreground">Bearish</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No market data available for today
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generation Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Articles</span>
                <span className="font-bold">{articles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-bold">
                  {articles.filter(a => 
                    new Date(a.publish_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Engagement</span>
                <span className="font-bold">
                  {articles.length > 0 
                    ? (articles.reduce((sum, a) => sum + a.engagement_score, 0) / articles.length).toFixed(1)
                    : '0'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Recent Articles</h3>
          </div>

          {articles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Articles Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first market narrative to get started.
                </p>
                <Button onClick={generateArticle} disabled={generating}>
                  Generate Article
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <Card 
                  key={article.id} 
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedArticle?.id === article.id && "ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedArticle(
                    selectedArticle?.id === article.id ? null : article
                  )}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-semibold leading-tight">
                            {article.headline}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {new Date(article.publish_date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.view_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {article.mentioned_symbols.length} symbols
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(article.generated_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {article.mentioned_symbols.slice(0, 3).map(symbol => (
                            <Badge key={symbol} variant="secondary" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                          {article.mentioned_symbols.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.mentioned_symbols.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {selectedArticle?.id === article.id && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Full Article</h5>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {article.full_article}
                              </div>
                            </div>
                            
                            {article.key_themes && article.key_themes.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">Key Themes</h5>
                                <div className="flex flex-wrap gap-1">
                                  {(Array.isArray(article.key_themes) ? article.key_themes : []).map((theme, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {typeof theme === 'string' ? theme : theme.primary || 'Theme'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};