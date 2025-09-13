import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, TrendingUp, BarChart3 } from "lucide-react";

const CremersWeinbaum2010 = () => {
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
          <span>Cremers & Weinbaum (2010)</span>
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
            Deviations from Put-Call Parity and Stock Return Predictability
          </h1>
          
          <div className="text-lg text-muted-foreground space-y-2">
            <p className="font-medium">Martijn Cremers & David Weinbaum</p>
            <p><em>Journal of Financial and Quantitative Analysis</em>, 45(2), 335-367 (2010)</p>
            <a 
              href="https://doi.org/10.1017/S002210901000013X"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              DOI: 10.1017/S002210901000013X
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
                  Deviations from put-call parity contain information about future stock returns. 
                  When options violate put-call parity, it signals informed trading and predicts 
                  directional stock moves over the subsequent 1-5 trading days.
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
                  Cremers and Weinbaum's research demonstrates that violations of put-call parity—
                  a fundamental options pricing relationship—contain valuable information about 
                  future stock price movements. These violations typically occur when informed 
                  traders prefer options over stocks for strategic reasons.
                </p>
                
                <h3 className="font-semibold text-lg">Put-Call Parity Theory</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>C - P = S - K × e^(-r×T)</strong>
                  </p>
                  <p className="text-sm">
                    Where C = call price, P = put price, S = stock price, K = strike price, 
                    r = risk-free rate, T = time to expiration
                  </p>
                </div>

                <h3 className="font-semibold text-lg">Methodology</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Calculated daily put-call parity deviations for all option pairs</li>
                  <li>• Analyzed deviations by moneyness and time to expiration</li>
                  <li>• Controlled for bid-ask spreads and transaction costs</li>
                  <li>• Examined predictive power over 1, 5, and 20-day horizons</li>
                </ul>

                <h3 className="font-semibold text-lg">Key Results</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Positive deviations predict positive stock returns (calls expensive relative to puts)</li>
                  <li>• Negative deviations predict negative stock returns (puts expensive relative to calls)</li>
                  <li>• Effect strongest for near-the-money options with 30-60 days to expiration</li>
                  <li>• Returns to deviation-based strategies exceed 15% annually</li>
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
                  We implement Cremers and Weinbaum's insights through comprehensive put-call ratio analysis:
                </p>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Real-time Parity Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Continuous calculation of put-call parity deviations across all liquid 
                    options, adjusted for dividends and interest rates.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Moneyness Segmentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Separate analysis for ITM, ATM, and OTM options, with highest weight 
                    given to ATM options where information content is strongest.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Time Decay Adjustment</h4>
                  <p className="text-sm text-muted-foreground">
                    Exponential weighting that favors options with 30-60 days to expiration, 
                    where parity violations are most predictive.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Volume-Weighted Signals</h4>
                  <p className="text-sm text-muted-foreground">
                    Deviations weighted by option volume and open interest to identify 
                    the most meaningful violations likely driven by informed trading.
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
                  This research has significantly influenced how options markets are viewed in 
                  terms of price discovery. It demonstrates that options markets can lead stock 
                  markets in incorporating new information, particularly when informed traders 
                  prefer the leverage and limited downside of options.
                </p>
                
                <p>
                  The paper has spawned numerous follow-up studies examining the microstructure 
                  reasons for put-call parity violations and their persistence across different 
                  market conditions.
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
                  <span className="font-medium">300+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Research Period</span>
                  <span className="font-medium">1996-2005</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Return</span>
                  <span className="font-medium">15%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Significance</span>
                  <span className="font-medium">p &lt; 0.01</span>
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
                  to="/research/papers/pan-poteshman-2006"
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-sm">Option Volume Information</div>
                  <div className="text-xs text-muted-foreground">Pan & Poteshman (2006)</div>
                </Link>
                
                <div className="block p-3 rounded-lg border bg-muted/30">
                  <div className="font-medium text-sm">Options Market Making</div>
                  <div className="text-xs text-muted-foreground">Garman & Kohlhagen (1983)</div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Parity Deviation</div>
                  <div className="text-muted-foreground">C - P - (S - K×e^(-r×T))</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Moneyness Weight</div>
                  <div className="text-muted-foreground">Highest for ATM options</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Time Weight</div>
                  <div className="text-muted-foreground">Peak at 30-60 days</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Volume Filter</div>
                  <div className="text-muted-foreground">Min. 100 contracts/day</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CremersWeinbaum2010;