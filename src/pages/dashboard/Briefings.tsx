import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, TrendingUp } from "lucide-react";

const mockBriefings = [
  {
    id: 1,
    title: "Market Analysis: Tech Sector Rally",
    summary: "Technology stocks show strong momentum with AI companies leading gains...",
    category: "Market Update",
    readTime: "3 min",
    timestamp: "2 hours ago",
    priority: "high"
  },
  {
    id: 2,
    title: "Economic Indicators: Fed Policy Impact",
    summary: "Recent Federal Reserve decisions affecting market sentiment and sector rotation...",
    category: "Economic Analysis", 
    readTime: "5 min",
    timestamp: "4 hours ago",
    priority: "medium"
  },
  {
    id: 3,
    title: "Sector Spotlight: Healthcare Innovation",
    summary: "Breakthrough developments in biotech driving healthcare sector performance...",
    category: "Sector Analysis",
    readTime: "4 min", 
    timestamp: "6 hours ago",
    priority: "low"
  }
];

export default function Briefings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Intelligence Briefings</h1>
            <p className="text-muted-foreground">Stay updated with market insights and analysis</p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate New Briefing
          </Button>
        </div>

        <div className="grid gap-4">
          {mockBriefings.map((briefing) => (
            <Card key={briefing.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{briefing.title}</CardTitle>
                    <p className="text-muted-foreground">{briefing.summary}</p>
                  </div>
                  <Badge 
                    variant={briefing.priority === 'high' ? 'destructive' : briefing.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    {briefing.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {briefing.readTime}
                    </div>
                    <span>{briefing.timestamp}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Read Full Briefing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}