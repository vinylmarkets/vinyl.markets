import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { TickerBanner } from "@/components/TickerBanner";
import { Link } from "react-router-dom";

import { 
  TrendingUp, 
  Bot, 
  Shield,
  Zap,
  BarChart3,
  Mail,
  ExternalLink
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <TickerBanner />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10 px-4">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Algorithmic Trading
              </span>
              <br />
              <span className="text-foreground">Automated</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Deploy pre-built trading algorithms (Amps) that execute automatically based on market signals
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto font-medium"
                asChild
              >
                <Link to="/trader-auth">
                  Access Trading Platform
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 h-auto font-medium"
                asChild
              >
                <a href="https://vinyl.finance" target="_blank" rel="noopener noreferrer">
                  Learn More <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Trading involves risk • For whitelisted beta users only
            </p>
          </div>
        </div>
      </section>

      {/* What Are Amps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              What Are Amps?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Amps (Algorithmic Market Participants) are pre-built trading strategies that run automatically on your behalf
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Automated Execution</h3>
                <p className="text-muted-foreground text-sm">
                  Amps monitor markets 24/7 and execute trades automatically when conditions are met
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Customizable Settings</h3>
                <p className="text-muted-foreground text-sm">
                  Adjust risk parameters, position sizes, and timing to match your trading style
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Built-in Risk Management</h3>
                <p className="text-muted-foreground text-sm">
                  Automatic stop losses, position limits, and daily loss caps protect your capital
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Trading Platform Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Monitor real-time performance, track P&L, and analyze your Amps' execution history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Capital Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Allocate capital across multiple Amps and adjust allocations as markets change.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Broker Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Connect with Alpaca for seamless execution and real-time position tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Daily Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Receive daily market analysis and performance summaries in your inbox.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the beta and get access to the Vinyl trading platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/trader-auth">Access Platform</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="https://vinyl.finance" target="_blank" rel="noopener noreferrer">
                Learn More About Vinyl <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/trader-auth" className="hover:text-foreground transition-colors">Trading Platform</Link></li>
                <li><Link to="/trader/amps" className="hover:text-foreground transition-colors">My Amps</Link></li>
                <li><Link to="/trader/performance" className="hover:text-foreground transition-colors">Performance</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://vinyl.finance" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Vinyl.finance</a></li>
                <li><Link to="/trader/help" className="hover:text-foreground transition-colors">Help & Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Risk Disclosure</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://vinyl.finance/about" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="mailto:support@vinyl.markets" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Vinyl Markets. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground text-center md:text-right max-w-2xl">
                Trading involves substantial risk and is not suitable for all investors. Past performance is not indicative of future results. 
                This platform is for authorized users only.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
