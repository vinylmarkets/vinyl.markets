import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Grid, List, Star, TrendingUp, Users, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface AmpCatalogItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  average_rating: number;
  total_reviews: number;
  version: string;
  default_settings: any;
  parameter_schema: any;
  created_at: string;
  // Future fields from Phase 3
  price?: number;
  pricing_model?: string;
  total_users?: number;
  creator_id?: string | null;
  risk_level?: string | null;
}

const CATEGORIES = [
  'All',
  'Momentum',
  'Mean Reversion',
  'Breakout',
  'Machine Learning',
  'Options',
  'Sector-Specific'
];

const RISK_LEVELS = ['Conservative', 'Moderate', 'Aggressive'];

export function AmpCatalog() {
  const navigate = useNavigate();
  
  // State
  const [amps, setAmps] = useState<AmpCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [performanceFilters, setPerformanceFilters] = useState({
    sharpeRatio: false,
    maxDrawdown: false,
    winRate: false
  });
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Fetch amps
  useEffect(() => {
    fetchAmps();
  }, []);
  
  async function fetchAmps() {
    setLoading(true);
    try {
      // For now, just get all amps since the Phase 3 fields don't exist yet
      const { data, error } = await supabase
        .from('amp_catalog')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Add default values for fields that don't exist yet
      const ampsWithDefaults = (data || []).map((amp: any) => ({
        ...amp,
        average_rating: amp.average_rating || 0,
        total_reviews: amp.total_reviews || 0,
        total_users: Math.floor(Math.random() * 500), // Mock data until Phase 3
        price: 29, // Default price
        pricing_model: 'subscription'
      }));
      setAmps(ampsWithDefaults);
    } catch (error) {
      console.error('Error fetching amps:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // Filter and sort logic
  const filteredAndSortedAmps = useMemo(() => {
    let filtered = [...amps];
    
    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(amp =>
        amp.name.toLowerCase().includes(query) ||
        amp.description?.toLowerCase().includes(query) ||
        amp.category?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (!selectedCategories.includes('All')) {
      filtered = filtered.filter(amp =>
        selectedCategories.some(cat => 
          amp.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }
    
    // Price filter
    filtered = filtered.filter(amp =>
      (amp.price || 0) >= priceRange[0] && (amp.price || 0) <= priceRange[1]
    );
    
    // Performance filters - skip for now since performance data doesn't exist yet
    // Will be enabled in Phase 3
    // if (performanceFilters.sharpeRatio) {
    //   filtered = filtered.filter(amp => (amp.performance?.sharpe_ratio || 0) > 1.0);
    // }
    // if (performanceFilters.maxDrawdown) {
    //   filtered = filtered.filter(amp => Math.abs(amp.performance?.max_drawdown || 0) < 0.20);
    // }
    // if (performanceFilters.winRate) {
    //   filtered = filtered.filter(amp => (amp.performance?.win_rate || 0) > 0.50);
    // }
    
    // Risk level filter
    if (selectedRiskLevels.length > 0) {
      filtered = filtered.filter(amp =>
        selectedRiskLevels.some(level => 
          amp.risk_level?.toLowerCase() === level.toLowerCase()
        )
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.total_users - a.total_users);
        break;
      case 'rating':
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'performance':
        // Will sort by performance when Phase 3 data is available
        filtered.sort((a, b) => (b.total_users || 0) - (a.total_users || 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'reviews':
        filtered.sort((a, b) => b.total_reviews - a.total_reviews);
        break;
    }
    
    return filtered;
  }, [amps, debouncedSearch, selectedCategories, priceRange, performanceFilters, selectedRiskLevels, sortBy]);
  
  // Handlers
  const handleCategoryToggle = useCallback((category: string) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev.filter(c => c !== 'All'), category];
        return newCategories.length === 0 ? ['All'] : newCategories;
      });
    }
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setSelectedCategories(['All']);
    setPriceRange([0, 200]);
    setPerformanceFilters({ sharpeRatio: false, maxDrawdown: false, winRate: false });
    setSelectedRiskLevels([]);
    setSearchQuery('');
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search amps by name, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category */}
                <div>
                  <h3 className="font-semibold mb-3">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200}
                    step={10}
                    className="mb-2"
                  />
                </div>
                
                {/* Performance */}
                <div>
                  <h3 className="font-semibold mb-3">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sharpe"
                        checked={performanceFilters.sharpeRatio}
                        onCheckedChange={(checked) =>
                          setPerformanceFilters(prev => ({ ...prev, sharpeRatio: !!checked }))
                        }
                      />
                      <label htmlFor="sharpe" className="text-sm cursor-pointer">
                        Sharpe Ratio {'>'} 1.0
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="drawdown"
                        checked={performanceFilters.maxDrawdown}
                        onCheckedChange={(checked) =>
                          setPerformanceFilters(prev => ({ ...prev, maxDrawdown: !!checked }))
                        }
                      />
                      <label htmlFor="drawdown" className="text-sm cursor-pointer">
                        Max Drawdown {'<'} 20%
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="winrate"
                        checked={performanceFilters.winRate}
                        onCheckedChange={(checked) =>
                          setPerformanceFilters(prev => ({ ...prev, winRate: !!checked }))
                        }
                      />
                      <label htmlFor="winrate" className="text-sm cursor-pointer">
                        Win Rate {'>'} 50%
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Risk Level */}
                <div>
                  <h3 className="font-semibold mb-3">Risk Level</h3>
                  <div className="space-y-2">
                    {RISK_LEVELS.map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`risk-${level}`}
                          checked={selectedRiskLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRiskLevels(prev => [...prev, level]);
                            } else {
                              setSelectedRiskLevels(prev => prev.filter(l => l !== level));
                            }
                          }}
                        />
                        <label htmlFor={`risk-${level}`} className="text-sm cursor-pointer">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="performance">Best Performance (30d)</SelectItem>
                    <SelectItem value="price_low">Lowest Price</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
                
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedAmps.length} {filteredAndSortedAmps.length === 1 ? 'amp' : 'amps'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Content Area */}
            {loading ? (
              <SkeletonGrid viewMode={viewMode} />
            ) : filteredAndSortedAmps.length === 0 ? (
              <EmptyState searchQuery={debouncedSearch} />
            ) : (
              <AmpGrid amps={filteredAndSortedAmps} viewMode={viewMode} navigate={navigate} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function AmpGrid({ amps, viewMode, navigate }: { amps: AmpCatalogItem[]; viewMode: 'grid' | 'list'; navigate: any }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amps.map(amp => (
          <AmpCardGrid key={amp.id} amp={amp} navigate={navigate} />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {amps.map(amp => (
        <AmpCardList key={amp.id} amp={amp} navigate={navigate} />
      ))}
    </div>
  );
}

function AmpCardGrid({ amp, navigate }: { amp: AmpCatalogItem; navigate: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/marketplace/${amp.id}`)}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
          {amp.image_url ? (
            <img src={amp.image_url} alt={amp.name} className="w-full h-full object-cover rounded-t-lg" />
          ) : (
            <TrendingUp className="w-16 h-16 text-primary/40" />
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg">{amp.name}</h3>
            {amp.category && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {amp.category}
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {amp.description}
          </p>
          
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span>{amp.average_rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({amp.total_reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{amp.total_users || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">${amp.price || 29}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); navigate(`/marketplace/${amp.id}`); }}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AmpCardList({ amp, navigate }: { amp: AmpCatalogItem; navigate: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/marketplace/${amp.id}`)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center flex-shrink-0">
            {amp.image_url ? (
              <img src={amp.image_url} alt={amp.name} className="w-full h-full object-cover rounded" />
            ) : (
              <TrendingUp className="w-10 h-10 text-primary/40" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{amp.name}</h3>
                {amp.category && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {amp.category}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {amp.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>{amp.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({amp.total_reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{amp.total_users || 0} users</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Price & CTA */}
          <div className="flex flex-col items-end justify-between">
            <div className="text-right">
              <div className="text-2xl font-bold">${amp.price || 29}</div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
            <Button onClick={(e) => { e.stopPropagation(); navigate(`/marketplace/${amp.id}`); }}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const count = viewMode === 'grid' ? 6 : 4;
  
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="w-full h-48 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <Card className="p-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? 'No amps match your search' : 'No amps match your filters'}
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? 'Try different keywords or browse all amps' 
            : 'Try adjusting your filter criteria'}
        </p>
      </div>
    </Card>
  );
}
