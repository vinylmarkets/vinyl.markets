import { ProbabilityCard } from "@/components/ProbabilityCard";
import { Navigation } from "@/components/Navigation";
import { LiveAccuracyTracker } from "@/components/LiveAccuracyTracker";
import { BetaCountdown } from "@/components/BetaCountdown";
import { PerformanceLeaderboard } from "@/components/PerformanceLeaderboard";
import { mockPortfolioData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import techSectorImg from "@/assets/blog-tech-sector.jpg";
import energySectorImg from "@/assets/blog-energy-sector.jpg";
import healthcareSectorImg from "@/assets/blog-healthcare-sector.jpg";
import cryptoAnalysisImg from "@/assets/blog-crypto-analysis.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-foreground">
            Transparent data for retail traders
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get access to the probability modeling and see how our algorithm is built. We don't make buy/sell recommendations. We simply give you our algorithm and make it public so you can see how our model makes its projection.
          </p>
          <Button variant="secondary" size="lg" className="rounded-full px-8 py-3 text-base">
            Get Started
          </Button>
        </div>
      </section>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Market Analysis Blog Posts */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif mb-8 text-foreground">Today's Market Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
            {/* Blog Post 1 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={techSectorImg} 
                alt="Tech sector analysis" 
                className="w-full h-32 md:h-48 object-cover"
              />
              <div className="p-4 md:p-6">
                <div className="text-xs md:text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-sm md:text-xl font-serif mb-2 md:mb-3 text-foreground leading-tight">Tech Sector Shows 73% Probability of Continued Rally</h3>
                <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                  Our algorithmic analysis reveals strong momentum indicators across major tech stocks. NVIDIA and Apple show particularly compelling probability metrics.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-xs md:text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={energySectorImg} 
                alt="Energy sector analysis" 
                className="w-full h-32 md:h-48 object-cover"
              />
              <div className="p-4 md:p-6">
                <div className="text-xs md:text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-sm md:text-xl font-serif mb-2 md:mb-3 text-foreground leading-tight">Energy Sector Volatility: 42% Probability Models Signal Caution</h3>
                <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                  Geopolitical tensions and seasonal demand patterns create complex probability matrices for energy stocks.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-probability-medium">Medium Confidence</span>
                  <button className="text-xs md:text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={healthcareSectorImg} 
                alt="Healthcare sector analysis" 
                className="w-full h-32 md:h-48 object-cover"
              />
              <div className="p-4 md:p-6">
                <div className="text-xs md:text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-sm md:text-xl font-serif mb-2 md:mb-3 text-foreground leading-tight">Healthcare Innovation Drives 68% Probability of Sector Rotation</h3>
                <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                  Breakthrough pharmaceutical approvals and biotech merger activity create compelling probability scenarios.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-xs md:text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 4 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={cryptoAnalysisImg} 
                alt="Cryptocurrency analysis" 
                className="w-full h-32 md:h-48 object-cover"
              />
              <div className="p-4 md:p-6">
                <div className="text-xs md:text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-sm md:text-xl font-serif mb-2 md:mb-3 text-foreground leading-tight">Crypto Market Shows 59% Probability of Holiday Rally</h3>
                <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                  Bitcoin and Ethereum display strong institutional buying patterns ahead of year-end positioning.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-xs md:text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Current Research Portfolio */}
        <div className="mb-12">
          <h3 className="text-3xl font-serif text-center mb-3 text-foreground">
            Current Research Portfolio
          </h3>
          <p className="text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Live probability assessments from our transparent algorithmic framework
          </p>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
            {mockPortfolioData.slice(0, 4).map((stock) => (
              <ProbabilityCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </div>

        {/* Beta Countdown */}
        <div className="text-center mb-12">
          <BetaCountdown />
        </div>

        {/* Call to Action */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif mb-4 text-foreground">Begin Your Education</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our community of researchers and practitioners exploring the intersection of data science and financial markets.
          </p>
          <Button variant="secondary" size="lg" className="rounded-full px-8 py-3">
            Get started
          </Button>
        </div>

        {/* Live Performance Tracker */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-sans mb-6 text-center text-foreground">Live Performance</h2>
          <LiveAccuracyTracker />
        </div>
      </div>
    </div>
  );
};

export default Index;
