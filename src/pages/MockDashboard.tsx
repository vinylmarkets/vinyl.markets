import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  MessageSquare,
  Award,
  Calendar,
  ArrowRight,
  Crown,
  Target,
  Clock
} from "lucide-react";

// Mock data
const mockStats = {
  briefingsRead: 12,
  questionsAsked: 45,
  achievementsEarned: 3,
  learningStreak: 7
};

const mockRecentQueries = [
  {
    id: 1,
    question: "What's the difference between put-call parity and covered call strategies?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    answered: true
  },
  {
    id: 2,
    question: "How does unusual options activity indicate smart money moves?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    answered: true
  }
];

const mockTodaysBriefing = {
  title: "Big Money Moves in Tech Sector",
  summary: "Unusual options activity detected in major tech stocks with 73% confidence level. Smart money appears to be positioning for earnings season.",
  confidence: "High",
  readTime: "3 min read"
};

export default function MockDashboard() {
  const userTier = "free";
  const firstName = "Test User";

  return (
    <DashboardLayout>
      <div className="space-y-6">{/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to dive into today's market intelligence?
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <Badge variant="outline" className="mt-1">
              {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Briefings Read</p>
                  <p className="text-2xl font-bold">{mockStats.briefingsRead}</p>
                </div>
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Questions Asked</p>
                  <p className="text-2xl font-bold">{mockStats.questionsAsked}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Streak</p>
                  <p className="text-2xl font-bold">{mockStats.learningStreak} days</p>
                </div>
                <Target className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">{mockStats.achievementsEarned}</p>
                </div>
                <Award className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Intelligence Briefing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Today's Intelligence
                </CardTitle>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                  {mockTodaysBriefing.confidence} Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{mockTodaysBriefing.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {mockTodaysBriefing.summary}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {mockTodaysBriefing.readTime}
                </div>
                <Button size="sm">
                  Read Full Brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Ask TubeAmp Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-secondary" />
                Recent Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentQueries.map((query) => (
                  <div key={query.id} className="border-l-2 border-secondary pl-4">
                    <p className="text-sm font-medium mb-1 line-clamp-2">
                      {query.question}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {query.timestamp.toLocaleDateString()} at {query.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {query.answered && (
                        <Badge variant="outline" className="text-xs py-0">
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask New Question
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress & Upgrade */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Options Basics</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Market Analysis</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Management</span>
                    <span>40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Continue Learning
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-primary" />
                Unlock More Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Unlimited Ask TubeAmp queries
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Advanced portfolio tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  Real-time market alerts
                </li>
              </ul>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground">
                Upgrade to Essential - $29/mo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Educational Disclaimer */}
        <Card className="border-2 border-muted">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Educational Platform Notice</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  TubeAmp provides educational market analysis and research for learning purposes only. 
                  This is not investment advice, financial advice, or recommendations to buy or sell securities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}