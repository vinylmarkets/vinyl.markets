import { Link } from "react-router-dom";
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TraderProtection } from "@/components/trader/TraderProtection";

export default function IntelligenceSynthesis() {
  const synthesisModules = [
    {
      name: "Document Analysis",
      status: "complete",
      confidence: 85,
      findings: 24
    },
    {
      name: "Timeline Patterns",
      status: "complete",
      confidence: 90,
      findings: 12
    },
    {
      name: "Entity Relationships",
      status: "processing",
      confidence: 78,
      findings: 18
    },
    {
      name: "Market Behavior",
      status: "complete",
      confidence: 72,
      findings: 15
    }
  ];

  const keyFindings = [
    {
      category: "Strong Evidence",
      icon: CheckCircle,
      color: "text-green-500",
      items: [
        "Timeline aligns perfectly with Section 382 two-year window",
        "DK-Butterfly entity structure matches typical NOL preservation patterns",
        "Multiple independent sources corroborate acquisition interest"
      ]
    },
    {
      category: "Areas of Uncertainty",
      icon: AlertTriangle,
      color: "text-yellow-500",
      items: [
        "Exact valuation of NOLs subject to interpretation",
        "Alternative acquisition structures remain possible",
        "Market conditions may impact timing decisions"
      ]
    },
    {
      category: "Critical Factors",
      icon: TrendingUp,
      color: "text-blue-500",
      items: [
        "Approaching deadline creates urgency for decision",
        "Overstock's public statements suggest strategic intent",
        "Legal precedents support NOL preservation strategy"
      ]
    }
  ];

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/trader/forensics">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Forensics
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Intelligence Synthesis</h1>
                  <p className="text-sm text-muted-foreground">
                    Combined insights from all analysis modules
                  </p>
                </div>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Overall Assessment */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Overall Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-500">85%</div>
                  <div className="text-sm text-muted-foreground">Overall Confidence</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-500">69</div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-3xl font-bold text-purple-500">HIGH</div>
                  <div className="text-sm text-muted-foreground">Probability Rating</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Based on comprehensive analysis across multiple intelligence sources, the hypothesis that 
                Overstock is acquiring BBBY's assets through DK-Butterfly shows strong supporting evidence. 
                Timeline alignment with Section 382 requirements, entity structure patterns, and market 
                behavior all corroborate the core thesis.
              </p>
            </CardContent>
          </Card>

          {/* Module Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Analysis Module Status</CardTitle>
              <CardDescription>Current state of all forensic analysis components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {synthesisModules.map((module, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{module.name}</span>
                        <Badge 
                          variant={module.status === "complete" ? "default" : "secondary"}
                        >
                          {module.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {module.findings} findings · {module.confidence}% confidence
                      </div>
                    </div>
                    <Progress value={module.confidence} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {keyFindings.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className={`h-5 w-5 ${section.color}`} />
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Comprehensive analysis conclusion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Hypothesis Validation</h3>
                <p className="text-sm text-muted-foreground">
                  The evidence strongly supports the hypothesis that Overstock is positioning to acquire 
                  BBBY's intellectual property and NOLs through the DK-Butterfly bankruptcy entity. The 
                  timing alignment with Section 382's two-year rule is particularly compelling, as the 
                  April 2025 deadline creates a specific window for optimal NOL preservation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Risk Factors</h3>
                <p className="text-sm text-muted-foreground">
                  Primary risks include alternative bidders emerging, regulatory challenges to the 
                  acquisition structure, or changes in Overstock's strategic priorities. Market conditions 
                  and valuation disputes could also impact the transaction timeline.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recommended Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Continue monitoring SEC filings, bankruptcy court proceedings, and public statements 
                  from both parties. Track timeline closely as April 2025 deadline approaches. Maintain 
                  vigilance for any alternative acquisition structures or competing bids.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
}
