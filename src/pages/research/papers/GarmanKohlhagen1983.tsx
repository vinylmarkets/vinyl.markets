import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, ExternalLink, BookOpen, Target, Calculator, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GarmanKohlhagen1983 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Back Navigation */}
        <Link 
          to="/research/papers"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research Papers
        </Link>

        {/* Paper Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="px-3 py-1">1983</Badge>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Options Market Making</Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Foreign Currency Option Values
          </h1>
          
          <div className="text-lg text-muted-foreground mb-6">
            <span className="font-semibold">Garman, M. B., & Kohlhagen, S. W.</span>
            <br />
            <em>Journal of International Money and Finance</em>, 2(3), 231-237
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://doi.org/10.1016/S0261-5606(83)80001-1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Original Paper
            </a>
            <span className="text-sm text-muted-foreground">
              DOI: 10.1016/S0261-5606(83)80001-1
            </span>
          </div>
        </div>

        {/* Key Finding */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Research Finding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              The Garman-Kohlhagen model extends the Black-Scholes framework to currency options by 
              incorporating foreign interest rates, providing a theoretical foundation for options 
              market making in currency markets and demonstrating how dual interest rate environments 
              affect option pricing dynamics.
            </p>
          </CardContent>
        </Card>

        {/* Our Application */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Application in Our Algorithm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed mb-4">
              We apply Garman-Kohlhagen principles to identify mispriced options across different 
              market segments by considering:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Interest rate differentials that affect theoretical option values</li>
              <li>Market makers' inventory management strategies</li>
              <li>Cross-market arbitrage opportunities in options pricing</li>
              <li>Volatility surface inconsistencies that signal trading opportunities</li>
            </ul>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Research Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Published during the early development of currency derivatives markets, this paper 
                established the mathematical foundation for pricing currency options and understanding 
                market maker behavior in multi-currency environments.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Key Innovation:</h4>
                <p className="text-sm text-muted-foreground">
                  Modified Black-Scholes to account for foreign interest rates, creating the 
                  standard model for FX options that remains in use today.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Market Making Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The paper revealed how market makers must consider multiple yield curves when 
                setting bid-ask spreads, leading to systematic pricing patterns that informed 
                traders can exploit.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Trading Implications:</h4>
                <p className="text-sm text-muted-foreground">
                  Options with mismatched interest rate assumptions often trade at prices 
                  that deviate from theoretical values, creating arbitrage opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistical Evidence */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Implementation Details
            </CardTitle>
            <CardDescription>
              How we incorporate these insights into our probability calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Option Mispricing Detection</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium text-primary mb-1">Interest Rate Analysis</div>
                  <div className="text-muted-foreground">
                    Monitor yield curve changes across markets to identify pricing dislocations
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium text-primary mb-1">Volatility Surface</div>
                  <div className="text-muted-foreground">
                    Track implied volatility patterns for arbitrage opportunities
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium text-primary mb-1">Market Maker Flow</div>
                  <div className="text-muted-foreground">
                    Analyze bid-ask spread patterns to predict inventory-driven moves
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Signal Generation</h3>
              <p className="text-muted-foreground mb-4">
                Our algorithm generates trading signals when options prices deviate significantly from 
                Garman-Kohlhagen theoretical values, particularly focusing on:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Cross-currency volatility arbitrage opportunities</li>
                <li>Interest rate parity deviations in options pricing</li>
                <li>Market maker inventory imbalances affecting spread patterns</li>
                <li>Time-decay acceleration during interest rate shifts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Related Research */}
        <Card>
          <CardHeader>
            <CardTitle>Related Research in Our Algorithm</CardTitle>
            <CardDescription>
              Other papers that complement these insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/research/papers/pan-poteshman-2006"
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium mb-1">Pan & Poteshman (2006)</div>
                <div className="text-sm text-muted-foreground">
                  Options volume analysis for predicting stock movements
                </div>
              </Link>
              <Link
                to="/research/papers/cremers-weinbaum-2010"
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium mb-1">Cremers & Weinbaum (2010)</div>
                <div className="text-sm text-muted-foreground">
                  Put-call parity deviations and return predictability
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GarmanKohlhagen1983;