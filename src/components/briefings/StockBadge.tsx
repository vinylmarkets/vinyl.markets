import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Activity } from "lucide-react";

interface StockBadgeProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StockBadge = ({ symbol, size = 'md' }: StockBadgeProps) => {
  const getStockCategory = (symbol: string) => {
    const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'CRM'];
    const financeStocks = ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BRK', 'V', 'MA', 'AXP'];
    const healthcareStocks = ['JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'DHR', 'BMY', 'ABBV', 'MRK', 'LLY'];
    
    if (techStocks.includes(symbol)) return 'tech';
    if (financeStocks.includes(symbol)) return 'finance';
    if (healthcareStocks.includes(symbol)) return 'healthcare';
    return 'default';
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'tech':
        return <Activity className="w-3 h-3" />;
      case 'finance':
        return <TrendingUp className="w-3 h-3" />;
      case 'healthcare':
        return <Building2 className="w-3 h-3" />;
      default:
        return <Building2 className="w-3 h-3" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'tech':
        return 'bg-purple/10 text-purple border-purple/20 hover:bg-purple/20';
      case 'finance':
        return 'bg-amber/10 text-amber border-amber/20 hover:bg-amber/20';
      case 'healthcare':
        return 'bg-healthcare/10 text-healthcare border-healthcare/20 hover:bg-healthcare/20';
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  const category = getStockCategory(symbol);

  return (
    <Badge 
      variant="outline" 
      className={`
        inline-flex items-center gap-1.5 font-medium transition-colors cursor-default
        ${getCategoryStyles(category)}
        ${getSizeStyles(size)}
      `}
    >
      {getIcon(category)}
      {symbol}
    </Badge>
  );
};