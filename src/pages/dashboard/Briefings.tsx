import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BriefingCard } from "@/components/briefings/BriefingCard";
import { BriefingFilters } from "@/components/briefings/BriefingFilters";
import { StockFollowWidget } from "@/components/briefings/StockFollowWidget";
import { MorningAnalysisTrigger } from "@/components/MorningAnalysisTrigger";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Briefings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [followedStocks, setFollowedStocks] = useState<string[]>([]);
  const [briefings, setBriefings] = useState<any[]>([]);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      // Load briefings from database
      await loadBriefings();
      
      // Load user's followed stocks
      await loadFollowedStocks();
    };

    loadData();
  }, []);

  const loadBriefings = async () => {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('published', true)
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setBriefings(data || []);
    } catch (error) {
      console.error('Error loading briefings:', error);
      // Fallback to empty array for now
      setBriefings([]);
    }
  };

  const loadFollowedStocks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_stock_follows')
        .select('stock_symbol')
        .eq('user_id', user.id);

      if (error) throw error;
      setFollowedStocks(data?.map(item => item.stock_symbol) || []);
    } catch (error) {
      console.error('Error loading followed stocks:', error);
    }
  };

  const generateNewBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-briefing-content', {
        body: {
          category: 'market-structure', // Use valid category
          stockSymbols: followedStocks.length > 0 ? followedStocks.slice(0, 5) : undefined,
          userPreferences: {
            explanation_mode: 'plain_speak',
            risk_tolerance: 'conservative'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Briefing Generated",
        description: "A new market intelligence briefing has been created.",
      });

      // Reload briefings to show the new one
      await loadBriefings();
    } catch (error) {
      console.error('Error generating briefing:', error);
      toast({
        title: "Error",
        description: "Failed to generate briefing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // Filter briefings based on search and category
  const filteredBriefings = briefings
    .filter((briefing) => {
      const matchesSearch = briefing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          briefing.executive_summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || briefing.category === categoryFilter;
      
      // Filter by followed stocks if any are selected
      const matchesStocks = followedStocks.length === 0 || 
        (briefing.stocks_mentioned && briefing.stocks_mentioned.some((stock: string) => 
          followedStocks.includes(stock)
        ));
      
      return matchesSearch && matchesCategory && matchesStocks;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime();
        case "category":
          return a.category.localeCompare(b.category);
        case "title":
          return a.title.localeCompare(b.title);
        default: // "newest"
          return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
      }
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Market Intelligence</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered market analysis and insights delivered daily
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadBriefings()}
              disabled={isGeneratingBriefing}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button 
              onClick={generateNewBriefing}
              disabled={isGeneratingBriefing}
              size="sm"
            >
              {isGeneratingBriefing ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Generate Briefing
            </Button>
          </div>
        </div>

        {/* Morning Market Analysis */}
        <MorningAnalysisTrigger />

        {/* Stock Follow Widget */}
        <StockFollowWidget 
          followedStocks={followedStocks}
          onFollowedStocksChange={setFollowedStocks}
        />

        {/* Search and Filters */}
        <BriefingFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          followedStocks={followedStocks}
          setFollowedStocks={setFollowedStocks}
        />

        {/* Briefings Display */}
        {filteredBriefings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No briefings found</h3>
                <p className="text-muted-foreground mb-4">
                  {briefings.length === 0 
                    ? "No briefings have been generated yet. Click 'Generate Briefing' to create your first one."
                    : "No briefings match your current filters. Try adjusting your search or filters."
                  }
                </p>
                {briefings.length === 0 && (
                  <Button onClick={generateNewBriefing} disabled={isGeneratingBriefing}>
                    {isGeneratingBriefing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Generate Your First Briefing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          }>
            {filteredBriefings.map((briefing) => (
              <BriefingCard 
                key={briefing.id} 
                briefing={briefing}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}