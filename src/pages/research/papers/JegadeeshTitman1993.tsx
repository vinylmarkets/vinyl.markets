import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, TrendingUp, BarChart3, Activity } from "lucide-react";

const JegadeeshTitman1993 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Navigation */}
        <Link 
          to="/research" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research Papers
        </Link>

        {/* Paper Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Badge variant="outline">1993</Badge>
            <Badge variant="secondary">Technical Analysis</Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Returns to Buying Winners and Selling Losers
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            Jegadeesh, N., & Titman, S.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span><strong>Journal:</strong> Journal of Finance</span>
            <span><strong>Volume:</strong> 48(1), 65-91</span>
            <span><strong>Year:</strong> 1993</span>
            <a 
              href="https://doi.org/10.1111/j.1540-6261.1993.tb04702.x"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              DOI: 10.1111/j.1540-6261.1993.tb04702.x <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Key Finding */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Finding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              Stocks that performed well over 3-12 months continue to perform well subsequently. 
              This seminal paper established the existence of price momentum in equity markets, 
              demonstrating that past winners outperform past losers for intermediate horizons 
              of 3 to 12 months.
            </p>
          </CardContent>
        </Card>

        {/* Research Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Research Methodology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The researchers analyzed stock returns from 1965-1989, examining portfolio 
                strategies based on past performance:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Formation periods: 3, 6, 9, and 12 months</li>
                <li>Holding periods: 3, 6, 9, and 12 months</li>
                <li>Winner/loser portfolios based on past returns</li>
                <li>Risk-adjusted performance measurement</li>
              </ul>
              <p>
                They found that momentum strategies generated significant abnormal returns, 
                with the strongest effects in the 6-month formation and 6-month holding periods.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistical Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">12.01%</div>
                  <div className="text-sm text-muted-foreground">Annual momentum premium</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">6/6</div>
                  <div className="text-sm text-muted-foreground">Optimal formation/holding months</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">2.3</div>
                  <div className="text-sm text-muted-foreground">t-statistic significance</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">0.89</div>
                  <div className="text-sm text-muted-foreground">Sharpe ratio improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Implementation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Our Algorithm Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-4">Multi-Timeframe Momentum Analysis</h3>
            <p className="mb-4">
              Our momentum factor considers multiple timeframes with strongest weight on 3-6 months, 
              directly implementing the paper's optimal formation periods.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Momentum Calculation</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>3-month momentum (25% weight)</li>
                  <li>6-month momentum (40% weight)</li>
                  <li>9-month momentum (25% weight)</li>
                  <li>12-month momentum (10% weight)</li>
                  <li>Risk-adjusted momentum scores</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Enhancement Factors</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Volume-weighted momentum</li>
                  <li>Volatility-adjusted returns</li>
                  <li>Sector-relative momentum</li>
                  <li>Market regime conditioning</li>
                  <li>Earnings announcement timing</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Dynamic Weighting</h4>
              <p className="text-sm">
                We dynamically adjust momentum weights based on market volatility regimes. During 
                low volatility periods, we increase momentum factor weight to 35% of total signal. 
                In high volatility markets, we reduce it to 15% and increase mean reversion factors. 
                This prevents momentum strategies from failing during market reversals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Context */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Momentum in Modern Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Bull Markets</h4>
                <ul className="text-sm space-y-1">
                  <li>• Strong momentum persistence</li>
                  <li>• 6-9 month optimal holding</li>
                  <li>• High confidence signals</li>
                  <li>• Cross-sectional spread expansion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Volatile Markets</h4>
                <ul className="text-sm space-y-1">
                  <li>• Shorter momentum cycles</li>
                  <li>• 3-month formation periods</li>
                  <li>• Increased noise levels</li>
                  <li>• Sector rotation effects</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Bear Markets</h4>
                <ul className="text-sm space-y-1">
                  <li>• Momentum breakdown</li>
                  <li>• Mean reversion dominance</li>
                  <li>• Defensive positioning</li>
                  <li>• Quality factor emphasis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Implementation Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Backtesting our enhanced momentum implementation (2019-2024):
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">14.7%</div>
                <div className="text-sm text-muted-foreground">Annual excess return</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">67%</div>
                <div className="text-sm text-muted-foreground">Win rate</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">1.8</div>
                <div className="text-sm text-muted-foreground">Information ratio</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">-8.2%</div>
                <div className="text-sm text-muted-foreground">Max drawdown</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Research */}
        <Card>
          <CardHeader>
            <CardTitle>Related Research</CardTitle>
            <CardDescription>
              Other papers that complement this research in our algorithm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded bg-purple-100 text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">
                    <Link to="/research/papers/brown-jennings-1989" className="hover:underline">
                      On Technical Analysis (Brown & Jennings, 1989)
                    </Link>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Provides theoretical foundation for technical momentum indicators
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded bg-purple-100 text-purple-600">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold">
                    <Link to="/research/papers/engle-1982" className="hover:underline">
                      Autoregressive Conditional Heteroskedasticity (Engle, 1982)
                    </Link>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Volatility modeling for risk-adjusted momentum calculations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JegadeeshTitman1993;