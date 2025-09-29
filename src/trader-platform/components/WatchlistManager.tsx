import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, TrendingUp, Clock, Star, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWatchlists } from '../hooks/useWatchlists';
import { useToast } from '@/hooks/use-toast';

interface WatchlistManagerProps {
  onSymbolSelect?: (symbol: string) => void;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ onSymbolSelect }) => {
  const {
    watchlists,
    loading,
    error,
    fetchWatchlistSymbols,
    addToWatchlist,
    searchSymbol,
    getUniverseSelection
  } = useWatchlists();

  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState<any[]>([]);
  const [universeSymbols, setUniverseSymbols] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [expandedWatchlist, setExpandedWatchlist] = useState<string | null>(null);
  const { toast } = useToast();

  // Load default watchlist on mount
  useEffect(() => {
    if (watchlists.length > 0 && !selectedWatchlist) {
      const userWatchlist = watchlists.find(w => w.watchlist_type === 'user_watchlist');
      if (userWatchlist) {
        setSelectedWatchlist(userWatchlist.id);
      } else {
        const defaultWatchlist = watchlists.find(w => w.is_system && w.watchlist_type === 'alpha_testing');
        if (defaultWatchlist) {
          setSelectedWatchlist(defaultWatchlist.id);
        }
      }
    }
  }, [watchlists, selectedWatchlist]);

  // Load symbols when watchlist changes
  useEffect(() => {
    if (selectedWatchlist) {
      loadWatchlistSymbols(selectedWatchlist);
    }
  }, [selectedWatchlist]);

  // Load universe selection
  useEffect(() => {
    loadUniverseSelection();
  }, []);

  const loadWatchlistSymbols = async (watchlistId: string) => {
    setLoadingSymbols(true);
    try {
      const symbols = await fetchWatchlistSymbols(watchlistId);
      setWatchlistSymbols(symbols);
    } finally {
      setLoadingSymbols(false);
    }
  };

  const loadUniverseSelection = async () => {
    try {
      const universe = await getUniverseSelection();
      setUniverseSymbols(universe);
    } catch (err) {
      console.error('Failed to load universe selection:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const result = await searchSymbol(searchQuery);
      setSearchResults(result);
      setAnalysisData(null); // Clear previous analysis
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleAnalyze = async (symbol: string) => {
    try {
      // Clear previous analysis first
      setAnalysisData(null);
      
      // Set loading state for the new symbol
      setAnalysisData({
        symbol,
        loading: true
      });
      
      // Simulate analysis with symbol-specific data
      setTimeout(() => {
        const mockAnalyses: { [key: string]: any } = {
          'AAPL': {
            sentiment: 'Bullish',
            riskLevel: 'Low',
            technicalScore: 8.5,
            fundamentalScore: 9.0,
            recommendation: 'BUY',
            targetPrice: '$200.00',
            supportLevel: '$175.00',
            resistanceLevel: '$190.00',
            keyPoints: [
              'Strong iPhone 15 sales momentum',
              'Services revenue growth accelerating',
              'AI integration driving premium pricing',
              'Strong balance sheet with $162B cash'
            ]
          },
          'GME': {
            sentiment: 'Neutral',
            riskLevel: 'High',
            technicalScore: 5.5,
            fundamentalScore: 4.2,
            recommendation: 'HOLD',
            targetPrice: '$32.50',
            supportLevel: '$24.80',
            resistanceLevel: '$29.90',
            keyPoints: [
              'Meme stock volatility remains elevated',
              'Digital transformation in progress',
              'Retail sentiment driving price action',
              'High short interest creates squeeze potential'
            ]
          }
        };

        const analysis = mockAnalyses[symbol] || {
          sentiment: 'Neutral',
          riskLevel: 'Medium',
          technicalScore: 6.0,
          fundamentalScore: 6.0,
          recommendation: 'HOLD',
          targetPrice: 'TBD',
          supportLevel: 'TBD',
          resistanceLevel: 'TBD',
          keyPoints: [
            'Analysis pending - limited data available',
            'Requires further fundamental research',
            'Monitor technical indicators',
            'Consider sector trends'
          ]
        };

        setAnalysisData({
          symbol,
          loading: false,
          analysis
        });
      }, 2000);
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisData({
        symbol,
        loading: false,
        error: 'Analysis failed'
      });
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
    if (!selectedWatchlist) {
      toast({
        title: "No watchlist selected",
        description: "Please select a watchlist first",
        variant: "destructive"
      });
      return;
    }
    
    setAddingToWatchlist(true);
    try {
      await addToWatchlist(selectedWatchlist, symbol);
      await loadWatchlistSymbols(selectedWatchlist);
      toast({
        title: "Symbol added!",
        description: `${symbol} has been added to your watchlist`,
        variant: "default"
      });
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      toast({
        title: "Failed to add symbol",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleWatchlistToggle = async (watchlistId: string) => {
    if (expandedWatchlist === watchlistId) {
      setExpandedWatchlist(null);
    } else {
      setExpandedWatchlist(watchlistId);
      if (watchlistId !== selectedWatchlist) {
        await loadWatchlistSymbols(watchlistId);
      }
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'High Priority';
      case 2: return 'Medium Priority';
      case 3: return 'Low Priority';
      default: return 'Standard';
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 3: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Watchlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading watchlists...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Watchlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Star className="h-4 w-4 text-primary" />
          <span>Smart Watchlists</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="watchlists" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="watchlists">My Lists</TabsTrigger>
            <TabsTrigger value="universe">Top Picks</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlists" className="space-y-4">
            {/* Available Watchlists */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Watchlists:</label>
              <div className="grid grid-cols-1 gap-2">
                {watchlists.map((watchlist) => {
                  const isExpanded = expandedWatchlist === watchlist.id;
                  const isUserList = watchlist.watchlist_type === 'user_watchlist';
                  
                  return (
                    <div key={watchlist.id} className="space-y-1">
                      <Button
                        variant={selectedWatchlist === watchlist.id ? "default" : "outline"}
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedWatchlist(watchlist.id);
                          handleWatchlistToggle(watchlist.id);
                        }}
                      >
                        <span>{watchlist.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{watchlist.symbol_count}</Badge>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </Button>
                      
                      <p className="text-xs text-muted-foreground pl-2">
                        {isUserList 
                          ? 'Personal watchlist - add up to 10 tickers'
                          : watchlist.watchlist_type === 'alpha_testing' 
                            ? 'Curated selection of liquid stocks for alpha testing. Includes tech megacaps, finance, energy, and high-volatility stocks.'
                            : 'System-generated watchlist'
                        }
                      </p>
                      
                      {/* Expanded ticker list */}
                      {isExpanded && (
                        <div className="pl-4 space-y-1">
                          {loadingSymbols ? (
                            <div className="text-muted-foreground text-center py-2 text-xs">Loading...</div>
                          ) : watchlistSymbols.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                              {watchlistSymbols.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-1 text-xs border rounded cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleAnalyze(item.symbol)}
                                >
                                  <span className="font-medium">{item.symbol}</span>
                                  {!isUserList && item.priority_tier && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      T{item.priority_tier}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-center py-2 text-xs">No symbols</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analysis Results */}
            {analysisData && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analysis for {analysisData.symbol}
                </label>
                {analysisData.loading ? (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  </div>
                ) : analysisData.error ? (
                  <div className="p-4 border rounded-lg border-red-200">
                    <div className="text-red-600 text-sm">{analysisData.error}</div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Sentiment:</span>
                        <div className={`text-sm font-medium ${
                          analysisData.analysis.sentiment === 'Bullish' ? 'text-green-600' : 
                          analysisData.analysis.sentiment === 'Bearish' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {analysisData.analysis.sentiment}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Target:</span>
                        <div className="text-sm font-medium">{analysisData.analysis.targetPrice}</div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      {analysisData.analysis.keyPoints.map((point: string, i: number) => (
                        <div key={i} className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="universe" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Today's Top Opportunities
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {universeSymbols.length > 0 ? (
                  universeSymbols.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => onSymbolSelect?.(item.symbol)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.symbol}</span>
                        <Badge variant="outline">#{item.rank}</Badge>
                        <Badge variant="secondary">{item.selection_reason}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score: {Number(item.score).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-center py-4">
                    No universe data available today
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Stock:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchResults && (
              <div className="space-y-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{searchResults.symbol}</h3>
                    <Badge variant="outline" className="text-xs">
                      {searchResults.cached ? 'Cached' : 'Live'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{searchResults.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-medium">${Number(searchResults.price).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Change: </span>
                      <span className={`font-medium ${searchResults.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {searchResults.change >= 0 ? '+' : ''}{Number(searchResults.change).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume: </span>
                      <span className="font-medium">{Number(searchResults.volume).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sector: </span>
                      <span className="font-medium">{searchResults.sector}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAnalyze(searchResults.symbol);
                        if (onSymbolSelect) {
                          onSymbolSelect(searchResults.symbol);
                        }
                      }}
                    >
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToWatchlist(searchResults.symbol)}
                      disabled={!selectedWatchlist || addingToWatchlist}
                    >
                      {addingToWatchlist ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      {addingToWatchlist ? 'Adding...' : 'Add to List'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};