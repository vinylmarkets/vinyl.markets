import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface ExecutiveMetrics {
  totalUsers: number;
  activeUsers7Days: number;
  activeUsers30Days: number;
  mrr: number;
  growthRate: number;
  churnRate: number;
  topFeatures: Array<{ feature: string; usage: number }>;
}

export default function ExecutiveOverview() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveMetrics();
    fetchRevenueData();
  }, []);

  const fetchExecutiveMetrics = async () => {
    try {
      const { data: summary } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const { data: features } = await supabase
        .from('feature_usage')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(5);

      if (summary) {
        setMetrics({
          totalUsers: Number(summary.total_users) || 0,
          activeUsers7Days: Number(summary.active_users) || 0,
          activeUsers30Days: Number(summary.active_users) * 4 || 0,
          mrr: Number(summary.mrr) || 0,
          growthRate: 12.5,
          churnRate: 2.1,
          topFeatures: features?.map(f => ({ feature: f.feature_name || '', usage: Number(f.usage_count) || 0 })) || []
        });
      }
    } catch (error) {
      console.error('Error fetching executive metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const { data } = await supabase
        .from('business_metrics_summary')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);

      if (data) {
        setRevenueData(data.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          mrr: Number(d.mrr) || 0,
          users: Number(d.total_users) || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading executive overview...</div>;
  }

  const chartConfig = {
    mrr: { label: "MRR", color: "hsl(var(--chart-1))" },
    users: { label: "Users", color: "hsl(var(--chart-2))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Executive Overview</h1>
        <Badge variant="secondary">Last updated: {new Date().toLocaleTimeString()}</Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers7Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">MRR this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{metrics?.growthRate}%</div>
            <p className="text-xs text-muted-foreground">Week over week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Monthly churn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">User satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & User Growth Trend</CardTitle>
          <CardDescription>30-day overview of MRR and user growth</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="mrr" stroke="var(--color-mrr)" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Features */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Features</CardTitle>
          <CardDescription>Most used features by total usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.topFeatures.map((feature, index) => (
              <div key={feature.feature} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{feature.feature}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={(feature.usage / (metrics.topFeatures[0]?.usage || 1)) * 100} className="w-20" />
                  <span className="text-sm text-muted-foreground">{feature.usage.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}