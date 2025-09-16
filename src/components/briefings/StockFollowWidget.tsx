import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StockFollowWidgetProps {
  followedStocks: string[];
  onFollowedStocksChange: (stocks: string[]) => void;
}

export const StockFollowWidget = ({ followedStocks, onFollowedStocksChange }: StockFollowWidgetProps) => {
  const [newStock, setNewStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateStockSymbol = (symbol: string): boolean => {
    // Basic validation for stock symbols (1-5 uppercase letters)
    const stockRegex = /^[A-Z]{1,5}$/;
    return stockRegex.test(symbol);
  };

  const handleAddStock = async () => {
    if (!newStock.trim()) return;
    
    const symbol = newStock.toUpperCase().trim();
    
    if (!validateStockSymbol(symbol)) {
      toast({
        title: "Invalid Symbol",
        description: "Please enter a valid stock symbol (1-5 letters)",
        variant: "destructive",
      });
      return;
    }

    if (followedStocks.includes(symbol)) {
      toast({
        title: "Already Following",
        description: `You're already following ${symbol}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('user_stock_follows')
          .insert({
            user_id: user.id,
            stock_symbol: symbol
          });

        if (error) throw error;
      }
      
      const updatedStocks = [...followedStocks, symbol];
      onFollowedStocksChange(updatedStocks);
      setNewStock('');
      
      toast({
        title: "Stock Added",
        description: `Now following ${symbol}`,
      });
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('user_stock_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('stock_symbol', symbol);

        if (error) throw error;
      }
      
      const updatedStocks = followedStocks.filter(stock => stock !== symbol);
      onFollowedStocksChange(updatedStocks);
      
      toast({
        title: "Stock Removed",
        description: `No longer following ${symbol}`,
      });
    } catch (error) {
      console.error('Error removing stock:', error);
      toast({
        title: "Error", 
        description: "Failed to remove stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStock();
    }
  };

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
  const suggestedStocks = popularStocks.filter(stock => !followedStocks.includes(stock));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Follow Stocks for Personalized Briefings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Stock */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            onKeyPress={handleKeyPress}
            className="uppercase"
            maxLength={5}
          />
          <Button 
            onClick={handleAddStock} 
            disabled={isLoading || !newStock.trim()}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Currently Following */}
        {followedStocks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Following ({followedStocks.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {followedStocks.map((stock) => (
                <Badge key={stock} variant="secondary" className="flex items-center gap-1">
                  {stock}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" 
                    onClick={() => handleRemoveStock(stock)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Stocks */}
        {suggestedStocks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Popular Stocks</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedStocks.slice(0, 6).map((stock) => (
                <Badge 
                  key={stock}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setNewStock(stock)}
                >
                  + {stock}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {followedStocks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add stocks you're interested in to receive personalized briefings and insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
};