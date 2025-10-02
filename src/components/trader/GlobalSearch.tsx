import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Zap,
  DollarSign,
  Navigation,
  Clock,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  StockSearchResult, 
  SearchResultAmp, 
  SearchResultPosition, 
  PlatformPage,
  RecentSearch 
} from '@/types/search';

const POLYGON_API_KEY = '3JKFc415CRne7XdExkMnuinp8dwGZtvM';
const PLATFORM_PAGES: PlatformPage[] = [
  { name: 'Performance', path: '/trader/performance', category: 'Analytics', keywords: ['metrics', 'stats', 'pnl', 'returns'] },
  { name: 'My Amps', path: '/trader/amps', category: 'Trading', keywords: ['strategies', 'algorithms', 'amps'] },
  { name: 'Settings', path: '/trader/settings', category: 'Account', keywords: ['preferences', 'config', 'profile'] },
  { name: 'API Keys', path: '/trader/api-keys', category: 'Integration', keywords: ['alpaca', 'broker', 'credentials'] },
  { name: 'Alerts', path: '/trader/alerts', category: 'Notifications', keywords: ['notifications', 'warnings', 'signals'] },
  { name: 'Integrations', path: '/trader/integrations', category: 'Connections', keywords: ['broker', 'alpaca', 'connect'] },
  { name: 'Diagnostics', path: '/trader/diagnostics', category: 'Tools', keywords: ['debug', 'troubleshoot', 'logs'] },
  { name: 'Help', path: '/trader/help', category: 'Support', keywords: ['support', 'docs', 'guide', 'faq'] },
];

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockResults, setStockResults] = useState<StockSearchResult[]>([]);
  const [ampResults, setAmpResults] = useState<SearchResultAmp[]>([]);
  const [positionResults, setPositionResults] = useState<SearchResultPosition[]>([]);
  const [pageResults, setPageResults] = useState<PlatformPage[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [stockPrices, setStockPrices] = useState<Record<string, { price: number; change: number }>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('trader-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query: string, type: RecentSearch['type']) => {
    const newSearch: RecentSearch = {
      query,
      type,
      timestamp: Date.now()
    };
    
    const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('trader-recent-searches', JSON.stringify(updated));
  };

  // Search stocks
  const searchStocks = async (query: string) => {
    if (!query || query.length < 1) return;
    
    try {
      const cacheKey = `stock-search-${query}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 3600000) {
          setStockResults(parsed.results);
          fetchStockPrices(parsed.results.slice(0, 5));
          return;
        }
      }

      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=5&apiKey=${POLYGON_API_KEY}`
      );

      if (!response.ok) throw new Error('Stock search failed');

      const data = await response.json();
      const results = data.results || [];
      
      setStockResults(results);
      sessionStorage.setItem(cacheKey, JSON.stringify({ results, timestamp: Date.now() }));
      
      fetchStockPrices(results);
    } catch (error) {
      console.error('Stock search error:', error);
    }
  };

  // Fetch stock prices
  const fetchStockPrices = async (stocks: StockSearchResult[]) => {
    const prices: Record<string, { price: number; change: number }> = {};
    
    for (const stock of stocks) {
      try {
        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${stock.ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results?.[0]) {
            const result = data.results[0];
            prices[stock.ticker] = {
              price: result.c,
              change: ((result.c - result.o) / result.o) * 100
            };
          }
        }
      } catch (e) {
        console.error(`Price fetch error for ${stock.ticker}:`, e);
      }
    }
    
    setStockPrices(prices);
  };

  // Search amps and positions
  const searchUserData = async (query: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch amps
      const ampsRes = await fetch(
        `https://jhxjvpbwkdzjufjyqanq.supabase.co/rest/v1/user_amps?user_id=eq.${user.id}&name=ilike.*${query}*&select=id,name,is_active,allocated_capital&limit=5`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (ampsRes.ok) {
        const amps = await ampsRes.json();
        setAmpResults(amps);
      }

      // Fetch positions
      const posRes = await fetch(
        `https://jhxjvpbwkdzjufjyqanq.supabase.co/rest/v1/paper_positions?user_id=eq.${user.id}&symbol=ilike.*${query}*&select=symbol,quantity,average_cost,current_price,unrealized_pnl&limit=5`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (posRes.ok) {
        const positions = await posRes.json();
        setPositionResults(positions);
      }
    } catch (error) {
      console.error('User data search error:', error);
    }
  };

  // Search platform pages
  const searchPages = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const matches = PLATFORM_PAGES.filter(page => 
      page.name.toLowerCase().includes(lowerQuery) ||
      page.category.toLowerCase().includes(lowerQuery) ||
      page.keywords.some(kw => kw.includes(lowerQuery))
    ).slice(0, 5);
    
    setPageResults(matches);
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setStockResults([]);
      setAmpResults([]);
      setPositionResults([]);
      setPageResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      await Promise.all([
        searchStocks(searchQuery),
        searchUserData(searchQuery),
      ]);
      searchPages(searchQuery);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selections
  const handleStockSelect = (stock: StockSearchResult) => {
    saveRecentSearch(stock.ticker, 'stock');
    toast({
      title: `${stock.ticker} - ${stock.name}`,
      description: 'Stock information feature coming soon',
    });
    onOpenChange(false);
  };

  const handleAmpSelect = (amp: SearchResultAmp) => {
    saveRecentSearch(amp.name, 'amp');
    navigate('/trader/amps');
    onOpenChange(false);
  };

  const handlePositionSelect = (position: SearchResultPosition) => {
    saveRecentSearch(position.symbol, 'position');
    toast({
      title: `${position.symbol}`,
      description: `Position: ${position.quantity} shares @ $${position.average_cost.toFixed(2)}`,
    });
    onOpenChange(false);
  };

  const handlePageSelect = (page: PlatformPage) => {
    saveRecentSearch(page.name, 'page');
    navigate(page.path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="[&_[cmdk-input]]:text-muted-foreground">
        <CommandInput 
          placeholder="Search stocks, amps, positions, or pages..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="text-muted-foreground"
        />
      </div>
      <CommandList>
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.slice(0, 5).map((search, idx) => (
                <CommandItem key={idx} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{search.query}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {search.type}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {searchQuery && !loading && (
          <>
            {stockResults.length === 0 && 
             ampResults.length === 0 && 
             positionResults.length === 0 && 
             pageResults.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {stockResults.length > 0 && (
              <>
                <CommandGroup heading="Stocks">
                  {stockResults.map((stock) => {
                    const priceData = stockPrices[stock.ticker];
                    return (
                      <CommandItem
                        key={stock.ticker}
                        onSelect={() => handleStockSelect(stock)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: '#5a3a1a' }} />
                          <div>
                            <div className="font-medium">{stock.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                        {priceData && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${priceData.price.toFixed(2)}
                            </span>
                            <Badge 
                              variant={priceData.change >= 0 ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {priceData.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(priceData.change).toFixed(2)}%
                            </Badge>
                          </div>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {ampResults.length > 0 && (
              <>
                <CommandGroup heading="My Amps">
                  {ampResults.map((amp) => (
                    <CommandItem
                      key={amp.id}
                      onSelect={() => handleAmpSelect(amp)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" style={{ color: '#5a3a1a' }} />
                        <span>{amp.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          ${amp.allocated_capital.toLocaleString()}
                        </span>
                        <Badge variant={amp.is_active ? 'default' : 'secondary'} className="text-xs">
                          {amp.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {positionResults.length > 0 && (
              <>
                <CommandGroup heading="My Positions">
                  {positionResults.map((position) => (
                    <CommandItem
                      key={position.symbol}
                      onSelect={() => handlePositionSelect(position)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" style={{ color: '#5a3a1a' }} />
                        <div>
                          <div className="font-medium">{position.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {position.quantity} shares @ ${position.average_cost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={position.unrealized_pnl >= 0 ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {position.unrealized_pnl >= 0 ? '+' : ''}
                        ${position.unrealized_pnl.toFixed(2)}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {pageResults.length > 0 && (
              <CommandGroup heading="Pages">
                {pageResults.map((page) => (
                  <CommandItem
                    key={page.path}
                    onSelect={() => handlePageSelect(page)}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" style={{ color: '#5a3a1a' }} />
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-muted-foreground">{page.category}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        {loading && (
          <CommandEmpty>Searching...</CommandEmpty>
        )}
      </CommandList>
    </CommandDialog>
  );
};
