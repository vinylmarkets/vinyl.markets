import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useForensicData } from "@/hooks/useForensicData";

export default function TimelineAnalysis() {
  const { timeline, loading } = useForensicData();

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "critical":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "high":
        return "bg-orange-500/10 border-orange-500/20 text-orange-500";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      default:
        return "bg-muted";
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
                <h1 className="text-2xl font-bold">Timeline Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  Temporal pattern detection and prediction modeling
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
                <p className="text-sm text-muted-foreground">Loading timeline data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeline.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {timeline.filter(e => e.significance === "critical").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {timeline.filter(e => e.significance === "high").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {timeline.length > 0 
                    ? Math.round(timeline.reduce((sum, e) => sum + e.confidence, 0) / timeline.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Visualization */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Timeline
              </CardTitle>
              <CardDescription>
                Key events in the BBBY/Overstock acquisition hypothesis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No timeline events found. Start by analyzing documents to build the timeline.
                </p>
              ) : (
                <div className="space-y-6">
                  {timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-6">
                    {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full border-2 ${
                          event.significance === "critical" ? "bg-red-500 border-red-500" :
                          event.significance === "high" ? "bg-orange-500 border-orange-500" :
                          "bg-yellow-500 border-yellow-500"
                        }`} />
                        {idx < timeline.length - 1 && (
                          <div className="h-full w-px bg-border mt-2" />
                        )}
                      </div>

                    {/* Event Card */}
                    <div className="flex-1 pb-6">
                      <Card className={getSignificanceColor(event.significance)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                {event.date}
                              </div>
                              <CardTitle className="text-lg">{event.event}</CardTitle>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {event.significance}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Confidence:</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all"
                                style={{ width: `${event.confidence}%` }}
                              />
                            </div>
                            <span className="font-semibold">{event.confidence}%</span>
                          </div>
                        </CardContent>
                      </Card>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Predictions removed - use only real data */}
            </>
          )}
        </div>
      </div>
    </TraderProtection>
  );
}

