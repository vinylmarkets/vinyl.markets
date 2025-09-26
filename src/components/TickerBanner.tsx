import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const tickerData: TickerItem[] = [
  { symbol: "SPY", price: 498.75, change: 2.45, changePercent: 0.49 },
  { symbol: "QQQ", price: 442.18, change: -1.23, changePercent: -0.28 },
  { symbol: "AAPL", price: 184.35, change: 3.21, changePercent: 1.77 },
  { symbol: "TSLA", price: 241.50, change: -5.67, changePercent: -2.29 },
  { symbol: "NVDA", price: 875.20, change: 12.80, changePercent: 1.48 },
  { symbol: "MSFT", price: 415.80, change: 2.90, changePercent: 0.70 },
  { symbol: "GOOGL", price: 168.25, change: -0.85, changePercent: -0.50 },
  { symbol: "AMZN", price: 178.92, change: 4.13, changePercent: 2.36 },
  { symbol: "META", price: 512.33, change: 8.75, changePercent: 1.74 },
  { symbol: "AMD", price: 125.40, change: -2.10, changePercent: -1.65 }
];

export function TickerBanner() {
  // Duplicate the data to create seamless scrolling
  const extendedTickerData = [...tickerData, ...tickerData];

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border/50 overflow-hidden">
      <div className="relative h-12 flex items-center">
        <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-card/80 to-transparent z-10" />
        <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-card/80 to-transparent z-10" />
        
        <div className="flex animate-scroll whitespace-nowrap">
          {extendedTickerData.map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="flex items-center gap-2 px-6 text-sm">
              <span className="font-semibold text-foreground">{item.symbol}</span>
              <span className="text-foreground">${item.price.toFixed(2)}</span>
              <div className="flex items-center gap-1">
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}