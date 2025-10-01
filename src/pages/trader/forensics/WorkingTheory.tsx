import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useForensicData } from "@/hooks/useForensicData";

export default function WorkingTheory() {
  const { evidence, loading } = useForensicData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "strong":
        return "text-blue-500";
      case "investigating":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "strong":
        return TrendingUp;
      case "investigating":
        return Circle;
      default:
        return AlertCircle;
    }
  };

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/trader/forensics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forensics
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Working Theory</h1>
                <p className="text-sm text-muted-foreground">
                  BBBY/Overstock/DK-Butterfly Acquisition Hypothesis
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">Loading forensic data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Hypothesis */}
              <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Core Hypothesis</CardTitle>
              <CardDescription>
                Strategic acquisition structure designed to preserve maximum tax benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Overstock is acquiring BBBY's intellectual property and NOLs through the DK-Butterfly 
                bankruptcy entity, with the timing carefully orchestrated to preserve billions in tax 
                benefits under Section 382's 2-year rule.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500">
                    {evidence.length > 0 
                      ? Math.round(evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Confidence</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-500">{evidence.length}</div>
                  <div className="text-sm text-muted-foreground">Evidence Categories</div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-500">
                    {evidence.reduce((sum, e) => sum + e.items.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Findings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {evidence.length === 0 ? (
              <Card className="lg:col-span-2">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No evidence data available. Start by analyzing documents or building the knowledge graph.
                </CardContent>
              </Card>
            ) : (
              evidence.map((category, idx) => {
              const StatusIcon = getStatusIcon(category.status);
              return (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(category.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {category.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-semibold">{category.confidence}%</span>
                      </div>
                      <Progress value={category.confidence} className="h-2" />
                    </div>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            }))}
          </div>

          {/* Key Milestones */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Critical Timeline Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div className="h-full w-px bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="font-semibold">April 2023</div>
                    <div className="text-sm text-muted-foreground">BBBY Bankruptcy Filing</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div className="h-full w-px bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="font-semibold">Mid-2023 to 2024</div>
                    <div className="text-sm text-muted-foreground">DK-Butterfly Entity Formation & Activity</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-full w-px bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="font-semibold">April 2025 (Projected)</div>
                    <div className="text-sm text-muted-foreground">Two-Year Section 382 Window Closes</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">TBD</div>
                    <div className="text-sm text-muted-foreground">Expected Acquisition Announcement</div>
                  </div>
                </div>
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
