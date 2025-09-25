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
      <div className="space-y-6">
        {/* Welcome Section */}
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

        {/* Real-time Intelligence */}
        <div className="mb-8">
          <IntelligenceBriefing />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Learning Progress */}
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

          {/* Upgrade Prompt (for free tier) */}
          {userTier === "free" && (
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
                    Unlimited Ask AtomicMarket queries
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Advanced portfolio tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Real-time market alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    Weekly deep-dive reports
                  </li>
                </ul>
                <Button size="sm" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground">
                  Upgrade to Essential - $29/mo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Briefings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Research Library
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
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