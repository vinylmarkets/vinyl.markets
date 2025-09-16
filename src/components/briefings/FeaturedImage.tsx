import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Sparkles } from "lucide-react";

interface FeaturedImageProps {
  title: string;
  category: string;
  stocks?: string[];
}

export const FeaturedImage = ({ title, category, stocks = [] }: FeaturedImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate image generation delay
    const timer = setTimeout(() => {
      // For now, use a gradient placeholder that matches the category
      const generatePlaceholder = () => {
        const gradients = {
          'market-structure': 'linear-gradient(135deg, hsl(var(--purple)) 0%, hsl(var(--amber)) 100%)',
          'individual-stock': 'linear-gradient(135deg, hsl(var(--amber)) 0%, hsl(var(--secondary)) 100%)',
          'macro-economic': 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--purple)) 100%)',
          'alternative-investments': 'linear-gradient(135deg, hsl(var(--amber)) 0%, hsl(var(--primary)) 100%)',
          'historical-patterns': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--purple)) 100%)',
        };
        
        return gradients[category as keyof typeof gradients] || gradients['market-structure'];
      };

      setImageUrl(generatePlaceholder());
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [category]);

  if (isLoading) {
    return (
      <Card className="relative h-48 md:h-64 overflow-hidden mb-6">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Generating visual...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="relative h-48 md:h-64 overflow-hidden mb-6 bg-muted/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Visual content unavailable</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative h-48 md:h-64 overflow-hidden mb-6 group">
      <div 
        className="w-full h-full transition-transform group-hover:scale-105"
        style={{ background: imageUrl || undefined }}
      />
      
      {/* Overlay with category and stock info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {category.replace('-', ' ')} Analysis
            </span>
          </div>
          
          {stocks.length > 0 && (
            <div className="text-xs opacity-90">
              Focus: {stocks.slice(0, 3).join(', ')}
              {stocks.length > 3 && ` +${stocks.length - 3}`}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};