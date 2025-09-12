import { ProbabilityCard } from "@/components/ProbabilityCard";
import { StockTicker } from "@/components/StockTicker";
import { mockPortfolioData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Terminal, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: 'hsl(var(--header-background))', color: 'hsl(var(--header-foreground))' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--header-foreground))' }}>Tubeamp</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Terminal className="w-4 h-4 mr-2" />
                Ask Tubeamp
              </Button>
              <Button size="sm" className="bg-gradient-amber">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stock Ticker Banner */}
      <div className="border-b border-border/50 overflow-hidden py-3" style={{ backgroundColor: 'hsl(var(--header-background))', color: 'hsl(var(--header-foreground))' }}>
        <div className="flex gap-8 animate-scroll">
          {/* Duplicate the items for seamless scrolling */}
          {[
            { symbol: "AAPL", price: 185.43, change: 2.87, isPositive: true },
            { symbol: "TSLA", price: 248.91, change: -5.12, isPositive: false },
            { symbol: "NVDA", price: 421.67, change: 8.24, isPositive: true },
            { symbol: "MSFT", price: 367.12, change: 1.45, isPositive: true },
            { symbol: "AMZN", price: 142.38, change: -1.92, isPositive: false },
            { symbol: "GOOGL", price: 138.21, change: 3.47, isPositive: true },
            { symbol: "META", price: 312.45, change: -2.18, isPositive: false },
            { symbol: "BTC-USD", price: 42891.23, change: 1247.56, isPositive: true },
            { symbol: "ETH-USD", price: 2534.67, change: -89.34, isPositive: false },
          ].concat([
            { symbol: "AAPL", price: 185.43, change: 2.87, isPositive: true },
            { symbol: "TSLA", price: 248.91, change: -5.12, isPositive: false },
            { symbol: "NVDA", price: 421.67, change: 8.24, isPositive: true },
            { symbol: "MSFT", price: 367.12, change: 1.45, isPositive: true },
            { symbol: "AMZN", price: 142.38, change: -1.92, isPositive: false },
            { symbol: "GOOGL", price: 138.21, change: 3.47, isPositive: true },
            { symbol: "META", price: 312.45, change: -2.18, isPositive: false },
            { symbol: "BTC-USD", price: 42891.23, change: 1247.56, isPositive: true },
            { symbol: "ETH-USD", price: 2534.67, change: -89.34, isPositive: false },
          ]).map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex items-center gap-2 whitespace-nowrap min-w-fit">
              <span className="font-semibold text-secondary">{stock.symbol}</span>
              <span style={{ color: 'hsl(var(--header-foreground))' }}>${stock.price.toLocaleString()}</span>
              <span className={`text-sm ${stock.isPositive ? 'text-secondary' : 'text-destructive'}`}>
                {stock.isPositive ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-amber bg-clip-text text-transparent">
            Stock Signal Analysis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Turn market noise into clear, probabilistic signals. Your daily intelligence briefing at 7:30 AM.
          </p>
          
          {/* Stock Ticker Search CTA */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Enter stock ticker (e.g. AAPL)" 
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button className="bg-gradient-amber px-6 py-3">
              Analyze
            </Button>
          </div>
        </div>

        {/* Probability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {mockPortfolioData.map((stock) => (
            <ProbabilityCard key={stock.symbol} {...stock} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-success text-lg px-8 py-6 shadow-glow-green">
            Start Your Free Trial
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
