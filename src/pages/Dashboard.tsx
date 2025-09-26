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