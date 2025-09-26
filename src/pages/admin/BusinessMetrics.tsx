import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LineChart, Line, BarChart, Bar, ComposedChart } from "recharts";
import { DollarSign, Users, TrendingUp, Target, HeadphonesIcon, Zap, ArrowLeft } from "lucide-react";

interface BusinessMetricsData {
  revenueData: Array<{ date: string; revenue: number; projection: number }>;
  customerMetrics: { cac: number; ltv: number; ratio: number };
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>;
  supportMetrics: { tickets: number; avgResolution: number; satisfaction: number };
  systemPerformance: Array<{ metric: string; value: number; target: number; status: string }>;
  growthMetrics: Array<{ month: string; mrr: number; churn: number; growth: number }>;
}

export default function BusinessMetrics() {
  const [businessData, setBusinessData] = useState<BusinessMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMRR, setCurrentMRR] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    fetchBusinessMetrics();
  }, []);

  const fetchBusinessMetrics = async () => {
    try {
      // Fetch business metrics from multiple sources
      const { data: businessSummary } = await supabase
        .from('business_metrics_summary')
        .select('*')
        .order('date', { ascending: true })
        .limit(12);

      const { data: dailyMetrics } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      const { data: apiPerformance } = await supabase
        .from('api_performance')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      // Process revenue data and projections
      const revenueData = businessSummary?.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Number(d.mrr) || 0,
        projection: (Number(d.mrr) || 0) * 1.15 // 15% growth projection
      })) || [];

      // Customer acquisition metrics (mock data based on available data)
      const customerMetrics = {
        cac: 85, // Customer Acquisition Cost in dollars
        ltv: 1250, // Lifetime Value in dollars
        ratio: 14.7 // LTV:CAC ratio
      };

      // Subscription conversion funnel
      const conversionFunnel = [
        { stage: 'Visitors', count: 12450, percentage: 100 },
        { stage: 'Sign-ups', count: 2100, percentage: 16.9 },
        { stage: 'Trial Users', count: 1890, percentage: 15.2 },
        { stage: 'Paid Conversion', count: 189, percentage: 1.5 },
        { stage: 'Long-term (6mo+)', count: 145, percentage: 1.2 }
      ];

      // Support metrics (mock data)
      const supportMetrics = {
        tickets: 23,
        avgResolution: 4.2, // hours
        satisfaction: 4.6 // out of 5
      };

      // System performance metrics from API data
      const avgResponseTime = apiPerformance?.reduce((sum, api) => sum + api.response_time_ms, 0) / (apiPerformance?.length || 1) || 0;
      const errorRate = apiPerformance?.filter(api => api.status_code >= 400).length / (apiPerformance?.length || 1) * 100 || 0;
      
      const systemPerformance = [
        { metric: 'API Response Time', value: avgResponseTime, target: 500, status: avgResponseTime < 500 ? 'good' : 'warning' },
        { metric: 'Error Rate', value: errorRate, target: 1, status: errorRate < 1 ? 'good' : 'critical' },
        { metric: 'Uptime', value: 99.8, target: 99.5, status: 'good' },
        { metric: 'Database Performance', value: 95, target: 90, status: 'good' }
      ];

      // Growth metrics over time
      const growthMetrics = businessSummary?.map((d, index) => {
        const prevMRR = index > 0 ? Number(businessSummary[index - 1]?.mrr) || 0 : 0;
        const currentMRR = Number(d.mrr) || 0;
        const growth = prevMRR > 0 ? ((currentMRR - prevMRR) / prevMRR) * 100 : 0;
        
        return {
          month: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
          mrr: currentMRR,
          churn: Number(d.churn_rate) || 0,
          growth: growth
        };
      }) || [];

      setBusinessData({
        revenueData,
        customerMetrics,
        conversionFunnel,
        supportMetrics,
        systemPerformance,
        growthMetrics
      });

      // Set current metrics
      const latestMetrics = businessSummary?.[businessSummary.length - 1];
      if (latestMetrics) {
        setCurrentMRR(Number(latestMetrics.mrr) || 0);
        const prevMRR = businessSummary.length > 1 ? Number(businessSummary[businessSummary.length - 2]?.mrr) || 0 : 0;
        const currentMRRValue = Number(latestMetrics.mrr) || 0;
        setGrowthRate(prevMRR > 0 ? ((currentMRRValue - prevMRR) / prevMRR) * 100 : 0);
      }
    } catch (error) {
      console.error('Error fetching business metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading business metrics...</div>;
  }

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    projection: { label: "Projection", color: "hsl(var(--chart-2))" },
    mrr: { label: "MRR", color: "hsl(var(--chart-3))" },
    churn: { label: "Churn Rate", color: "hsl(var(--chart-4))" },
    growth: { label: "Growth Rate", color: "hsl(var(--chart-5))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Metrics</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Financial & Operations</Badge>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV:CAC Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData?.customerMetrics.ratio.toFixed(1)}:1</div>
            <p className="text-xs text-muted-foreground">
              LTV ${businessData?.customerMetrics.ltv} / CAC ${businessData?.customerMetrics.cac}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData?.supportMetrics.tickets}</div>
            <p className="text-xs text-muted-foreground">
              Avg resolution: {businessData?.supportMetrics.avgResolution}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Tracking</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Tracking & Projections</CardTitle>
              <CardDescription>Monthly recurring revenue and growth projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={businessData?.revenueData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" fill="var(--color-revenue)" fillOpacity={0.6} stroke="var(--color-revenue)" strokeWidth={2} />
                    <Line type="monotone" dataKey="projection" stroke="var(--color-projection)" strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Conversion Funnel</CardTitle>
              <CardDescription>User journey from visitor to paid subscriber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessData?.conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{stage.stage}</div>
                        <div className="text-sm text-muted-foreground">{stage.percentage.toFixed(1)}% of total</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold">{stage.count.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">users</div>
                      </div>
                      <Progress value={stage.percentage} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics Over Time</CardTitle>
              <CardDescription>MRR growth, churn rate, and overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={businessData?.growthMetrics}>
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="mrr" fill="var(--color-mrr)" />
                    <Line yAxisId="right" type="monotone" dataKey="growth" stroke="var(--color-growth)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="churn" stroke="var(--color-churn)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators and system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Performance Metrics</h3>
                    {businessData?.systemPerformance.map((metric) => (
                      <div key={metric.metric} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{metric.metric}</div>
                          <div className="text-xs text-muted-foreground">
                            Target: {metric.metric.includes('Time') ? `${metric.target}ms` : 
                                   metric.metric.includes('Rate') ? `<${metric.target}%` : 
                                   `>${metric.target}%`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-bold">
                              {metric.metric.includes('Time') ? `${metric.value.toFixed(0)}ms` :
                               `${metric.value.toFixed(1)}%`}
                            </div>
                          </div>
                          <Badge variant={
                            metric.status === 'good' ? 'default' :
                            metric.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Support Metrics</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg border text-center">
                        <div className="text-2xl font-bold">{businessData?.supportMetrics.tickets}</div>
                        <div className="text-sm text-muted-foreground">Open Tickets</div>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <div className="text-2xl font-bold">{businessData?.supportMetrics.avgResolution}h</div>
                        <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <div className="text-2xl font-bold">{businessData?.supportMetrics.satisfaction}/5</div>
                        <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}