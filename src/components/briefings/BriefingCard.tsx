import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, BookOpen, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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
      'macro-economic': 'bg-blue-100 text-blue-800 border-blue-200',
      'individual-stock': 'bg-green-100 text-green-800 border-green-200',
      'market-structure': 'bg-purple-100 text-purple-800 border-purple-200',
      'alternative-investments': 'bg-orange-100 text-orange-800 border-orange-200',
      'historical-patterns': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const readTime = Math.max(2, Math.ceil(briefing.executive_summary.length / 200));

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-border/40 ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className={`pb-3 ${viewMode === 'list' ? 'flex-shrink-0 w-1/3' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {briefing.title}
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={getCategoryColor(briefing.category)}>
            {briefing.category.replace('-', ' ')}
          </Badge>
          
          {briefing.educational_principle && (
            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
              <BookOpen className="w-3 h-3 mr-1" />
              Learn
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {briefing.executive_summary}
        </p>

        {briefing.stocks_mentioned && briefing.stocks_mentioned.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Stocks Mentioned:</p>
            <div className="flex flex-wrap gap-1">
              {briefing.stocks_mentioned.slice(0, 4).map((symbol) => (
                <Badge key={symbol} variant="secondary" className="text-xs">
                  {symbol}
                </Badge>
              ))}
              {briefing.stocks_mentioned.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{briefing.stocks_mentioned.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatDistanceToNow(new Date(briefing.publication_date), { addSuffix: true })}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            Read More →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};