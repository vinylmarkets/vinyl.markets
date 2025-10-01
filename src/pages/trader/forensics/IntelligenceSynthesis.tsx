import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useForensicData } from "@/hooks/useForensicData";

export default function IntelligenceSynthesis() {
  const { loading, getSynthesisSummary } = useForensicData();
  
  const summary = getSynthesisSummary();

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
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">Synthesizing intelligence data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
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
                  <div className="text-3xl font-bold text-green-500">{summary.avgConfidence}%</div>
                  <div className="text-sm text-muted-foreground">Overall Confidence</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-500">{summary.totalFindings}</div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-3xl font-bold text-purple-500">
                    {summary.avgConfidence >= 80 ? 'HIGH' : summary.avgConfidence >= 60 ? 'MEDIUM' : 'LOW'}
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence Rating</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Live analysis synthesized from knowledge graph, document analysis, and timeline data. 
                Confidence ratings and findings are dynamically calculated from all available intelligence sources.
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
                {summary.modules.map((module, idx) => (
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

          {/* Analysis Note */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Live Intelligence Synthesis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All findings and confidence scores are dynamically generated from your knowledge graph, 
                document analyses, and timeline data. As you add more intelligence through document 
                analysis and knowledge graph building, this synthesis will automatically update to 
                reflect new insights and correlations.
              </p>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Comprehensive analysis conclusion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Current Status</h3>
                <p className="text-sm text-muted-foreground">
                  Analysis is based on {summary.totalFindings} findings across {summary.modules.length} modules 
                  with an average confidence of {summary.avgConfidence}%. Continue building the knowledge 
                  graph and analyzing documents to strengthen the intelligence base.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Sources</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligence synthesized from: Knowledge Graph entities and relationships, Document 
                  Analysis results, Timeline event tracking, and Semantic search correlations. All data 
                  is dynamically updated as new intelligence is added.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Next Steps</h3>
                <p className="text-sm text-muted-foreground">
                  To improve analysis quality: (1) Analyze more documents related to BBBY, DK-Butterfly, 
                  and Overstock, (2) Build out knowledge graph connections, (3) Add timeline events as 
                  they occur, (4) Use semantic search to discover hidden correlations.
                </p>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </TraderProtection>
  );
}
