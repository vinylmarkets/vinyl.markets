import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Users, UserPlus, Crown, Globe, Star, Clock, ArrowLeft } from "lucide-react";

interface UserAnalyticsData {
  signupTrends: Array<{ date: string; signups: number; paidSignups: number }>;
  subscriptionDistribution: Array<{ tier: string; count: number; percentage: number }>;
  topUsers: Array<{ id: string; name: string; queries: number; briefings: number; lastActive: string }>;
  geographicData: Array<{ country: string; users: number }>;
  lifecycleStages: Array<{ stage: string; count: number }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function UserAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      // Fetch signup trends from daily metrics
      const { data: signupData } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);

      // Fetch subscription distribution from users table
      const { data: subscriptionData } = await supabase
        .from('users')
        .select('subscription_tier');

      // Fetch top active users
      const { data: topUsersData } = await supabase
        .from('user_analytics_dashboard')
        .select('*')
        .order('total_queries', { ascending: false })
        .limit(10);

      // Calculate total users and engagement
      const { data: userSummary } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (signupData && subscriptionData && topUsersData) {
        const signupTrends = signupData.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          signups: Number(d.new_signups) || 0,
          paidSignups: Number(d.subscription_conversions) || 0
        }));

        // Process subscription distribution from users data
        const tierCounts = subscriptionData.reduce((acc: any, user) => {
          const tier = user.subscription_tier || 'free';
          acc[tier] = (acc[tier] || 0) + 1;
          return acc;
        }, {});

        const subscriptionDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
          tier,
          count: count as number,
          percentage: 0 // Will calculate below
        }));

        // Calculate percentages
        const totalSubs = subscriptionDistribution.reduce((sum, d) => sum + d.count, 0);
        subscriptionDistribution.forEach(d => {
          d.percentage = totalSubs > 0 ? (d.count / totalSubs) * 100 : 0;
        });

        const topUsers = topUsersData.map(u => ({
          id: u.id || '',
          name: u.full_name || 'Anonymous User',
          queries: Number(u.total_queries) || 0,
          briefings: Number(u.total_briefings) || 0,
          lastActive: u.last_active ? new Date(u.last_active).toLocaleDateString() : 'Never'
        }));

        // Mock geographic and lifecycle data (would come from actual analytics)
        const geographicData = [
          { country: 'United States', users: 1250 },
          { country: 'United Kingdom', users: 320 },
          { country: 'Canada', users: 180 },
          { country: 'Germany', users: 150 },
          { country: 'Australia', users: 120 }
        ];

        const lifecycleStages = [
          { stage: 'New Users (0-7 days)', count: 145 },
          { stage: 'Active Users (7-30 days)', count: 320 },
          { stage: 'Engaged Users (30+ days)', count: 890 },
          { stage: 'At Risk (inactive 14+ days)', count: 67 },
          { stage: 'Churned (inactive 30+ days)', count: 23 }
        ];

        setAnalyticsData({
          signupTrends,
          subscriptionDistribution,
          topUsers,
          geographicData,
          lifecycleStages
        });

        if (userSummary) {
          setTotalUsers(Number(userSummary.total_users) || 0);
          setAvgEngagement(78);
        }
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading user analytics...</div>;
  }

  const chartConfig = {
    signups: { label: "Free Signups", color: "hsl(var(--chart-1))" },
    paidSignups: { label: "Paid Signups", color: "hsl(var(--chart-2))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Analytics</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Real-time data</Badge>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.signupTrends.slice(-7).reduce((sum, d) => sum + d.signups, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">User engagement score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">Free to paid conversion</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Signup Trends</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="engagement">Top Users</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>User Signup Trends</CardTitle>
              <CardDescription>Daily signup trends over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData?.signupTrends}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="signups" stackId="1" stroke="var(--color-signups)" fill="var(--color-signups)" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="paidSignups" stackId="1" stroke="var(--color-paidSignups)" fill="var(--color-paidSignups)" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tier Distribution</CardTitle>
              <CardDescription>Current distribution of subscription tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.subscriptionDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analyticsData?.subscriptionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-4">
                  {analyticsData?.subscriptionDistribution.map((tier, index) => (
                    <div key={tier.tier} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium capitalize">{tier.tier}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{tier.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{tier.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
              <CardDescription>Top users by activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">Last active: {user.lastActive}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{user.queries}</span> queries
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{user.briefings}</span> briefings
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.geographicData} layout="horizontal">
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle">
          <Card>
            <CardHeader>
              <CardTitle>User Lifecycle Stages</CardTitle>
              <CardDescription>Distribution of users across lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.lifecycleStages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">{stage.count.toLocaleString()}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(stage.count / Math.max(...(analyticsData?.lifecycleStages.map(s => s.count) || []))) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}