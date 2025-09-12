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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Post 1 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={techSectorImg} 
                alt="Tech sector analysis" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-xl font-serif mb-3 text-foreground">Tech Sector Shows 73% Probability of Continued Rally</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Our algorithmic analysis reveals strong momentum indicators across major tech stocks. NVIDIA and Apple show particularly compelling probability metrics.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={energySectorImg} 
                alt="Energy sector analysis" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-xl font-serif mb-3 text-foreground">Energy Sector Volatility: 42% Probability Models Signal Caution</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Geopolitical tensions and seasonal demand patterns create complex probability matrices for energy stocks.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-probability-medium">Medium Confidence</span>
                  <button className="text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={healthcareSectorImg} 
                alt="Healthcare sector analysis" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-xl font-serif mb-3 text-foreground">Healthcare Innovation Drives 68% Probability of Sector Rotation</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Breakthrough pharmaceutical approvals and biotech merger activity create compelling probability scenarios.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-sm text-primary hover:underline">Read Analysis →</button>
                </div>
              </div>
            </article>

            {/* Blog Post 4 */}
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
              <img 
                src={cryptoAnalysisImg} 
                alt="Cryptocurrency analysis" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-2">December 12, 2024</div>
                <h3 className="text-xl font-serif mb-3 text-foreground">Crypto Market Shows 59% Probability of Holiday Rally</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Bitcoin and Ethereum display strong institutional buying patterns ahead of year-end positioning.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">High Confidence</span>
                  <button className="text-sm text-primary hover:underline">Read Analysis →</button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
