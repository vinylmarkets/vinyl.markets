import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Grid, List } from "lucide-react";

interface BriefingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  followedStocks: string[];
  setFollowedStocks: (stocks: string[]) => void;
}

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'market-overview', name: 'Market Overview' },
  { id: 'sector-analysis', name: 'Sector Analysis' },
  { id: 'earnings-preview', name: 'Earnings Preview' },
  { id: 'economic-indicators', name: 'Economic Indicators' },
  { id: 'geopolitical-impact', name: 'Geopolitical Impact' },
  { id: 'crypto-analysis', name: 'Crypto Analysis' },
  { id: 'options-flow', name: 'Options Flow' },
  { id: 'insider-activity', name: 'Insider Activity' },
  { id: 'social-sentiment', name: 'Social Sentiment' },
  { id: 'risk-assessment', name: 'Risk Assessment' }
];

export const BriefingFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  followedStocks,
  setFollowedStocks
}: BriefingFiltersProps) => {
  
  const removeFollowedStock = (stockToRemove: string) => {
    setFollowedStocks(followedStocks.filter(stock => stock !== stockToRemove));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSortBy('newest');
    setFollowedStocks([]);
  };

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (categoryFilter !== 'all' ? 1 : 0) + 
    (followedStocks.length > 0 ? 1 : 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search briefings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
            <SelectItem value="title">By Title</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <Filter className="w-4 h-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Stock Filters */}
      {followedStocks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Following:</span>
          {followedStocks.map((stock) => (
            <Badge key={stock} variant="secondary" className="flex items-center gap-1">
              {stock}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFollowedStock(stock)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};