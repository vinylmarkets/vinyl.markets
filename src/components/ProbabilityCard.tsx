import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProbabilityCardProps {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  probability: number;
  timeframe: string;
  confidence: number;
  volume: string;
  sentiment: "bullish" | "bearish" | "neutral";
  aiSummary: string;
}

export const ProbabilityCard = ({
  symbol,
  company,
  price,
  change,
  changePercent,
  probability,
  timeframe,
  confidence,
  volume,
  sentiment,
  aiSummary
}: ProbabilityCardProps) => {
  const isPositive = change >= 0;
  const probabilityColorClass = 
    probability >= 70 ? "bg-probability-high" : 
    probability >= 50 ? "bg-probability-medium" : "bg-probability-low";
  
  const confidenceWidth = `${confidence}%`;
  
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow-amber transition-all duration-300 p-3 md:p-6">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg md:text-2xl font-bold text-foreground truncate">{symbol}</h3>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{company}</p>
        </div>
        <Badge 
          variant={sentiment === "bullish" ? "secondary" : sentiment === "bearish" ? "destructive" : "outline"}
          className="capitalize text-xs md:text-sm ml-2 flex-shrink-0"
        >
          {sentiment}
        </Badge>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4 min-w-0">
        <span className="text-xl md:text-3xl font-bold text-foreground truncate">${price.toFixed(2)}</span>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-secondary' : 'text-destructive'} flex-shrink-0`}>
          {isPositive ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
          <span className="font-semibold text-xs md:text-base">{isPositive ? '+' : ''}{change.toFixed(2)}</span>
          <span className="text-xs">{isPositive ? '+' : ''}{changePercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Probability ({timeframe})</span>
            <span className="text-sm md:text-lg font-bold text-primary">{probability}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 md:h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ease-out ${probabilityColorClass}`}
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Confidence</span>
            <span className="text-xs md:text-sm font-semibold text-foreground">{confidence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 md:h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: confidenceWidth }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-medium text-foreground">{volume}</span>
        </div>

        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs md:text-sm font-medium text-primary">AtomicMarket Report</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
        </div>
      </div>
    </Card>
  );
};