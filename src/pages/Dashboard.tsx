import { useAuth } from "@/components/auth/AuthProvider";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  User,
  Settings,
  BarChart3,
  Shield
} from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // If not authenticated, redirect to home page
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Welcome to TubeAmp Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your educational market intelligence center
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {user.user_metadata?.full_name || user.email}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Educational Account
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="font-semibold">Learning Mode</div>
                <div className="text-sm text-muted-foreground">Educational Content</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="font-semibold">Market Analysis</div>
                <div className="text-sm text-muted-foreground">Daily Intelligence</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="font-semibold">Research Access</div>
                <div className="text-sm text-muted-foreground">Academic Papers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Today's Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get your personalized market intelligence briefing
              </p>
              <Button className="w-full" variant="outline">
                View Today's Brief
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Ask TubeAmp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get answers to your market education questions
              </p>
              <Button className="w-full" variant="outline">
                Open Terminal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Research Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Explore academic research and methodology
              </p>
              <Button className="w-full" variant="outline" asChild>
                <a href="/research">Browse Research</a>
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
                  All content is for educational and informational purposes. Trading and investing involves 
                  substantial risk of loss and is not suitable for all investors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}