import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, TrendingUp, Activity } from "lucide-react";

const Engle1982 = () => {
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
            Autoregressive Conditional Heteroskedasticity with Estimates of the Variance of United Kingdom Inflation
          </h1>
          
          <div className="text-lg text-muted-foreground mb-6">
            <span className="font-medium">Robert F. Engle</span> • Econometrica, 1982 • 50(4), 987-1007
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://doi.org/10.2307/1912773"
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
              Engle's groundbreaking paper introduced the ARCH (Autoregressive Conditional Heteroskedasticity) model, 
              revolutionizing how we understand and model volatility in financial time series.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Core Discovery</h4>
              <p className="text-sm text-muted-foreground">
                "Volatility exhibits clustering - high volatility periods follow high volatility periods, 
                and low volatility periods follow low volatility periods."
              </p>
            </div>
            
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• The variance of financial returns is not constant over time (heteroskedasticity)</li>
              <li>• Current volatility depends on past volatility (autoregressive property)</li>
              <li>• This creates the characteristic "volatility clustering" seen in markets</li>
              <li>• Traditional models assuming constant variance severely underestimate risk</li>
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
              We implement GARCH models (the generalized version of ARCH) to identify volatility regimes 
              and dynamically adjust our factor weights based on current market conditions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Volatility Regime Detection</h4>
                <p className="text-xs text-muted-foreground">
                  Real-time GARCH(1,1) models estimate current volatility levels and classify 
                  market regimes as low, medium, or high volatility.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Dynamic Factor Weighting</h4>
                <p className="text-xs text-muted-foreground">
                  Technical indicators receive higher weights in low-volatility regimes, 
                  while fundamental factors dominate during high-volatility periods.
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Risk-Adjusted Momentum</h4>
              <p className="text-sm text-muted-foreground">
                Our momentum calculations are volatility-adjusted using Engle's framework. 
                A 5% move in a low-volatility environment carries different information 
                than the same move during high volatility.
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
              <div className="mb-2"><strong>ARCH(p) Model:</strong></div>
              <div>σ²ₜ = α₀ + α₁ε²ₜ₋₁ + α₂ε²ₜ₋₂ + ... + αₚε²ₜ₋ₚ</div>
              <div className="text-xs text-muted-foreground mt-2">
                Where σ²ₜ is conditional variance and ε²ₜ₋ᵢ are past squared residuals
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="mb-2"><strong>Our GARCH(1,1) Implementation:</strong></div>
              <div>σ²ₜ = ω + αε²ₜ₋₁ + βσ²ₜ₋₁</div>
              <div className="text-xs text-muted-foreground mt-2">
                Estimates updated every 15 minutes using rolling 252-day windows
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact & Legacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Impact & Legacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Engle's work earned him the 2003 Nobel Prize in Economics and fundamentally changed 
              how financial institutions measure and manage risk.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">2003</div>
                <div className="text-xs text-muted-foreground">Nobel Prize Winner</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">10,000+</div>
                <div className="text-xs text-muted-foreground">Citations</div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">VaR</div>
                <div className="text-xs text-muted-foreground">Risk Models Foundation</div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Today, virtually every major financial institution uses GARCH-based models 
              for risk management, and central banks rely on these models for monetary policy decisions.
            </p>
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
                to="/research/papers/glosten-milgrom-1985"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium text-sm">Bid, Ask and Transaction Prices (Glosten & Milgrom, 1985)</div>
                <div className="text-xs text-muted-foreground">Microstructure factors affecting volatility patterns</div>
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

export default Engle1982;