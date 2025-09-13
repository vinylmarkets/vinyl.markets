import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Database, BarChart3, FileText, TrendingUp, Users } from "lucide-react";

const ResearchIndex = () => {
  const researchSections = [
    {
      title: "Methodology",
      href: "/research/methodology",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Deep dive into our algorithmic approach, factor analysis, and prediction framework",
      badge: "Core Framework",
      highlights: ["Bayesian probability models", "Multi-factor analysis", "Real-time calibration"]
    },
    {
      title: "Data Sources",
      href: "/research/data-sources", 
      icon: <Database className="h-6 w-6" />,
      description: "Comprehensive overview of our 11 institutional-grade data streams and validation processes",
      badge: "Data Intelligence",
      highlights: ["Real-time market data", "Social sentiment analysis", "Options flow tracking"]
    },
    {
      title: "Research Papers",
      href: "/research/papers",
      icon: <FileText className="h-6 w-6" />,
      description: "Academic foundation behind our algorithms with peer-reviewed research citations",
      badge: "Academic Foundation", 
      highlights: ["50+ cited papers", "Behavioral finance studies", "Statistical validation"]
    },
    {
      title: "Algorithm Weights",
      href: "/research/algorithm-weights",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Detailed breakdown of how we score and weight different prediction factors",
      badge: "Coming Soon",
      highlights: ["Factor importance", "Dynamic weighting", "Performance attribution"]
    },
    {
      title: "Backtesting Results", 
      href: "/research/backtesting",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Historical performance analysis and accuracy metrics across different market conditions",
      badge: "Coming Soon",
      highlights: ["5-year backtest", "Market regime analysis", "Risk-adjusted returns"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Research & Methodology
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transparent, Academic-Backed Analysis
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Every prediction from Tubeamp is grounded in peer-reviewed research and institutional-grade data. 
            Unlike black-box trading platforms, we believe you should understand exactly how our analysis works 
            and what drives our probability assessments.
          </p>
        </div>

        {/* Research Philosophy */}
        <section className="mb-16 bg-muted/50 rounded-2xl p-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6 text-center">
            Our Research Philosophy
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Academic Rigor</h3>
              <p className="text-muted-foreground">
                Every factor in our algorithm traces back to peer-reviewed financial research with 
                documented statistical significance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Transparency</h3>
              <p className="text-muted-foreground">
                We disclose all data sources, update frequencies, and quality metrics so you know 
                exactly what drives our predictions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Continuous Validation</h3>
              <p className="text-muted-foreground">
                Real-time calibration tracking ensures our probability predictions match actual outcomes 
                over time.
              </p>
            </div>
          </div>
        </section>

        {/* Research Sections */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            Explore Our Research
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchSections.map((section, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {section.icon}
                    </div>
                    <Badge variant={section.badge === "Coming Soon" ? "outline" : "default"}>
                      {section.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">
                    {section.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-sm text-muted-foreground">Key Features:</h4>
                    <ul className="space-y-1">
                      {section.highlights.map((highlight, highlightIndex) => (
                        <li key={highlightIndex} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    to={section.href}
                    className={`inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      section.badge === "Coming Soon" 
                        ? "bg-muted text-muted-foreground cursor-not-allowed" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    onClick={section.badge === "Coming Soon" ? (e) => e.preventDefault() : undefined}
                  >
                    {section.badge === "Coming Soon" ? "Coming Soon" : "Explore Research"}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            Research by the Numbers
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Academic Papers Cited</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">11</div>
                <p className="text-sm text-muted-foreground">Real-Time Data Sources</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">$8K+</div>
                <p className="text-sm text-muted-foreground">Monthly Data Investment</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Continuous Calibration</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Start */}
        <section className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            New to Our Research?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start with our methodology overview to understand our core approach, then explore 
            our data sources to see what drives our analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/research/methodology"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Start with Methodology
            </Link>
            <Link
              to="/research/data-sources"
              className="inline-flex items-center gap-2 border border-input bg-background px-6 py-3 rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Database className="h-4 w-4" />
              Explore Data Sources
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResearchIndex;