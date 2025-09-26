import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

interface StockProjection {
  symbol: string;
  name: string;
  openingPrice: number;
  targetHigh: number;
  targetLow: number;
  projectedChangePercent: number;
}

const mockFollowedStocks: StockProjection[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    openingPrice: 184.35,
    targetHigh: 188.90,
    targetLow: 181.20,
    projectedChangePercent: 1.8
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    openingPrice: 241.50,
    targetHigh: 248.75,
    targetLow: 235.10,
    projectedChangePercent: -0.9
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    openingPrice: 875.20,
    targetHigh: 891.40,
    targetLow: 862.80,
    projectedChangePercent: 2.3
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    openingPrice: 415.80,
    targetHigh: 421.60,
    targetLow: 408.90,
    projectedChangePercent: 0.7
  }
];

export function FollowedStocks() {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Followed Stocks
          </CardTitle>
          <Link
            to="/dashboard/briefings"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Follow More Stocks
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {mockFollowedStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-2">
                {/* Header with symbol and change */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{stock.symbol}</span>
                    {stock.projectedChangePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <Badge
                    variant={stock.projectedChangePercent >= 0 ? "default" : "destructive"}
                    className="text-xs px-1.5 py-0.5"
                    style={
                      stock.projectedChangePercent >= 0
                        ? { backgroundColor: "hsl(120, 60%, 50%)", color: "#fff" }
                        : undefined
                    }
                  >
                    {stock.projectedChangePercent >= 0 ? "+" : ""}{stock.projectedChangePercent.toFixed(1)}%
                  </Badge>
                </div>

                {/* Company name */}
                <div className="text-xs text-muted-foreground truncate">
                  {stock.name}
                </div>

                {/* Metrics */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open:</span>
                    <span className="font-medium">${stock.openingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target High:</span>
                    <span className="font-medium text-green-600">${stock.targetHigh.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Low:</span>
                    <span className="font-medium text-red-600">${stock.targetLow.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Projections updated pre-market
          </p>
        </div>
      </CardContent>
    </Card>
  );
}