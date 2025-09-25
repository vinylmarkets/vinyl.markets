import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { 
  TrendingUp, 
  BookOpen, 
  Eye, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Shield
} from "lucide-react";

export default function Index() {
  console.log('Index component is rendering');
  
  const [toggleState, setToggleState] = useState<'academic' | 'plain'>('plain');

  console.log('Index component state initialized');

  const sampleBriefing = {
    academic: {
      title: "Market Microstructure Analysis: Options Flow Asymmetry",
      content: "Today's options flow exhibits significant put/call ratio deviations (1.2x above 30-day mean) concentrated in financials sector. Utilizing Pan & Poteshman (2006) methodology, unusual options activity suggests informed trading preceding earnings announcements. The Cremers-Weinbaum (2010) deviations-from-put-call-parity framework indicates potential price discovery inefficiencies in XLF constituents.",
      confidence: "Based on 5 peer-reviewed studies, 12 data sources"
    },
    plain: {
      title: "Big Money is Betting Against Banks",
      content: "Unusual options activity shows smart money buying protective puts in banking stocks - 20% more than usual. This often happens before big news or earnings. When professional traders make these moves, it sometimes signals they expect prices to drop. We're seeing this pattern in major bank stocks like JPM and BAC.",
      confidence: "Based on proven research methods, explained in simple terms"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Transform Market Noise Into Educational Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Get daily market analysis with complete transparency - no black box algorithms
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Start Learning Free
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Educational content only
          </p>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Academic & Plain Speak</h3>
              <p className="text-muted-foreground text-sm">
                Choose your explanation style - from peer-reviewed research to everyday language
              </p>
            </div>
            
            <div className="text-center">
              <Eye className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Complete Transparency</h3>
              <p className="text-muted-foreground text-sm">
                See exactly how we reach every conclusion - methodology fully exposed
              </p>
            </div>
            
            <div className="text-center">
              <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Educational Focus</h3>
              <p className="text-muted-foreground text-sm">
                Learn market analysis - this is education, not investment advice
              </p>
            </div>
            
            <div className="text-center">
              <Terminal className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Ask AtomicMarket</h3>
              <p className="text-muted-foreground text-sm">
                Interactive terminal for personalized market education and analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Intelligence Briefing */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Daily Intelligence Briefing
            </h2>
            <p className="text-muted-foreground">
              See how we transform complex market data into clear, educational insights
            </p>
          </div>

          {/* Toggle Controls */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-lg p-1 flex">
              <Button
                variant={toggleState === 'plain' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setToggleState('plain')}
                className="rounded-md"
              >
                Plain Speak
              </Button>
              <Button
                variant={toggleState === 'academic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setToggleState('academic')}
                className="rounded-md"
              >
                Academic
              </Button>
            </div>
          </div>

          {/* Sample Content */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-serif">
                    {sampleBriefing[toggleState].title}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    Today's Market Intelligence
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">High Confidence</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4 leading-relaxed">
                {sampleBriefing[toggleState].content}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                {sampleBriefing[toggleState].confidence}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-muted-foreground">
              All plans focused on education and transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <p className="text-muted-foreground text-sm">Perfect for getting started</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Daily market briefing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Academic/Plain speak toggle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Research methodology access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">5 Ask AtomicMarket queries/day</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Essential Plan */}
            <Card className="relative border-2 border-secondary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-secondary text-secondary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Essential</CardTitle>
                <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground text-sm">For serious market students</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Sector-specific analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Options flow intelligence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">100 Ask AtomicMarket queries/day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Weekly deep-dive reports</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Start Essential
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2">
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="text-3xl font-bold">$79<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground text-sm">For advanced researchers</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Everything in Essential</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Real-time alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Custom research requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Unlimited AtomicMarket</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">API access for researchers</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Start Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Built for Market Education
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-secondary mb-2" />
                <CardTitle className="text-lg">Real-Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Live market data transformed into educational insights with full methodology transparency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-secondary mb-2" />
                <CardTitle className="text-lg">Research Archive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Access our complete library of academic research and methodology explanations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-secondary mb-2" />
                <CardTitle className="text-lg">Community Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Join discussions with fellow market students and contribute to research validation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/research" className="hover:text-foreground transition-colors">Research</a></li>
                <li><a href="/research/methodology" className="hover:text-foreground transition-colors">Methodology</a></li>
                <li><a href="/research/data-sources" className="hover:text-foreground transition-colors">Data Sources</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Disclaimers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          {/* Compliance Disclaimers */}
          <div className="space-y-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p>
                <strong>Educational Content Only:</strong> AtomicMarket provides educational market analysis and research. This is not investment advice, financial advice, or recommendations to buy or sell securities. All content is for educational and informational purposes only.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p>
                <strong>Risk Disclosure:</strong> Trading and investing involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. You should carefully consider your financial situation and consult with financial professionals before making investment decisions.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p>
                <strong>No Financial Services:</strong> AtomicMarket is not a registered investment advisor, broker-dealer, or financial services provider. We do not provide personalized investment advice or manage assets. Our platform is designed for educational purposes and market research transparency.
              </p>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AtomicMarket. All rights reserved. Built for market education and research transparency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
