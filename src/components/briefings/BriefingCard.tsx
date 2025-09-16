import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, BookOpen, Eye, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { StockBadge } from "./StockBadge";

interface BriefingCardProps {
  briefing: {
    id: string;
    title: string;
    category: string;
    executive_summary: string;
    publication_date: string;
    stocks_mentioned: string[];
    educational_principle?: {
      title: string;
      content: string;
      difficulty: string;
    };
  };
  viewMode?: 'grid' | 'list';
}

export const BriefingCard = ({ briefing, viewMode = 'grid' }: BriefingCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/dashboard/briefings/${briefing.id}`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'macro-economic': 'bg-secondary/10 text-secondary border-secondary/20',
      'individual-stock': 'bg-amber/10 text-amber border-amber/20',
      'market-structure': 'bg-purple/10 text-purple border-purple/20',
      'alternative-investments': 'bg-amber/10 text-amber border-amber/20',
      'historical-patterns': 'bg-purple/10 text-purple border-purple/20'
    };
    return colors[category as keyof typeof colors] || 'bg-muted/50 text-muted-foreground border-border';
  };

  const readTime = Math.max(2, Math.ceil(briefing.executive_summary.length / 200));

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border/40 overflow-hidden ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
      onClick={handleClick}
    >
      {/* Category Accent Bar */}
      <div className={`w-1 ${
        briefing.category === 'market-structure' ? 'bg-purple' :
        briefing.category === 'individual-stock' ? 'bg-amber' :
        'bg-secondary'
      }`} />
      
      <div className="flex-1">
        <CardHeader className={`pb-3 ${viewMode === 'list' ? 'flex-shrink-0 w-1/3' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {briefing.title}
            </CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Sparkles className="h-4 w-4" />
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className={getCategoryColor(briefing.category)}>
              {briefing.category.replace('-', ' ')}
            </Badge>
            
            {briefing.educational_principle && (
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                <BookOpen className="w-3 h-3 mr-1" />
                Learn
              </Badge>
            )}
            
            <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          </div>
        </CardHeader>

        <CardContent className={`pt-0 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {briefing.executive_summary}
          </p>

          {briefing.stocks_mentioned && briefing.stocks_mentioned.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-muted-foreground">Stocks Analyzed:</p>
              <div className="flex flex-wrap gap-1.5">
                {briefing.stocks_mentioned.slice(0, 4).map((symbol) => (
                  <StockBadge key={symbol} symbol={symbol} size="sm" />
                ))}
                {briefing.stocks_mentioned.length > 4 && (
                  <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">
                    +{briefing.stocks_mentioned.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{readTime} min read</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(briefing.publication_date), { addSuffix: true })}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 hover:bg-primary/10 text-primary"
            >
              Read Analysis →
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};