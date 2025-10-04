import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Star,
  Plus,
  BarChart3,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface CreatorStats {
  totalAmps: number;
  activeAmps: number;
  totalUsers: number;
  totalEarnings: number;
  totalReviews: number;
  averageRating: number;
  monthlyRevenue: number;
}

interface CreatorAmp {
  id: string;
  name: string;
  category: string | null;
  version: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  description: string | null;
  image_url: string | null;
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CreatorStats>({
    totalAmps: 0,
    activeAmps: 0,
    totalUsers: 0,
    totalEarnings: 0,
    totalReviews: 0,
    averageRating: 0,
    monthlyRevenue: 0
  });
  const [amps, setAmps] = useState<CreatorAmp[]>([]);

  useEffect(() => {
    loadCreatorData();
  }, [user]);

  const loadCreatorData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Mock data for now - creator_id doesn't exist in amp_catalog yet
      const ampsData: CreatorAmp[] = [];
      setAmps(ampsData);

      // Calculate stats
      const totalAmps = ampsData.length || 0;
      const activeAmps = totalAmps; // All amps active for now
      const totalReviews = ampsData.reduce((sum, a) => sum + (a.total_reviews || 0), 0) || 0;
      const avgRating = totalReviews > 0
        ? ampsData.reduce((sum, a) => sum + (a.average_rating || 0) * (a.total_reviews || 0), 0) / totalReviews
        : 0;

      // Get earnings data (mock for now - will be real in production)
      const totalEarnings = totalAmps * 1250; // Example
      const monthlyRevenue = activeAmps * 450; // Example

      // Mock subscriber count for now
      const totalUsers = totalAmps * 15; // Mock data

      setStats({
        totalAmps,
        activeAmps,
        totalUsers: totalUsers,
        totalEarnings,
        totalReviews,
        averageRating: avgRating,
        monthlyRevenue
      });

    } catch (error: any) {
      console.error('Error loading creator data:', error);
      toast({
        title: "Error",
        description: "Failed to load creator dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your trading algorithms and track earnings
          </p>
        </div>
        <Link to="/creator/amps/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Amp
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Total Amps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmps}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAmps} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +${stats.monthlyRevenue.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Amps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Amps</CardTitle>
        </CardHeader>
        <CardContent>
          {amps.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Amps Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first trading algorithm to start earning
              </p>
              <Link to="/creator/amps/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Amp
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {amps.map((amp) => (
                <div
                  key={amp.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{amp.name}</h3>
                      <Badge variant="outline">{amp.category || 'General'}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span>{amp.average_rating.toFixed(1)}</span>
                        <span>({amp.total_reviews} reviews)</span>
                      </div>
                      <span>v{amp.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/creator/amps/${amp.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    <Link to={`/creator/amps/${amp.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link to="/creator/earnings">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">View Earnings</h3>
                  <p className="text-sm text-muted-foreground">
                    Track revenue and payouts
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link to="/creator/analytics">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    See how your amps perform
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link to="/creator/settings">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Creator Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage profile and preferences
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
