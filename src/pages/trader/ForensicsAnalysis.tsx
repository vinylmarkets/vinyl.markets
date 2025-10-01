import { Link } from "react-router-dom";
import { ArrowLeft, Brain, FileText, Network, TrendingUp, Search, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TraderProtection } from "@/components/trader/TraderProtection";

export default function ForensicsAnalysis() {
  const analysisModules = [
    {
      title: "Working Theory",
      description: "Track the BBBY/Overstock/DK-Butterfly acquisition hypothesis",
      icon: Lightbulb,
      href: "/trader/forensics/theory",
      progress: 75,
      status: "Active Investigation"
    },
    {
      title: "Document Analysis",
      description: "AI-powered analysis of SEC filings, bankruptcy documents, and legal filings",
      icon: FileText,
      href: "/trader/forensics/documents",
      progress: 60,
      status: "Analyzing"
    },
    {
      title: "Knowledge Graph",
      description: "Network visualization of entities, relationships, and patterns",
      icon: Network,
      href: "/trader/forensics/knowledge-graph",
      progress: 85,
      status: "Connected"
    },
    {
      title: "Timeline Analysis",
      description: "Temporal pattern detection and prediction modeling",
      icon: TrendingUp,
      href: "/trader/forensics/timeline",
      progress: 50,
      status: "Modeling"
    },
    {
      title: "Semantic Search",
      description: "Vector-based search across all collected intelligence",
      icon: Search,
      href: "/trader/forensics/search",
      progress: 90,
      status: "Ready"
    },
    {
      title: "Intelligence Synthesis",
      description: "Combined insights from all analysis modules",
      icon: Brain,
      href: "/trader/forensics/synthesis",
      progress: 70,
      status: "Synthesizing"
    }
  ];

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/trader">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Trader
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">BBBY Forensic Analysis</h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI-powered investigation platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Executive Summary */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Core Hypothesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                <strong>Working Theory:</strong> Overstock is acquiring BBBY's intellectual property and NOLs 
                through the DK-Butterfly bankruptcy entity, with timing carefully orchestrated to preserve 
                billions in tax benefits under Section 382's 2-year rule.
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Analysis Progress:</span>
                  <span className="ml-2 font-semibold text-primary">70%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence Level:</span>
                  <span className="ml-2 font-semibold text-green-500">High</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2 font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} to={module.href}>
                  <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {module.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link to="/trader/forensics/documents">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </Link>
                <Link to="/trader/forensics/search">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Run Query
                  </Button>
                </Link>
                <Link to="/trader/forensics/synthesis">
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Link>
                <Link to="/trader/forensics/knowledge-graph">
                  <Button variant="outline" size="sm">
                    <Network className="h-4 w-4 mr-2" />
                    View Connections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
}
