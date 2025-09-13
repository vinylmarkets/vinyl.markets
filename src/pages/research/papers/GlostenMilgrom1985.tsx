import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, TrendingUp, Activity } from "lucide-react";

const GlostenMilgrom1985 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/research" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Research Papers
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <Badge variant="outline">Market Microstructure</Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Bid, Ask and Transaction Prices in a Specialist Market with Heterogeneously Informed Traders
          </h1>
          
          <div className="text-lg text-muted-foreground mb-6">
            <span className="font-medium">Lawrence R. Glosten & Paul R. Milgrom</span> • Journal of Financial Economics, 1985 • 14(1), 71-100
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://doi.org/10.1016/0304-405X(85)90044-3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Original Paper
            </a>
          </div>
        </div>

        {/* Key Findings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This seminal paper established the theoretical foundation for understanding how bid-ask spreads 
              reflect information asymmetry between traders, fundamentally changing how we view market microstructure.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Core Discovery</h4>
              <p className="text-sm text-muted-foreground">
                "Bid-ask spreads widen when informed trading is more likely, as market makers compensate 
                for the adverse selection risk of trading against better-informed counterparts."
              </p>
            </div>
            
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• Market makers set spreads based on the probability of informed trading</li>
              <li>• Wider spreads indicate higher information asymmetry in the market</li>
              <li>• Transaction volume affects the information content of trades</li>
              <li>• Sequential trade models explain price discovery mechanisms</li>
            </ul>
          </CardContent>
        </Card>

        {/* Our Implementation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Our Implementation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We monitor real-time bid-ask spreads and volume-weighted price pressure to identify 
              periods of informed trading and adjust our confidence levels accordingly.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Spread Monitoring</h4>
                <p className="text-xs text-muted-foreground">
                  Real-time tracking of bid-ask spreads across multiple timeframes. 
                  Sudden widening indicates potential informed trading activity.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Volume-Weighted Pressure</h4>
                <p className="text-xs text-muted-foreground">
                  Large trades are weighted more heavily as potential signals of 
                  informed trading, following Glosten-Milgrom's sequential trade model.
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Information Asymmetry Indicator</h4>
              <p className="text-sm text-muted-foreground">
                When spreads widen significantly relative to historical norms, our algorithm 
                reduces confidence in momentum signals and increases weight on fundamental factors, 
                anticipating potential price reversals driven by informed traders.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mathematical Framework */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mathematical Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2"><strong>Bid-Ask Spread Model:</strong></div>
              <div>S = (Ask - Bid) / Midpoint</div>
              <div className="text-xs text-muted-foreground mt-2">
                Where S represents the proportional spread
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2"><strong>Information Asymmetry Score:</strong></div>
              <div>IA = (S_current - S_avg) / σ_S</div>
              <div className="text-xs text-muted-foreground mt-2">
                Normalized spread deviation from rolling 20-day average
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2"><strong>Price Pressure Indicator:</strong></div>
              <div>PP = Σ(Volume_i × Sign(ΔP_i)) / Total_Volume</div>
              <div className="text-xs text-muted-foreground mt-2">
                Volume-weighted directional price movements over 1-hour windows
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practical Applications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Practical Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Glosten-Milgrom model has become the theoretical backbone for modern 
              market microstructure analysis and high-frequency trading strategies.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-primary mb-2">HFT Strategies</div>
                <div className="text-xs text-muted-foreground">
                  Market makers use G-M models to set optimal bid-ask spreads
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-primary mb-2">Execution Algos</div>
                <div className="text-xs text-muted-foreground">
                  Institutional traders time large orders based on spread patterns
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-primary mb-2">Risk Management</div>
                <div className="text-xs text-muted-foreground">
                  Banks monitor spreads to detect potential information leakage
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Research */}
        <Card>
          <CardHeader>
            <CardTitle>Related Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link 
                to="/research/papers/engle-1982"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium text-sm">Autoregressive Conditional Heteroskedasticity (Engle, 1982)</div>
                <div className="text-xs text-muted-foreground">Volatility modeling that affects spread dynamics</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center mt-12">
          <Button asChild>
            <Link to="/research">
              Return to All Research Papers
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GlostenMilgrom1985;