import { ProbabilityCard } from "@/components/ProbabilityCard";
import { Navigation } from "@/components/Navigation";
import { LiveAccuracyTracker } from "@/components/LiveAccuracyTracker";
import { BetaCountdown } from "@/components/BetaCountdown";
import { PerformanceLeaderboard } from "@/components/PerformanceLeaderboard";
import { CommunityPreview } from "@/components/CommunityPreview";
import { mockPortfolioData } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

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
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            Transparent data for retail traders.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            Get access to the probability modeling and see how our algorithm is built. We don't make buy/sell recommendations. We simply give you our algorithm and make it public so you can see how our model makes its projection.
          </p>
          <p className="text-xl font-semibold text-secondary mb-8">
            Sign up today
          </p>
          
          {/* Live Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            <LiveAccuracyTracker />
            <BetaCountdown />
            <PerformanceLeaderboard />
          </div>
          
          {/* Stock Ticker Search CTA */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Enter stock ticker (e.g. AAPL)" 
              className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3">
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

        {/* Community Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <CommunityPreview />
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
