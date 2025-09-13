import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, TrendingUp, BarChart3 } from "lucide-react";

const PanPoteshman2006 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/research/papers" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Research Papers
          </Link>
          <span>/</span>
          <span>Pan & Poteshman (2006)</span>
        </div>

        {/* Paper Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <Badge variant="outline">Options Flow</Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            The Information in Option Volume for Future Stock Prices
          </h1>
          
          <div className="text-lg text-muted-foreground space-y-2">
            <p className="font-medium">Jun Pan & Allen M. Poteshman</p>
            <p><em>Review of Financial Studies</em>, 19(3), 871-908 (2006)</p>
            <a 
              href="https://doi.org/10.1093/rfs/hhj024"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              DOI: 10.1093/rfs/hhj024
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Finding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Finding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">
                  Unusual options volume predicts future stock returns. The study finds that abnormal 
                  option trading activity contains forward-looking information about stock price movements, 
                  particularly when call and put volume deviates significantly from historical norms.
                </p>
              </CardContent>
            </Card>

            {/* Research Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Research Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This landmark study by Pan and Poteshman demonstrates that option volume contains 
                  significant predictive information about future stock returns. Using comprehensive 
                  options data from the Chicago Board Options Exchange (CBOE), they developed 
                  metrics to identify unusual option trading activity.
                </p>
                
                <h3 className="font-semibold text-lg">Methodology</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Analyzed daily option volume data across multiple exchanges</li>
                  <li>• Calculated volume z-scores relative to historical rolling averages</li>
                  <li>• Separated call and put volume to detect directional bias</li>
                  <li>• Controlled for stock-specific factors and market conditions</li>
                </ul>

                <h3 className="font-semibold text-lg">Key Results</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Unusual call buying predicts positive stock returns over 1-5 days</li>
                  <li>• Unusual put buying predicts negative stock returns over similar horizons</li>
                  <li>• Effect is strongest for individual stocks vs. index options</li>
                  <li>• Information content persists after controlling for momentum and reversal</li>
                </ul>
              </CardContent>
            </Card>

            {/* Our Implementation */}
            <Card>
              <CardHeader>
                <CardTitle>Our Implementation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We implement Pan and Poteshman's findings through real-time option flow analysis:
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Volume Z-Score Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    Daily option volume compared to 20-day rolling average, standardized by 
                    historical volatility to identify truly unusual activity.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Call/Put Ratio Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Separate tracking of call and put volume anomalies, weighted by open interest 
                    and time to expiration for more accurate signals.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Automated Flagging System</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time alerts when option volume exceeds 2+ standard deviations from 
                    normal levels, integrated into our probability calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This paper has been cited over 500 times and established the foundation for 
                  modern option flow analysis. It was among the first to rigorously document 
                  the predictive power of option volume, influencing both academic research 
                  and practical trading strategies.
                </p>
                
                <p>
                  The methodology has been extended by subsequent research examining market maker 
                  hedging, informed trading patterns, and the role of volatility in option 
                  volume interpretation.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paper Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Citations</span>
                  <span className="font-medium">500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Research Period</span>
                  <span className="font-medium">1990-2001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points</span>
                  <span className="font-medium">Millions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Significance</span>
                  <span className="font-medium">p &lt; 0.001</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Research */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link 
                  to="/research/papers/cremers-weinbaum-2010"
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-sm">Put-Call Parity Deviations</div>
                  <div className="text-xs text-muted-foreground">Cremers & Weinbaum (2010)</div>
                </Link>
                
                <div className="block p-3 rounded-lg border bg-muted/30">
                  <div className="font-medium text-sm">Volatility Surface Analysis</div>
                  <div className="text-xs text-muted-foreground">Derman & Kani (1994)</div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools & Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Volume Z-Score</div>
                  <div className="text-muted-foreground">Standardized volume deviation</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Call/Put Ratio</div>
                  <div className="text-muted-foreground">Directional flow analysis</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Open Interest Impact</div>
                  <div className="text-muted-foreground">Position size weighting</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanPoteshman2006;