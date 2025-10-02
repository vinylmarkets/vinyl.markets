import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Newspaper, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PolygonNewsArticle, UserSymbol } from '@/types/market-news';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedNews {
  data: PolygonNewsArticle[];
  timestamp: number;
}

export const MarketNewsCard = () => {
  const [news, setNews] = useState<PolygonNewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userSymbols, setUserSymbols] = useState<UserSymbol[]>([]);
  const { toast } = useToast();

  // Fetch user's portfolio positions and watchlist symbols
  const fetchUserSymbols = async (): Promise<UserSymbol[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const symbols = new Set<string>();
      const symbolSources = new Map<string, 'portfolio' | 'watchlist'>();

      // Fetch portfolio positions from paper_positions
      try {
        const positionsResult = await supabase
          .from('paper_positions')
          .select('symbol');
        
        if (positionsResult.data) {
          for (const pos of positionsResult.data) {
            if (pos.symbol) {
              symbols.add(pos.symbol);
              symbolSources.set(pos.symbol, 'portfolio');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching positions:', err);
      }

      // Fetch watchlist symbols
      try {
        const watchlistResult = await supabase
          .from('watchlist_items')
          .select('symbol');
        
        if (watchlistResult.data) {
          for (const item of watchlistResult.data) {
            if (item.symbol) {
              symbols.add(item.symbol);
              if (!symbolSources.has(item.symbol)) {
                symbolSources.set(item.symbol, 'watchlist');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err);
      }

      return Array.from(symbols).map(symbol => ({
        symbol,
        source: symbolSources.get(symbol) || 'portfolio'
      }));
    } catch (err) {
      console.error('Error fetching user symbols:', err);
      return [];
    }
  };

  // Fetch news from Polygon.io
  const fetchNews = async (symbols: UserSymbol[]): Promise<{ articles: PolygonNewsArticle[]; error: string | null }> => {
    if (!POLYGON_API_KEY) {
      return { articles: [], error: 'API key not configured' };
    }

    if (symbols.length === 0) {
      return { articles: [], error: null };
    }

    // Check cache
    const cached = sessionStorage.getItem('market-news-cache');
    if (cached) {
      try {
        const parsedCache: CachedNews = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
          return { articles: parsedCache.data, error: null };
        }
      } catch (e) {
        console.error('Error parsing cache:', e);
      }
    }

    try {
      // Batch fetch news for all symbols
      const tickerParam = symbols.map(s => s.symbol).join(',');
      const response = await fetch(
        `https://api.polygon.io/v2/reference/news?ticker=${tickerParam}&limit=50&order=desc&apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          return { articles: [], error: 'Rate limit reached. Please try again later.' };
        }
        return { articles: [], error: `API error: ${response.status}` };
      }

      const data = await response.json();
      const articles: PolygonNewsArticle[] = data.results || [];

      // Deduplicate and sort by date
      const uniqueArticles = Array.from(
        new Map(articles.map(article => [article.id, article])).values()
      ).sort((a, b) => 
        new Date(b.published_utc).getTime() - new Date(a.published_utc).getTime()
      ).slice(0, 15);

      // Cache results
      try {
        sessionStorage.setItem('market-news-cache', JSON.stringify({
          data: uniqueArticles,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error caching news:', e);
      }

      return { articles: uniqueArticles, error: null };
    } catch (err) {
      console.error('Error fetching news:', err);
      return { articles: [], error: err instanceof Error ? err.message : 'Failed to fetch news' };
    }
  };

  // Main fetch function
  const loadNews = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      const symbols = await fetchUserSymbols();
      setUserSymbols(symbols);

      if (symbols.length === 0) {
        setNews([]);
        setLoading(false);
        return;
      }

      const { articles, error: fetchError } = await fetchNews(symbols);
      
      if (fetchError) {
        setError(fetchError);
        if (showToast) {
          toast({
            title: 'Error loading news',
            description: fetchError,
            variant: 'destructive',
          });
        }
      } else {
        setNews(articles);
        if (showToast) {
          toast({
            title: 'News updated',
            description: `Loaded ${articles.length} recent articles`,
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load news';
      setError(errorMessage);
      if (showToast) {
        toast({
          title: 'Error loading news',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadNews();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadNews();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Check if news is breaking (< 1 hour old)
  const isBreaking = (publishedUtc: string) => {
    const publishedTime = new Date(publishedUtc).getTime();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return publishedTime > oneHourAgo;
  };

  // Render loading state
  if (loading && news.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" style={{ color: '#5a3a1a' }} />
            News for Your Portfolio
          </CardTitle>
          <CardDescription>Loading personalized market news...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" style={{ color: '#5a3a1a' }} />
            News for Your Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadNews(true)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (userSymbols.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" style={{ color: '#5a3a1a' }} />
            News for Your Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Add stocks to your portfolio or watchlist to see relevant market news
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render news list
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" style={{ color: '#5a3a1a' }} />
              News for Your Portfolio
            </CardTitle>
            <CardDescription>
              {news.length} recent articles · Tracking {userSymbols.length} symbols
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => loadNews(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="border-b border-border pb-4 last:border-0 hover:bg-accent/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {isBreaking(article.published_utc) && (
                        <Badge variant="destructive" className="text-xs">
                          Breaking
                        </Badge>
                      )}
                      {article.tickers.slice(0, 3).map((ticker) => (
                        <Badge key={ticker} variant="secondary" className="text-xs">
                          {ticker}
                        </Badge>
                      ))}
                      {article.tickers.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.tickers.length - 3}
                        </Badge>
                      )}
                    </div>
                    <a
                      href={article.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-primary transition-colors line-clamp-2 mb-1 flex items-start gap-1"
                    >
                      {article.title}
                      <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.publisher.name}</span>
                      <span>·</span>
                      <span>
                        {formatDistanceToNow(new Date(article.published_utc), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            News provided by Polygon.io for informational purposes only. Not investment advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
