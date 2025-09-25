import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, BookOpen, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReadingStatsProps {
  publicationDate: string;
  contentLength: number;
  stocksCount: number;
  category: string;
}

export const ReadingStats = ({ publicationDate, contentLength, stocksCount, category }: ReadingStatsProps) => {
  const readTime = Math.max(2, Math.ceil(contentLength / 200));
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market-structure':
        return <TrendingUp className="w-4 h-4 text-purple" />;
      case 'individual-stock':
        return <BookOpen className="w-4 h-4 text-amber" />;
      default:
        return <Eye className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="mb-6 border-l-4 border-l-purple bg-gradient-to-r from-purple/5 to-transparent">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{readTime} min read</div>
              <div className="text-muted-foreground text-xs">Reading time</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">
                {formatDistanceToNow(new Date(publicationDate), { addSuffix: true })}
              </div>
              <div className="text-muted-foreground text-xs">Published</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <div className="text-sm">
              <div className="font-medium">{stocksCount} stocks</div>
              <div className="text-muted-foreground text-xs">Analyzed</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{Math.round(contentLength / 100)}k</div>
              <div className="text-muted-foreground text-xs">Characters</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};