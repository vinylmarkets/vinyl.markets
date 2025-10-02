import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PaperTradingLeaderboard } from "@/components/dashboard/PaperTradingLeaderboard";
import { FollowedStocks } from "@/components/dashboard/FollowedStocks";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  console.log('Dashboard component: Starting to render');
  
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [contentReady, setContentReady] = useState(false);

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

  // Set content ready after all auth and profile loading is complete
  useEffect(() => {
    if (!loading && (user || (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'))) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setContentReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

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
      <div className={`space-y-8 p-6 transition-all duration-500 ${contentReady ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
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

        {/* Dashboard Widgets Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all duration-700 ${contentReady ? 'opacity-100 animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
          <FollowedStocks />
          <div className="flex justify-end">
            <div className="w-full max-w-md">
              <PaperTradingLeaderboard />
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <Card className={`border-2 border-muted transition-all duration-700 ${contentReady ? 'opacity-100 animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '450ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Trading Risk Notice</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trading involves substantial risk of loss and is not suitable for all investors. 
                  Past performance is not indicative of future results. You should carefully consider 
                  whether trading is suitable for you in light of your experience, objectives, financial 
                  resources and other relevant circumstances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}