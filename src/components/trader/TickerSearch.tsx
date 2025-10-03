import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

export function TickerSearch() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Search for tickers as user types
  const { data: results } = useQuery({
    queryKey: ['ticker-search', query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];
      
      const response = await fetch(
        `https://api.polygon.io/v3/reference/tickers?search=${query}&active=true&limit=10&apiKey=${POLYGON_API_KEY}`
      );
      
      const data = await response.json();
      return data.results || [];
    },
    enabled: query.length >= 1,
  });

  const handleSelect = (symbol: string) => {
    navigate(`/trader/stock/${symbol.toUpperCase()}`);
    setQuery('');
    setShowResults(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      // If user presses enter, go directly to that symbol
      navigate(`/trader/stock/${query.toUpperCase()}`);
      setQuery('');
      setShowResults(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search stocks (e.g. AAPL, TSLA)"
          className="pl-10 bg-card border-border text-foreground"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && query && results && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {results.map((result: any) => (
            <button
              key={result.ticker}
              onClick={() => handleSelect(result.ticker)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{result.ticker}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{result.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">{result.market}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query && results && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">
            No results found. Press Enter to search anyway.
          </p>
        </div>
      )}
    </div>
  );
}
