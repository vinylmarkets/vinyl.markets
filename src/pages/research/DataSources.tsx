import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, MessageCircle, Hash, MessageSquare, Building2, TrendingUp, FileText, Shield, Search, BarChart3, Users } from "lucide-react";

const DataSources = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Data Sources: The Intelligence Behind Every Prediction
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Most trading platforms use basic price data and call it analysis. We aggregate eleven distinct data streams to build the most comprehensive picture possible of market sentiment, institutional activity, and emerging trends.
          </p>
          <p className="text-lg text-secondary mt-4 font-medium">
            Here's exactly where our intelligence comes from:
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="bg-card border border-border rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contents</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <a href="#market-data" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Real-Time Market Data
            </a>
            <a href="#social-sentiment" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Social Sentiment Intelligence
            </a>
            <a href="#options-flow" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Options Flow Intelligence
            </a>
            <a href="#news-analysis" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              News & Media Analysis
            </a>
            <a href="#emerging-sources" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Emerging Data Sources
            </a>
            <a href="#data-quality" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              Data Quality & Verification
            </a>
            <a href="#competitive-advantage" className="text-secondary hover:text-secondary/80 transition-colors hover:underline">
              The Competitive Advantage
            </a>
          </div>
        </nav>

        <hr className="border-border mb-12" />

        {/* Real-Time Market Data */}
        <section id="market-data" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Real-Time Market Data</h2>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Polygon.io - Our Primary Market Engine</h3>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Real-time stock prices</strong> across all major exchanges</p>
                <p><strong className="text-foreground">Complete options chains</strong> with live Greeks calculations</p>
                <p><strong className="text-foreground">Historical data</strong> going back 10+ years for backtesting</p>
                <p><strong className="text-foreground">Corporate actions</strong> and dividend adjustments</p>
                <p><strong className="text-foreground">After-hours and pre-market</strong> activity tracking</p>
              </div>
              
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm"><strong className="text-foreground">Why Polygon:</strong> Professional-grade data at retail-friendly pricing. The same feeds used by hedge funds, without the $50K/month Bloomberg Terminal cost.</p>
              </div>
              
              <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm"><strong className="text-foreground">Update Frequency:</strong> Sub-second for active stocks, ensuring our probability calculations reflect the most current market conditions.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <hr className="border-border mb-12" />

        {/* Social Sentiment Intelligence */}
        <section id="social-sentiment" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Social Sentiment Intelligence</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-foreground">Reddit API Integration</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Subreddits monitored:</strong> r/wallstreetbets, r/investing, r/stocks, r/SecurityAnalysis, r/ValueInvesting</p>
                  <p><strong className="text-foreground">Real-time mention tracking</strong> with sentiment scoring</p>
                  <p><strong className="text-foreground">Viral coefficient calculation</strong> to detect accelerating buzz</p>
                  <p><strong className="text-foreground">Quality filtering</strong> based on upvotes, comments, and account credibility</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-foreground">Twitter/X Financial Intelligence</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">FinTwit monitoring:</strong> 500+ verified financial accounts</p>
                  <p><strong className="text-foreground">Hashtag tracking:</strong> $TICKER mentions and financial keywords</p>
                  <p><strong className="text-foreground">Influence weighting:</strong> Follower count and engagement metrics</p>
                  <p><strong className="text-foreground">Bot detection:</strong> Filtering out artificial sentiment manipulation</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-foreground">Discord Communities</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Trading server monitoring</strong> (public channels only)</p>
                  <p><strong className="text-foreground">Real-time chat analysis</strong> for emerging trends</p>
                  <p><strong className="text-foreground">Community sentiment shifts</strong> before they hit mainstream platforms</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
            <p className="text-sm"><strong className="text-foreground">Data Processing:</strong> Custom NLP models trained on financial language to distinguish between genuine sentiment and noise.</p>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Options Flow Intelligence */}
        <section id="options-flow" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Options Flow Intelligence</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-foreground">Unusual Options Activity Detection</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Volume anomalies:</strong> Trades 3x+ above 20-day average</p>
                  <p><strong className="text-foreground">Dark pool estimates:</strong> Large block trades and institutional activity</p>
                  <p><strong className="text-foreground">Put/call ratio analysis</strong> across timeframes</p>
                  <p><strong className="text-foreground">Gamma exposure calculations</strong> for dealer positioning</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-foreground">Smart Money Tracking</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Sweep detection:</strong> Large orders split across exchanges</p>
                  <p><strong className="text-foreground">Opening vs. closing</strong> position identification</p>
                  <p><strong className="text-foreground">Time and sales analysis</strong> for institutional footprints</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm"><strong className="text-foreground">Why This Matters:</strong> Options activity often predicts stock movements. When someone risks $2M on Apple calls, that's usually based on information, not hope.</p>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* News & Media Analysis */}
        <section id="news-analysis" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">News & Media Analysis</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-foreground">Bloomberg Terminal Integration</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Breaking news alerts</strong> with millisecond timestamps</p>
                  <p><strong className="text-foreground">Analyst upgrades/downgrades</strong> in real-time</p>
                  <p><strong className="text-foreground">Economic indicators</strong> and Federal Reserve communications</p>
                  <p><strong className="text-foreground">Earnings announcements</strong> and guidance changes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-foreground">Earnings Intelligence Pipeline</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-700" />
                      <h4 className="font-medium text-foreground">SEC EDGAR Database APIs:</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">10-K/10-Q filings</strong> automatically parsed for key metrics</p>
                      <p><strong className="text-foreground">8-K current reports</strong> for material events</p>
                      <p><strong className="text-foreground">Insider trading reports</strong> (Forms 3, 4, and 5)</p>
                      <p><strong className="text-foreground">Proxy statements</strong> for executive compensation changes</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-foreground">Earnings Call Transcripts:</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">FactSet CallStreet</strong> integration for real-time transcripts</p>
                      <p><strong className="text-foreground">Seeking Alpha earnings call</strong> API for historical data</p>
                      <p><strong className="text-foreground">AI sentiment analysis</strong> of management tone and language</p>
                      <p><strong className="text-foreground">Key phrase detection</strong> for guidance changes and risk factors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Emerging Data Sources */}
        <section id="emerging-sources" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Emerging Data Sources (In Development)</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-foreground">Patent Intelligence</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Real-time patent applications</strong> by public companies</p>
                  <p><strong className="text-foreground">Patent approval notifications</strong> indicating R&D success</p>
                  <p><strong className="text-foreground">Patent citation analysis</strong> for innovation indicators</p>
                  <p><strong className="text-foreground">Competitive landscape mapping</strong> through patent clustering</p>
                </div>
                <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded">
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">Implementation:</strong> Weekly scans of patent databases, with AI classification of patent significance and competitive implications.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-foreground">Legal Filing Monitoring</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Federal court filings</strong> involving public companies</p>
                  <p><strong className="text-foreground">Class action lawsuit monitoring</strong> for risk assessment</p>
                  <p><strong className="text-foreground">Regulatory enforcement actions</strong> by SEC, FTC, DOJ</p>
                  <p><strong className="text-foreground">Merger and acquisition</strong> filing detection</p>
                </div>
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded">
                  <p className="text-xs text-foreground"><strong>Use Case Example:</strong> Patent approval for breakthrough battery technology could predict Tesla stock movement weeks before public awareness.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Data Quality & Verification */}
        <section id="data-quality" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Data Quality & Verification</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Source Validation</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Cross-reference verification</strong> across data providers</p>
                  <p><strong className="text-foreground">Anomaly detection</strong> to identify data errors</p>
                  <p><strong className="text-foreground">Latency monitoring</strong> to ensure real-time accuracy</p>
                  <p><strong className="text-foreground">Backup data sources</strong> for redundancy</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Error Handling</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Automatic failover</strong> to secondary providers</p>
                  <p><strong className="text-foreground">Data gap detection</strong> and interpolation</p>
                  <p><strong className="text-foreground">Quality scoring</strong> for each data source</p>
                  <p><strong className="text-foreground">User alerts</strong> when data confidence drops</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance & Licensing</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Proper attribution</strong> to all data providers</p>
                  <p><strong className="text-foreground">API rate limit management</strong> to maintain access</p>
                  <p><strong className="text-foreground">Terms of service compliance</strong> across all sources</p>
                  <p><strong className="text-foreground">Data retention policies</strong> in line with regulations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Competitive Advantage */}
        <section id="competitive-advantage" className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">The Competitive Advantage</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-destructive/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-destructive mb-4">What Most Platforms Use</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Basic price and volume data</p>
                  <p>Simple technical indicators</p>
                  <p>Delayed or limited options data</p>
                  <p>Generic news feeds</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">What AtomicMarket Aggregates</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>11 distinct real-time data streams</p>
                  <p>Social sentiment with viral detection</p>
                  <p>Institutional options flow analysis</p>
                  <p>Legal and regulatory intelligence</p>
                  <p>Patent and innovation tracking</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">The Result:</h3>
            <p className="text-muted-foreground">Information asymmetry that actually favors retail traders for once. When our algorithm detects unusual options activity, social sentiment spikes, and patent filings all pointing in the same direction, that's when probability becomes prediction.</p>
          </div>
        </section>

        <hr className="border-border mb-12" />

        {/* Data Transparency Commitment */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-8">Data Transparency Commitment</h2>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                Unlike black-box platforms that hide their sources, we believe you should know exactly what information drives our analysis.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Real-Time Data Dashboard</h4>
                  <p className="text-muted-foreground">Track the health and availability of all our data sources</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Source Attribution</h4>
                  <p className="text-muted-foreground">Every prediction shows which data sources contributed</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Methodology Updates</h4>
                  <p className="text-muted-foreground">When we add new data sources, we explain why and how they improve accuracy</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground"><strong>Current Data Costs:</strong> We invest over $8,000/month in premium data sources so you don't have to.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-serif text-foreground mb-6">Coming Soon: Advanced Intelligence</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Satellite Data Integration</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Parking lot analysis for retail earnings predictions</p>
                  <p>Oil storage monitoring for energy sector insights</p>
                  <p>Agricultural yield estimates for commodity-related stocks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Supply Chain Intelligence</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Shipping manifest analysis for demand prediction</p>
                  <p>Port activity monitoring for logistics insights</p>
                  <p>Manufacturing capacity tracking for production forecasts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Social Media Expansion</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>TikTok financial content monitoring</p>
                  <p>LinkedIn professional sentiment tracking</p>
                  <p>YouTube creator influence analysis</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mb-8">
            <p className="text-lg text-foreground mb-4">
              <strong>The Bottom Line:</strong> While other platforms guess based on charts, we know based on data. Every data source serves a specific purpose in building the most complete picture possible of market sentiment, institutional activity, and emerging trends.
            </p>
            <p className="text-secondary font-medium">
              When you see a 73% probability from AtomicMarket, it's backed by intelligence streams that most retail traders never see.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button size="lg">View Live Data Status</Button>
            <Button variant="outline" size="lg">See Source Attribution</Button>
            <Button variant="secondary" size="lg">Learn About Our Methodology</Button>
          </div>

          {/* Disclaimer */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            *Data sources subject to change based on availability and regulatory requirements. We maintain relationships with multiple providers to ensure continuity of service.
          </div>
        </section>
      </main>
    </div>
  );
};

export default DataSources;