import { ProbabilityCard } from "@/components/ProbabilityCard";
import { mockPortfolioData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Terminal, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-amber flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Tubeamp</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
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

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-amber bg-clip-text text-transparent">
            Portfolio Probability Cards
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn market noise into clear, probabilistic signals. Your daily intelligence briefing at 7:30 AM.
          </p>
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
