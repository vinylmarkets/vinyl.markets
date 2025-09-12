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
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="font-serif text-6xl font-bold mb-6 text-foreground tracking-tight leading-tight">
              Financial Education<br />
              <span className="font-serif italic text-primary">Refined</span>
            </h1>
            <h2 className="font-serif-body text-2xl mb-6 text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Transparent data for retail traders through the lens of academic rigor and institutional-grade analysis.
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
              Access probability modeling with complete transparency. We provide our algorithmic methodology publicly, 
              allowing you to understand the mechanics behind every projection—no black boxes, no hidden assumptions.
            </p>
            <p className="font-sans text-lg font-semibold text-foreground mb-8 tracking-wide letter-spacing-wider">
              LIVE DATA + MARKET MECHANICS + MEDIA MONITORING
            </p>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-sans font-medium px-8 py-3 shadow-elegant">
              Begin Your Education
            </Button>
          </div>
          
          {/* Live Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 max-w-6xl mx-auto">
            <BetaCountdown />
            <PerformanceLeaderboard />
          </div>
          
            {/* Academic Search Interface */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card max-w-2xl mx-auto mb-12">
              <h3 className="font-serif text-xl mb-4 text-foreground">Research Laboratory</h3>
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Enter equity symbol for analysis (e.g. AAPL)" 
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium px-6 py-3">
                  Research
                </Button>
              </div>
            </div>
          {/* Academic Portfolio Analysis */}
          <div className="mb-12">
            <h3 className="font-serif text-3xl font-bold text-center mb-3 text-foreground">
              Current Research Portfolio
            </h3>
            <p className="font-serif-body text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Live probability assessments from our transparent algorithmic framework
            </p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {mockPortfolioData.map((stock) => (
            <ProbabilityCard key={stock.symbol} {...stock} />
          ))}
        </div>

        {/* Community Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <CommunityPreview />
        </div>

          {/* Call to Academic Action */}
          <div className="text-center mt-20 bg-gradient-library rounded-lg p-12 shadow-elegant">
            <h3 className="font-serif text-3xl font-bold mb-4 text-foreground">
              Join Our Research Community
            </h3>
            <p className="font-serif-body text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access institutional-grade analysis with complete methodological transparency. 
              Build your financial literacy through rigorous, peer-reviewed approaches.
            </p>
            <Button size="lg" className="bg-gradient-success text-white font-sans font-medium text-lg px-10 py-4 shadow-glow-green">
              Begin Free Research Access
            </Button>
            <p className="font-sans text-sm text-muted-foreground mt-4">
              No commitments • Full methodology disclosure • Academic rigor
            </p>
          </div>

        {/* Live Performance Section at Bottom */}
        <div className="mt-16 max-w-lg mx-auto">
          <LiveAccuracyTracker />
        </div>
      </section>
    </div>
  );
};

export default Index;
