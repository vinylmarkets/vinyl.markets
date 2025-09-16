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
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-border/40 overflow-hidden relative ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
      onClick={handleClick}
    >
      {/* Category Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        briefing.category === 'market-structure' ? 'bg-gradient-to-r from-purple to-purple/60' :
        briefing.category === 'individual-stock' ? 'bg-gradient-to-r from-amber to-amber/60' :
        'bg-gradient-to-r from-secondary to-secondary/60'
      }`} />
      
      <div className="flex-1 pt-1">
        <CardHeader className={`pb-2 pt-3 ${viewMode === 'list' ? 'flex-shrink-0 w-1/3' : ''}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {briefing.title}
            </CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground/60 flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getCategoryColor(briefing.category)}`}>
              {briefing.category.replace('-', ' ')}
            </Badge>
            
            {briefing.educational_principle && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary border-secondary/20">
                <BookOpen className="w-2.5 h-2.5 mr-1" />
                Learn
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className={`pt-0 pb-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {briefing.executive_summary}
          </p>

          {briefing.stocks_mentioned && briefing.stocks_mentioned.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {briefing.stocks_mentioned.slice(0, 3).map((symbol) => (
                  <StockBadge key={symbol} symbol={symbol} size="sm" />
                ))}
                {briefing.stocks_mentioned.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-muted/30 text-muted-foreground px-1.5 py-0.5">
                    +{briefing.stocks_mentioned.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{readTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(briefing.publication_date), { addSuffix: true }).replace('about ', '')}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 px-2 text-xs bg-primary/5 hover:bg-primary/10 text-primary"
            >
              Read →
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};