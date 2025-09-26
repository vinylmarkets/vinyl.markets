import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IntelligenceBriefing } from "@/components/intelligence-briefing";
import { 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  MessageSquare,
  Award,
  Calendar,
  ArrowRight,
  Crown,
  BarChart3,
  Target,
  Clock,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Mock data - replace with real Supabase queries
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    answered: true
  },
  {
    id: 2,
    question: "How does unusual options activity indicate smart money moves?",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    answered: true
  },
  {
    id: 3,
    question: "Can you explain the Cremers-Weinbaum methodology in simple terms?",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    answered: true
  }
];

const mockTodaysBriefing = {
  title: "Big Money Moves in Tech Sector",
  summary: "Unusual options activity detected in major tech stocks with 73% confidence level. Smart money appears to be positioning for earnings season.",
  confidence: "High",
  readTime: "3 min read",
  published: new Date()
};

export default function Dashboard() {
  console.log('Dashboard component: Starting to render');
  
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  console.log('Dashboard component: Auth state -', { user: !!user, loading });

  useEffect(() => {
    console.log('Dashboard useEffect: Checking auth redirect logic');
    if (!loading && !user) {
      // Check if we're in mock mode (Supabase not configured)
      if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
        console.log('Dashboard: Running in mock mode - allowing access');
        return; // Don't redirect in mock mode
      }
      console.log('Dashboard: User not authenticated, redirecting to home');
      window.location.href = "/";
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  if (loading) {
    console.log('Dashboard: Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user && (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co')) {
    console.log('Dashboard: Mock mode - creating mock user');
    // Mock user for development
    const mockUser = {
      id: 'mock-user',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };
  }

  if (!user) {
    console.log('Dashboard: No user and not in mock mode, returning null');
    return null;
  }

  console.log('Dashboard: About to render main content');
  
  const userTier = "free"; // Mock - get from userProfile in real app
  const userName = user?.user_metadata?.full_name || userProfile?.full_name || "Test User";
  const firstName = userName.split(' ')[0];

  console.log('Dashboard: Rendering with user data -', { userName, firstName, userTier });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to dive into today's market intelligence?
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-2">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <Badge variant="secondary" className="bg-primary-light text-primary border-primary/20">
              {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Briefings Read</p>
                  <p className="text-3xl font-bold text-foreground">{mockStats.briefingsRead}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-light">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Questions Asked</p>
                  <p className="text-3xl font-bold text-foreground">{mockStats.questionsAsked}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Learning Streak</p>
                  <p className="text-3xl font-bold text-foreground">{mockStats.learningStreak} <span className="text-lg">days</span></p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <Target className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-foreground">{mockStats.achievementsEarned}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <Award className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Intelligence */}
        <div className="mb-8">
          <IntelligenceBriefing />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Learning Progress */}
          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Options Basics</span>
                    <span className="text-success font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Market Analysis</span>
                    <span className="text-warning font-semibold">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Risk Management</span>
                    <span className="text-muted-foreground font-semibold">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-6 font-medium">
                Continue Learning
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Prompt (for free tier) */}
          {userTier === "free" && (
            <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary-light">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  Unlock More Features
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-foreground">Unlimited Ask AtomicMarket queries</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-foreground">Advanced portfolio tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-foreground">Real-time market alerts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                    <span className="text-foreground">Weekly deep-dive reports</span>
                  </li>
                </ul>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Upgrade to Essential - $29/mo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-0 shadow-fillow hover:shadow-fillow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-accent/10">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start h-10 font-medium">
                  <FileText className="mr-3 h-4 w-4" />
                  View All Briefings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-10 font-medium">
                  <BookOpen className="mr-3 h-4 w-4" />
                  Browse Research Library
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-10 font-medium">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Check Market Status
                </Button>
              </div>
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
                  AtomicMarket provides educational market analysis and research for learning purposes only. 
                  This is not investment advice, financial advice, or recommendations to buy or sell securities. 
                  All content is for educational and informational purposes. Please consult with qualified 
                  financial professionals before making investment decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}