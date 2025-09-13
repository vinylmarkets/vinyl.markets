import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, TrendingUp, Users, BarChart3, Activity } from "lucide-react";

const ResearchPapers = () => {
  const paperCategories = [
    {
      category: "Bayesian Reasoning",
      icon: <Brain className="h-5 w-5" />,
      papers: [
        {
          id: "kahneman-tversky-1973",
          title: "On the Psychology of Prediction",
          authors: "Kahneman, D., & Tversky, A.",
          year: "1973",
          journal: "Psychological Review",
          keyFinding: "Humans systematically ignore base rates when making predictions, leading to overconfidence.",
          application: "Our algorithm anchors on statistical reality before considering new evidence.",
          citation: "80(4), 237-251",
          doi: "10.1037/h0034747"
        },
        {
          id: "hoeting-1999",
          title: "Bayesian Model Averaging: A Tutorial",
          authors: "Hoeting, J. A., Madigan, D., Raftery, A. E., & Volinsky, C. T.",
          year: "1999",
          journal: "Statistical Science",
          keyFinding: "Combining multiple models with Bayesian weights produces more robust predictions.",
          application: "We weight multiple signals based on their historical accuracy in different market regimes.",
          citation: "14(4), 382-401",
          doi: "10.1214/ss/1009212519"
        }
      ]
    },
    {
      category: "Social Sentiment",
      icon: <Users className="h-5 w-5" />,
      papers: [
        {
          id: "da-engelberg-gao-2011",
          title: "In Search of Attention: Google Search Volume and Stock Performance",
          authors: "Da, Z., Engelberg, J., & Gao, P.",
          year: "2011",
          journal: "Journal of Finance",
          keyFinding: "Abnormal Google search volume predicts higher stock prices, followed by price reversals.",
          application: "We track mention velocity and account for mean reversion after viral events.",
          citation: "66(5), 1461-1499",
          doi: "10.1111/j.1540-6261.2011.01679.x"
        },
        {
          id: "bollen-mao-zeng-2011",
          title: "Twitter Mood Predicts the Stock Market",
          authors: "Bollen, J., Mao, H., & Zeng, X.",
          year: "2011",
          journal: "Journal of Computational Science",
          keyFinding: "Daily Twitter sentiment correlates with Dow Jones closing values with 87.6% accuracy.",
          application: "Real-time sentiment scoring across platforms, weighted by user credibility.",
          citation: "2(1), 1-8",
          doi: "10.1016/j.jocs.2010.12.007"
        },
        {
          id: "boehmer-2021",
          title: "Tracking Retail Investor Activity",
          authors: "Boehmer, E., Jones, C. M., Zhang, X., & Zhang, X.",
          year: "2021",
          journal: "Journal of Finance",
          keyFinding: "Retail investor attention has measurable impact on stock prices and volatility.",
          application: "We monitor retail-focused platforms as leading indicators of retail flow.",
          citation: "76(5), 2249-2305",
          doi: "10.1111/jofi.13033"
        }
      ]
    },
    {
      category: "Technical Analysis",
      icon: <TrendingUp className="h-5 w-5" />,
      papers: [
        {
          id: "jegadeesh-titman-1993",
          title: "Returns to Buying Winners and Selling Losers",
          authors: "Jegadeesh, N., & Titman, S.",
          year: "1993",
          journal: "Journal of Finance",
          keyFinding: "Stocks that performed well over 3-12 months continue to perform well subsequently.",
          application: "Our momentum factor considers multiple timeframes with strongest weight on 3-6 months.",
          citation: "48(1), 65-91",
          doi: "10.1111/j.1540-6261.1993.tb04702.x"
        },
        {
          id: "brown-jennings-1989",
          title: "On Technical Analysis",
          authors: "Brown, D. P., & Jennings, R. H.",
          year: "1989",
          journal: "Review of Financial Studies",
          keyFinding: "Technical indicators have predictive power in identifying oversold/overbought conditions.",
          application: "Regime-aware RSI interpretation where oversold signals are stronger in low-volatility environments.",
          citation: "2(4), 527-551",
          doi: "10.1093/rfs/2.4.527"
        }
      ]
    },
    {
      category: "Options Flow",
      icon: <BarChart3 className="h-5 w-5" />,
      papers: [
        {
          id: "pan-poteshman-2006",
          title: "The Information in Option Volume for Future Stock Prices",
          authors: "Pan, J., & Poteshman, A. M.",
          year: "2006",
          journal: "Review of Financial Studies",
          keyFinding: "Unusual options volume predicts future stock returns.",
          application: "Real-time calculation of volume z-scores and automatic flagging of unusual activity.",
          citation: "19(3), 871-908",
          doi: "10.1093/rfs/hhj024"
        },
        {
          id: "cremers-weinbaum-2010",
          title: "Deviations from Put-Call Parity and Stock Return Predictability",
          authors: "Cremers, M., & Weinbaum, D.",
          year: "2010",
          journal: "Journal of Financial and Quantitative Analysis",
          keyFinding: "Deviations from put-call parity contain information about future stock returns.",
          application: "Put-call ratio analysis segmented by moneyness and time to expiration.",
          citation: "45(2), 335-367",
          doi: "10.1017/S002210901000013X"
        },
        {
          id: "garman-kohlhagen-1983",
          title: "Foreign Currency Option Values",
          authors: "Garman, M. B., & Kohlhagen, S. W.",
          year: "1983",
          journal: "Journal of International Money and Finance",
          keyFinding: "Extended Black-Scholes framework to currency options by incorporating foreign interest rates.",
          application: "Options market making analysis and cross-market arbitrage identification.",
          citation: "2(3), 231-237",
          doi: "10.1016/S0261-5606(83)80001-1"
        }
      ]
    },
    {
      category: "Market Microstructure",
      icon: <Activity className="h-5 w-5" />,
      papers: [
        {
          id: "engle-1982",
          title: "Autoregressive Conditional Heteroskedasticity",
          authors: "Engle, R. F.",
          year: "1982",
          journal: "Econometrica",
          keyFinding: "Volatility exhibits clustering - high volatility periods follow high volatility periods.",
          application: "GARCH models to identify volatility regimes and adjust factor weights.",
          citation: "50(4), 987-1007",
          doi: "10.2307/1912773"
        },
        {
          id: "glosten-milgrom-1985",
          title: "Bid, Ask and Transaction Prices in a Specialist Market",
          authors: "Glosten, L. R., & Milgrom, P. R.",
          year: "1985",
          journal: "Journal of Financial Economics",
          keyFinding: "Bid-ask spreads widen when informed trading is more likely.",
          application: "Real-time monitoring of spread changes and volume-weighted price pressure indicators.",
          citation: "14(1), 71-100",
          doi: "10.1016/0304-405X(85)90044-3"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Research Foundation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The Academic Papers Behind Our Algorithm
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Our algorithm isn't built on hunches or trading folklore. Every factor, weight, and calculation 
            is grounded in peer-reviewed academic research. Here's the scholarly foundation that powers our 
            probability assessments.
          </p>
        </div>

        {/* Research Categories */}
        {paperCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                {category.icon}
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground">
                {category.category}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {category.papers.map((paper) => (
                <Card key={paper.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <CardTitle className="text-lg font-semibold leading-tight">
                        {paper.title}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {paper.year}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      <span className="font-medium">{paper.authors}</span>
                      <br />
                      <em>{paper.journal}</em> {paper.citation}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Key Finding
                      </h4>
                      <p className="text-sm">{paper.keyFinding}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Our Application
                      </h4>
                      <p className="text-sm">{paper.application}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/research/papers/${paper.id}`}
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                      >
                        <BookOpen className="h-4 w-4" />
                        Read Full Analysis
                      </Link>
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        DOI: {paper.doi}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Academic Advantage Section */}
        <section className="bg-muted/50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6 text-center">
            The Academic Advantage
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-destructive">
                Traditional Technical Analysis
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Based on pattern recognition and trader intuition</li>
                <li>• "This pattern works because traders believe it works"</li>
                <li>• Gut-feeling confidence levels</li>
                <li>• Folklore-based trading decisions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-600">
                Research-Backed Analysis
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Based on peer-reviewed research with statistical significance</li>
                <li>• "This pattern works because of documented behavioral biases"</li>
                <li>• Calibrated confidence with ±4% confidence intervals</li>
                <li>• Evidence-based trading methodology</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-primary/5 rounded-2xl p-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            Continuous Research Integration
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Unlike black-box systems that hide behind "proprietary methods," we believe academic research 
            should be shared and built upon. Every factor in our algorithm can be traced back to 
            peer-reviewed research.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/research/methodology"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View Technical Documentation
            </Link>
            <Link
              to="/research/data-sources"
              className="inline-flex items-center gap-2 border border-input bg-background px-6 py-3 rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              See Data Sources
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearchPapers;