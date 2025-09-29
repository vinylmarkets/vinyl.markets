import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, TrendingUp, Clock, Star } from 'lucide-react';
import { useWatchlists } from '../hooks/useWatchlists';

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

  // Load default watchlist on mount
  useEffect(() => {
    if (watchlists.length > 0 && !selectedWatchlist) {
      const defaultWatchlist = watchlists.find(w => w.is_system && w.watchlist_type === 'default');
      if (defaultWatchlist) {
        setSelectedWatchlist(defaultWatchlist.id);
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
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
    if (!selectedWatchlist) return;
    
    try {
      await addToWatchlist(selectedWatchlist, symbol);
      await loadWatchlistSymbols(selectedWatchlist);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Smart Watchlists
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
            {/* Watchlist Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Watchlist:</label>
              <div className="grid grid-cols-1 gap-2">
                {watchlists.map((watchlist) => (
                  <Button
                    key={watchlist.id}
                    variant={selectedWatchlist === watchlist.id ? "default" : "outline"}
                    className="justify-between"
                    onClick={() => setSelectedWatchlist(watchlist.id)}
                  >
                    <span>{watchlist.name}</span>
                    <Badge variant="secondary">{watchlist.symbol_count}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Watchlist Symbols */}
            {selectedWatchlist && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbols:</label>
                {loadingSymbols ? (
                  <div className="text-muted-foreground text-center py-4">Loading symbols...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {watchlistSymbols.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => onSymbolSelect?.(item.symbol)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.symbol}</span>
                          <Badge className={getTierColor(item.priority_tier)}>
                            {getTierLabel(item.priority_tier)}
                          </Badge>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
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
                      onClick={() => onSymbolSelect?.(searchResults.symbol)}
                    >
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToWatchlist(searchResults.symbol)}
                      disabled={!selectedWatchlist}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to List
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