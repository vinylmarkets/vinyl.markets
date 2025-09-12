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
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-foreground">
            Human stories & ideas
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A place to read, write, and deepen your understanding of financial markets
          </p>
          <Button size="lg" className="rounded-full px-8 py-3 text-base">
            Start reading
          </Button>
        </div>
      </section>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-serif mb-6 text-foreground">Research Laboratory</h2>
            <PerformanceLeaderboard />
          </div>
          <div>
            <h2 className="text-3xl font-serif mb-6 text-foreground">Community Insights</h2>
            <CommunityPreview />
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
